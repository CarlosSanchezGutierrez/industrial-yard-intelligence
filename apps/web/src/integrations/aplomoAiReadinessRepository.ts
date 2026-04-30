import { getAplomoSupabaseMvpClient } from "./aplomoSupabaseMvpRepository.js";
import {
  loadAplomoCustomerHealthSnapshotHistory,
  type AplomoCustomerHealthSnapshotRow,
} from "./aplomoCustomerHealthSnapshotRepository.js";
import {
  loadAplomoPlatformSupportWorkflowContext,
  type AplomoPlatformSupportWorkflowContext,
  type AplomoPlatformSupportWorkflowRow,
} from "./aplomoPlatformSupportWorkflowRepository.js";

export const aplomoAiPacketKinds = [
  "customer_success_context",
  "support_triage_context",
  "operations_summary_context",
  "data_readiness_context",
  "investor_summary_context",
  "internal_agent_context",
] as const;

export type AplomoAiPacketKind = (typeof aplomoAiPacketKinds)[number];

export const aplomoAiPacketStatuses = ["draft", "approved", "archived"] as const;

export type AplomoAiPacketStatus = (typeof aplomoAiPacketStatuses)[number];

export const aplomoAiPacketSensitivityLevels = [
  "public",
  "internal",
  "confidential",
  "restricted",
] as const;

export type AplomoAiPacketSensitivity =
  (typeof aplomoAiPacketSensitivityLevels)[number];

export type AplomoAiReadinessPacketRow = {
  id: string;
  company_id: string | null;
  created_by_profile_id: string;
  packet_kind: AplomoAiPacketKind;
  status: AplomoAiPacketStatus;
  sensitivity: AplomoAiPacketSensitivity;
  title: string;
  purpose: string;
  prompt_context: string;
  data_summary: Record<string, unknown>;
  governance_tags: string[];
  allowed_model_families: string[];
  redaction_notes: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AplomoCreateAiReadinessPacketInput = {
  companyId: string | null;
  packetKind: AplomoAiPacketKind;
  sensitivity: AplomoAiPacketSensitivity;
  title: string;
  purpose: string;
  promptContext: string;
  dataSummary: Record<string, unknown>;
  governanceTags: string[];
  allowedModelFamilies: string[];
  redactionNotes: string;
};

export type AplomoAiReadinessContext = {
  loadedAt: string;
  userId: string | null;
  email: string | null;
  supportContext: AplomoPlatformSupportWorkflowContext;
  healthSnapshots: AplomoCustomerHealthSnapshotRow[];
  packets: AplomoAiReadinessPacketRow[];
};

const throwIfError = (
  error: { message: string } | null,
  context: string,
): void => {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
};

const latestHealthForCompany = (
  rows: AplomoCustomerHealthSnapshotRow[],
  companyId: string,
): AplomoCustomerHealthSnapshotRow | null => {
  return [...rows]
    .filter((row) => row.company_id === companyId)
    .sort(
      (a, b) =>
        new Date(b.computed_at).getTime() - new Date(a.computed_at).getTime(),
    )[0] ?? null;
};

const openWorkflowsForCompany = (
  rows: AplomoPlatformSupportWorkflowRow[],
  companyId: string,
): AplomoPlatformSupportWorkflowRow[] => {
  const openStatuses = new Set(["open", "in_progress", "waiting_customer", "blocked"]);

  return rows.filter(
    (row) => row.company_id === companyId && openStatuses.has(row.status),
  );
};

const textList = (items: string[]): string => {
  if (items.length === 0) {
    return "none";
  }

  return items.join(", ");
};

export const loadAplomoAiReadinessContext =
  async (): Promise<AplomoAiReadinessContext> => {
    const supabase = getAplomoSupabaseMvpClient();

    const [userResult, supportContext, healthSnapshots, packetsResult] =
      await Promise.all([
        supabase.auth.getUser(),
        loadAplomoPlatformSupportWorkflowContext(),
        loadAplomoCustomerHealthSnapshotHistory(),
        supabase
          .from("aplomo_ai_readiness_packets")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
      ]);

    throwIfError(userResult.error, "read current user");
    throwIfError(packetsResult.error, "read AI readiness packets");

    return {
      loadedAt: new Date().toISOString(),
      userId: userResult.data.user?.id ?? null,
      email: userResult.data.user?.email ?? null,
      supportContext,
      healthSnapshots,
      packets: (packetsResult.data ?? []) as AplomoAiReadinessPacketRow[],
    };
  };

export const buildAplomoCustomerAiPromptContext = (input: {
  context: AplomoAiReadinessContext;
  companyId: string;
  packetKind: AplomoAiPacketKind;
}): {
  title: string;
  purpose: string;
  promptContext: string;
  dataSummary: Record<string, unknown>;
  governanceTags: string[];
  allowedModelFamilies: string[];
  redactionNotes: string;
} => {
  const company =
    input.context.supportContext.companies.find(
      (candidate) => candidate.id === input.companyId,
    ) ?? null;

  if (!company) {
    throw new Error("Company not found.");
  }

  const health = latestHealthForCompany(input.context.healthSnapshots, company.id);
  const workflows = openWorkflowsForCompany(
    input.context.supportContext.workflows,
    company.id,
  );
  const companySummary =
    input.context.supportContext.platformSnapshot.companySummaries.find(
      (summary) => summary.company.id === company.id,
    ) ?? null;

  const riskFactors = Array.isArray(health?.risk_factors)
    ? health.risk_factors
    : [];
  const recommendedActions = Array.isArray(health?.recommended_actions)
    ? health.recommended_actions
    : [];

  const workflowSummary = workflows.map((workflow) => ({
    id: workflow.id,
    status: workflow.status,
    priority: workflow.priority,
    riskLevel: workflow.risk_level,
    title: workflow.title,
    nextTouchAt: workflow.next_touch_at,
  }));

  const title = `AI readiness packet - ${company.name}`;
  const purpose =
    input.packetKind === "investor_summary_context"
      ? "Prepare a governed executive/investor-level summary without exposing restricted operational details."
      : "Prepare a governed internal AI context packet for Aplomo platform analysis and customer success support.";

  const promptContext = [
    "You are an internal Aplomo Systems AI assistant.",
    "Use only the structured context below.",
    "Do not invent facts.",
    "Do not expose raw secrets, credentials, private keys, tokens or personal data.",
    "Prefer operationally useful, concise and auditable recommendations.",
    "",
    `Company: ${company.name}`,
    `Company slug: ${company.slug}`,
    `Company status: ${company.status}`,
    `Packet kind: ${input.packetKind}`,
    "",
    "Latest customer health:",
    `- score: ${health?.score_total ?? "no snapshot"}`,
    `- band: ${health?.band ?? "no snapshot"}`,
    `- computed at: ${health?.computed_at ?? "no snapshot"}`,
    `- risk factors: ${textList(riskFactors)}`,
    `- recommended actions: ${textList(recommendedActions)}`,
    "",
    "Operational summary:",
    `- users: ${companySummary?.userCount ?? 0}`,
    `- active users: ${companySummary?.activeUserCount ?? 0}`,
    `- sites: ${companySummary?.siteCount ?? 0}`,
    `- devices: ${companySummary?.deviceCount ?? 0}`,
    `- live positions: ${companySummary?.livePositionCount ?? 0}`,
    `- high precision positions: ${companySummary?.highPrecisionPositionCount ?? 0}`,
    `- stockpiles: ${companySummary?.stockpileCount ?? 0}`,
    "",
    "Open support workflows:",
    workflows.length === 0
      ? "- none"
      : workflows
          .map(
            (workflow) =>
              `- ${workflow.title} | ${workflow.status} | ${workflow.priority} | ${workflow.risk_level}`,
          )
          .join("\n"),
    "",
    "Required output:",
    "1. Current customer state.",
    "2. Key risks.",
    "3. Recommended next actions.",
    "4. Data gaps.",
    "5. What should NOT be automated yet.",
  ].join("\n");

  return {
    title,
    purpose,
    promptContext,
    dataSummary: {
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        status: company.status,
      },
      health: health
        ? {
            scoreTotal: health.score_total,
            band: health.band,
            computedAt: health.computed_at,
            riskFactors,
            recommendedActions,
          }
        : null,
      operations: companySummary
        ? {
            users: companySummary.userCount,
            activeUsers: companySummary.activeUserCount,
            sites: companySummary.siteCount,
            devices: companySummary.deviceCount,
            livePositions: companySummary.livePositionCount,
            highPrecisionPositions: companySummary.highPrecisionPositionCount,
            stockpiles: companySummary.stockpileCount,
            estimatedVolumeM3: companySummary.estimatedVolumeM3,
            estimatedWeightTons: companySummary.estimatedWeightTons,
          }
        : null,
      workflows: workflowSummary,
    },
    governanceTags: [
      "internal_only",
      "no_secrets",
      "no_raw_credentials",
      "customer_success",
      "human_review_required",
    ],
    allowedModelFamilies: ["openai", "anthropic", "google"],
    redactionNotes:
      "Packet intentionally excludes credentials, service_role keys, raw tokens and private operational secrets. Review before sending to any third-party model.",
  };
};

export const createAplomoAiReadinessPacket = async (
  input: AplomoCreateAiReadinessPacketInput,
): Promise<AplomoAiReadinessPacketRow> => {
  const supabase = getAplomoSupabaseMvpClient();

  const userResult = await supabase.auth.getUser();
  throwIfError(userResult.error, "read current user");

  const user = userResult.data.user;

  if (!user) {
    throw new Error("Sign in before creating AI readiness packets.");
  }

  const now = new Date().toISOString();

  const result = await supabase
    .from("aplomo_ai_readiness_packets")
    .insert({
      company_id: input.companyId,
      created_by_profile_id: user.id,
      packet_kind: input.packetKind,
      status: "draft",
      sensitivity: input.sensitivity,
      title: input.title,
      purpose: input.purpose,
      prompt_context: input.promptContext,
      data_summary: input.dataSummary,
      governance_tags: input.governanceTags,
      allowed_model_families: input.allowedModelFamilies,
      redaction_notes: input.redactionNotes,
      metadata: {
        source: "aplomo_ai_readiness_layer",
      },
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  throwIfError(result.error, "create AI readiness packet");

  return result.data as AplomoAiReadinessPacketRow;
};

export const updateAplomoAiReadinessPacketStatus = async (input: {
  packetId: string;
  status: AplomoAiPacketStatus;
}): Promise<AplomoAiReadinessPacketRow> => {
  const supabase = getAplomoSupabaseMvpClient();

  const result = await supabase
    .from("aplomo_ai_readiness_packets")
    .update({
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.packetId)
    .select("*")
    .single();

  throwIfError(result.error, "update AI readiness packet status");

  return result.data as AplomoAiReadinessPacketRow;
};

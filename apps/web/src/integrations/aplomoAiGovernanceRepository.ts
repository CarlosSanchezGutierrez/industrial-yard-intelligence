import { getAplomoSupabaseMvpClient } from "./aplomoSupabaseMvpRepository.js";
import {
  loadAplomoAiReadinessContext,
  type AplomoAiReadinessContext,
} from "./aplomoAiReadinessRepository.js";

export const aplomoAiPromptStatuses = [
  "draft",
  "approved",
  "deprecated",
  "archived",
] as const;

export type AplomoAiPromptStatus = (typeof aplomoAiPromptStatuses)[number];

export const aplomoAiPromptSurfaces = [
  "aplomo_super_admin",
  "tenant_admin",
  "tenant_operations",
  "tenant_capture",
  "tenant_data_hub",
  "internal_dev_tools",
  "external_agent",
] as const;

export type AplomoAiPromptSurface = (typeof aplomoAiPromptSurfaces)[number];

export const aplomoAiGovernanceEventTypes = [
  "prompt_created",
  "prompt_approved",
  "prompt_deprecated",
  "packet_created",
  "packet_approved",
  "context_exported",
  "governance_review",
  "risk_flagged",
  "manual_note",
] as const;

export type AplomoAiGovernanceEventType =
  (typeof aplomoAiGovernanceEventTypes)[number];

export const aplomoAiGovernanceRiskLevels = [
  "none",
  "watch",
  "risk",
  "critical",
] as const;

export type AplomoAiGovernanceRiskLevel =
  (typeof aplomoAiGovernanceRiskLevels)[number];

export type AplomoAiPromptRegistryRow = {
  id: string;
  owner_profile_id: string;
  prompt_key: string;
  version: number;
  status: AplomoAiPromptStatus;
  surface: AplomoAiPromptSurface;
  sensitivity: "public" | "internal" | "confidential" | "restricted";
  title: string;
  description: string;
  system_prompt: string;
  user_prompt_template: string;
  required_context: Record<string, unknown>;
  allowed_model_families: string[];
  governance_tags: string[];
  approval_notes: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AplomoAiGovernanceEventRow = {
  id: string;
  actor_profile_id: string;
  company_id: string | null;
  readiness_packet_id: string | null;
  prompt_registry_id: string | null;
  event_type: AplomoAiGovernanceEventType;
  risk_level: AplomoAiGovernanceRiskLevel;
  event_summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AplomoAiGovernanceContext = {
  loadedAt: string;
  userId: string | null;
  email: string | null;
  readinessContext: AplomoAiReadinessContext;
  prompts: AplomoAiPromptRegistryRow[];
  events: AplomoAiGovernanceEventRow[];
};

export type AplomoCreateAiPromptInput = {
  promptKey: string;
  version: number;
  surface: AplomoAiPromptSurface;
  sensitivity: "public" | "internal" | "confidential" | "restricted";
  title: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  requiredContext: Record<string, unknown>;
  allowedModelFamilies: string[];
  governanceTags: string[];
};

export type AplomoCreateAiGovernanceEventInput = {
  companyId: string | null;
  readinessPacketId: string | null;
  promptRegistryId: string | null;
  eventType: AplomoAiGovernanceEventType;
  riskLevel: AplomoAiGovernanceRiskLevel;
  eventSummary: string;
  metadata?: Record<string, unknown>;
};

const throwIfError = (
  error: { message: string } | null,
  context: string,
): void => {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
};

const normalizeKey = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
};

export const loadAplomoAiGovernanceContext =
  async (): Promise<AplomoAiGovernanceContext> => {
    const supabase = getAplomoSupabaseMvpClient();

    const readinessContext = await loadAplomoAiReadinessContext();

    const [userResult, promptsResult, eventsResult] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from("aplomo_ai_prompt_registry")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("aplomo_ai_governance_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300),
    ]);

    throwIfError(userResult.error, "read current user");
    throwIfError(promptsResult.error, "read AI prompt registry");
    throwIfError(eventsResult.error, "read AI governance events");

    return {
      loadedAt: new Date().toISOString(),
      userId: userResult.data.user?.id ?? null,
      email: userResult.data.user?.email ?? null,
      readinessContext,
      prompts: (promptsResult.data ?? []) as AplomoAiPromptRegistryRow[],
      events: (eventsResult.data ?? []) as AplomoAiGovernanceEventRow[],
    };
  };

export const createAplomoAiGovernanceEvent = async (
  input: AplomoCreateAiGovernanceEventInput,
): Promise<AplomoAiGovernanceEventRow> => {
  const supabase = getAplomoSupabaseMvpClient();

  const userResult = await supabase.auth.getUser();
  throwIfError(userResult.error, "read current user");

  const user = userResult.data.user;

  if (!user) {
    throw new Error("Sign in before creating AI governance events.");
  }

  const result = await supabase
    .from("aplomo_ai_governance_events")
    .insert({
      actor_profile_id: user.id,
      company_id: input.companyId,
      readiness_packet_id: input.readinessPacketId,
      prompt_registry_id: input.promptRegistryId,
      event_type: input.eventType,
      risk_level: input.riskLevel,
      event_summary: input.eventSummary,
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  throwIfError(result.error, "create AI governance event");

  return result.data as AplomoAiGovernanceEventRow;
};

export const createAplomoAiPrompt = async (
  input: AplomoCreateAiPromptInput,
): Promise<AplomoAiPromptRegistryRow> => {
  const supabase = getAplomoSupabaseMvpClient();

  const userResult = await supabase.auth.getUser();
  throwIfError(userResult.error, "read current user");

  const user = userResult.data.user;

  if (!user) {
    throw new Error("Sign in before creating AI prompts.");
  }

  const now = new Date().toISOString();
  const promptKey = normalizeKey(input.promptKey);

  if (!promptKey) {
    throw new Error("promptKey is required.");
  }

  const result = await supabase
    .from("aplomo_ai_prompt_registry")
    .insert({
      owner_profile_id: user.id,
      prompt_key: promptKey,
      version: input.version,
      status: "draft",
      surface: input.surface,
      sensitivity: input.sensitivity,
      title: input.title,
      description: input.description,
      system_prompt: input.systemPrompt,
      user_prompt_template: input.userPromptTemplate,
      required_context: input.requiredContext,
      allowed_model_families: input.allowedModelFamilies,
      governance_tags: input.governanceTags,
      approval_notes: "",
      metadata: {
        source: "aplomo_ai_prompt_registry_mvp",
      },
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  throwIfError(result.error, "create AI prompt");

  const prompt = result.data as AplomoAiPromptRegistryRow;

  await createAplomoAiGovernanceEvent({
    companyId: null,
    readinessPacketId: null,
    promptRegistryId: prompt.id,
    eventType: "prompt_created",
    riskLevel:
      input.sensitivity === "restricted" || input.sensitivity === "confidential"
        ? "watch"
        : "none",
    eventSummary: `Prompt created: ${prompt.prompt_key} v${prompt.version}`,
    metadata: {
      promptKey: prompt.prompt_key,
      version: prompt.version,
      surface: prompt.surface,
      sensitivity: prompt.sensitivity,
    },
  });

  return prompt;
};

export const updateAplomoAiPromptStatus = async (input: {
  promptId: string;
  status: AplomoAiPromptStatus;
  approvalNotes: string;
}): Promise<AplomoAiPromptRegistryRow> => {
  const supabase = getAplomoSupabaseMvpClient();

  const result = await supabase
    .from("aplomo_ai_prompt_registry")
    .update({
      status: input.status,
      approval_notes: input.approvalNotes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.promptId)
    .select("*")
    .single();

  throwIfError(result.error, "update AI prompt status");

  const prompt = result.data as AplomoAiPromptRegistryRow;

  await createAplomoAiGovernanceEvent({
    companyId: null,
    readinessPacketId: null,
    promptRegistryId: prompt.id,
    eventType:
      input.status === "approved"
        ? "prompt_approved"
        : input.status === "deprecated"
          ? "prompt_deprecated"
          : "governance_review",
    riskLevel: "none",
    eventSummary: `Prompt status updated: ${prompt.prompt_key} v${prompt.version} -> ${input.status}`,
    metadata: {
      approvalNotes: input.approvalNotes,
      status: input.status,
    },
  });

  return prompt;
};

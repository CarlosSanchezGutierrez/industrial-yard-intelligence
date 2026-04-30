import { getAplomoSupabaseMvpClient } from "./aplomoSupabaseMvpRepository.js";
import {
  loadAplomoPlatformAdminSnapshot,
  type AplomoPlatformAdminSnapshot,
  type AplomoPlatformCompanyRow,
  type AplomoPlatformProfileRow,
} from "./aplomoSupabasePlatformAdminRepository.js";

export const aplomoSupportWorkflowStatuses = [
  "open",
  "in_progress",
  "waiting_customer",
  "blocked",
  "resolved",
  "archived",
] as const;

export type AplomoSupportWorkflowStatus =
  (typeof aplomoSupportWorkflowStatuses)[number];

export const aplomoSupportWorkflowPriorities = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;

export type AplomoSupportWorkflowPriority =
  (typeof aplomoSupportWorkflowPriorities)[number];

export const aplomoSupportWorkflowRiskLevels = [
  "none",
  "watch",
  "risk",
  "critical",
] as const;

export type AplomoSupportWorkflowRiskLevel =
  (typeof aplomoSupportWorkflowRiskLevels)[number];

export type AplomoPlatformSupportWorkflowRow = {
  id: string;
  company_id: string;
  created_by_profile_id: string;
  updated_by_profile_id: string | null;
  assigned_to_profile_id: string | null;
  status: AplomoSupportWorkflowStatus;
  priority: AplomoSupportWorkflowPriority;
  risk_level: AplomoSupportWorkflowRiskLevel;
  title: string;
  notes: string;
  next_touch_at: string | null;
  last_touch_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AplomoPlatformSupportWorkflowContext = {
  loadedAt: string;
  userId: string | null;
  email: string | null;
  platformRole: string;
  companies: AplomoPlatformCompanyRow[];
  profiles: AplomoPlatformProfileRow[];
  workflows: AplomoPlatformSupportWorkflowRow[];
  platformSnapshot: AplomoPlatformAdminSnapshot;
};

export type AplomoCreatePlatformSupportWorkflowInput = {
  companyId: string;
  assignedToProfileId: string | null;
  status: AplomoSupportWorkflowStatus;
  priority: AplomoSupportWorkflowPriority;
  riskLevel: AplomoSupportWorkflowRiskLevel;
  title: string;
  notes: string;
  nextTouchAt: string | null;
};

export type AplomoUpdatePlatformSupportWorkflowInput = {
  workflowId: string;
  status: AplomoSupportWorkflowStatus;
  priority: AplomoSupportWorkflowPriority;
  riskLevel: AplomoSupportWorkflowRiskLevel;
  assignedToProfileId: string | null;
  notes: string;
  nextTouchAt: string | null;
};

const throwIfError = (
  error: { message: string } | null,
  context: string,
): void => {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
};

export const loadAplomoPlatformSupportWorkflowContext =
  async (): Promise<AplomoPlatformSupportWorkflowContext> => {
    const supabase = getAplomoSupabaseMvpClient();

    const userResult = await supabase.auth.getUser();
    throwIfError(userResult.error, "read current user");

    const user = userResult.data.user ?? null;
    const platformSnapshot = await loadAplomoPlatformAdminSnapshot();

    const workflowsResult = await supabase
      .from("aplomo_platform_support_workflows")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(500);

    throwIfError(workflowsResult.error, "read support workflows");

    return {
      loadedAt: new Date().toISOString(),
      userId: user?.id ?? null,
      email: user?.email ?? null,
      platformRole: platformSnapshot.platformRole,
      companies: platformSnapshot.companies,
      profiles: platformSnapshot.profiles,
      workflows:
        (workflowsResult.data ?? []) as AplomoPlatformSupportWorkflowRow[],
      platformSnapshot,
    };
  };

export const createAplomoPlatformSupportWorkflow = async (
  input: AplomoCreatePlatformSupportWorkflowInput,
): Promise<AplomoPlatformSupportWorkflowRow> => {
  const supabase = getAplomoSupabaseMvpClient();

  const userResult = await supabase.auth.getUser();
  throwIfError(userResult.error, "read current user");

  const user = userResult.data.user;

  if (!user) {
    throw new Error("Sign in before creating support workflows.");
  }

  const now = new Date().toISOString();

  const result = await supabase
    .from("aplomo_platform_support_workflows")
    .insert({
      company_id: input.companyId,
      created_by_profile_id: user.id,
      updated_by_profile_id: user.id,
      assigned_to_profile_id: input.assignedToProfileId,
      status: input.status,
      priority: input.priority,
      risk_level: input.riskLevel,
      title: input.title,
      notes: input.notes,
      next_touch_at: input.nextTouchAt,
      last_touch_at: now,
      metadata: {
        source: "aplomo_super_admin_support_workflow",
      },
    })
    .select("*")
    .single();

  throwIfError(result.error, "create support workflow");

  return result.data as AplomoPlatformSupportWorkflowRow;
};

export const updateAplomoPlatformSupportWorkflow = async (
  input: AplomoUpdatePlatformSupportWorkflowInput,
): Promise<AplomoPlatformSupportWorkflowRow> => {
  const supabase = getAplomoSupabaseMvpClient();

  const userResult = await supabase.auth.getUser();
  throwIfError(userResult.error, "read current user");

  const user = userResult.data.user;

  if (!user) {
    throw new Error("Sign in before updating support workflows.");
  }

  const now = new Date().toISOString();

  const result = await supabase
    .from("aplomo_platform_support_workflows")
    .update({
      updated_by_profile_id: user.id,
      assigned_to_profile_id: input.assignedToProfileId,
      status: input.status,
      priority: input.priority,
      risk_level: input.riskLevel,
      notes: input.notes,
      next_touch_at: input.nextTouchAt,
      last_touch_at: now,
      updated_at: now,
    })
    .eq("id", input.workflowId)
    .select("*")
    .single();

  throwIfError(result.error, "update support workflow");

  return result.data as AplomoPlatformSupportWorkflowRow;
};

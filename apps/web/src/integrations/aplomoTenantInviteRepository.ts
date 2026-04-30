import { getAplomoSupabaseMvpClient } from "./aplomoSupabaseMvpRepository.js";

export const aplomoTenantInviteRoles = [
  "tenant_admin",
  "operations_manager",
  "site_supervisor",
  "capture_operator",
  "machine_operator",
  "analyst",
  "data_engineer",
  "data_scientist",
  "viewer",
] as const;

export type AplomoTenantInviteRole = (typeof aplomoTenantInviteRoles)[number];

export type AplomoTenantInviteUserInput = {
  companyId: string;
  email: string;
  displayName: string;
  tenantRole: AplomoTenantInviteRole;
  redirectTo?: string;
};

export type AplomoTenantInviteUserResult = {
  ok: boolean;
  mode: "email_invite_sent" | "existing_profile_membership_created";
  invitedUser: {
    id: string;
    email: string;
    displayName: string;
    tenantRole: string;
    status: string;
  };
};

export const inviteAplomoTenantUser = async (
  input: AplomoTenantInviteUserInput,
): Promise<AplomoTenantInviteUserResult> => {
  const supabase = getAplomoSupabaseMvpClient();
  const sessionResult = await supabase.auth.getSession();

  if (sessionResult.error) {
    throw new Error(`read session: ${sessionResult.error.message}`);
  }

  const accessToken = sessionResult.data.session?.access_token;

  if (!accessToken) {
    throw new Error("You must sign in before inviting users.");
  }

  const response = await fetch("/api/tenant-invite-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => null)) as
    | (AplomoTenantInviteUserResult & { error?: string })
    | null;

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error ?? `Invite failed with HTTP ${response.status}`);
  }

  return payload;
};

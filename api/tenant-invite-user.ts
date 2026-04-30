import { createClient } from "@supabase/supabase-js";

type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  on?: (event: string, callback: (chunk?: unknown) => void) => void;
};

type ApiResponse = {
  statusCode?: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

const tenantRoles = [
  "tenant_owner",
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

type TenantRole = (typeof tenantRoles)[number];

type InviteRequestBody = {
  companyId?: string;
  email?: string;
  displayName?: string;
  tenantRole?: string;
  redirectTo?: string;
};

const json = (
  response: ApiResponse,
  statusCode: number,
  payload: Record<string, unknown>,
): void => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
};

const getHeader = (
  headers: Record<string, string | string[] | undefined>,
  key: string,
): string => {
  const value = headers[key] ?? headers[key.toLowerCase()];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

const readRequestBody = async (request: ApiRequest): Promise<InviteRequestBody> => {
  if (typeof request.body === "string") {
    return JSON.parse(request.body || "{}") as InviteRequestBody;
  }

  if (request.body && typeof request.body === "object") {
    return request.body as InviteRequestBody;
  }

  if (typeof request.on !== "function") {
    return {};
  }

  const rawBody = await new Promise<string>((resolve, reject) => {
    let data = "";

    request.on?.("data", (chunk) => {
      data += String(chunk ?? "");
    });

    request.on?.("end", () => {
      resolve(data);
    });

    request.on?.("error", () => {
      reject(new Error("Failed to read request body."));
    });
  });

  if (!rawBody.trim()) {
    return {};
  }

  return JSON.parse(rawBody) as InviteRequestBody;
};

const normalizeEmail = (value: string | undefined): string => {
  return value?.trim().toLowerCase() ?? "";
};

const isTenantRole = (value: string | undefined): value is TenantRole => {
  return tenantRoles.includes(value as TenantRole);
};

const createAdminClient = () => {
  const supabaseUrl =
    process.env.SUPABASE_URL?.trim() ??
    process.env.VITE_SUPABASE_URL?.trim() ??
    "";

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing server env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

const canCallerManageUsers = async (
  admin: ReturnType<typeof createAdminClient>,
  callerProfileId: string,
  companyId: string,
): Promise<boolean> => {
  const { data: profile, error: profileError } = await admin
    .from("aplomo_profiles")
    .select("platform_role")
    .eq("id", callerProfileId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`read caller profile: ${profileError.message}`);
  }

  const platformRole = String(profile?.platform_role ?? "none");

  if (platformRole === "aplomo_owner" || platformRole === "aplomo_admin") {
    return true;
  }

  const { data: membership, error: membershipError } = await admin
    .from("aplomo_company_memberships")
    .select("role,status")
    .eq("company_id", companyId)
    .eq("profile_id", callerProfileId)
    .maybeSingle();

  if (membershipError) {
    throw new Error(`read caller membership: ${membershipError.message}`);
  }

  const role = String(membership?.role ?? "");
  const status = String(membership?.status ?? "");

  return (
    status === "active" &&
    (role === "tenant_owner" || role === "tenant_admin")
  );
};

const getExistingProfileByEmail = async (
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<{ id: string; email: string | null } | null> => {
  const { data, error } = await admin
    .from("aplomo_profiles")
    .select("id,email")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(`read existing profile: ${error.message}`);
  }

  return data as { id: string; email: string | null } | null;
};

const upsertProfileAndMembership = async (
  admin: ReturnType<typeof createAdminClient>,
  input: {
    profileId: string;
    companyId: string;
    email: string;
    displayName: string;
    tenantRole: TenantRole;
    status: "active" | "invited";
    source: string;
  },
): Promise<void> => {
  const profileResult = await admin.from("aplomo_profiles").upsert(
    {
      id: input.profileId,
      display_name: input.displayName,
      email: input.email,
      role: "user",
      platform_role: "none",
      metadata: {
        source: input.source,
      },
    },
    {
      onConflict: "id",
    },
  );

  if (profileResult.error) {
    throw new Error(`upsert invited profile: ${profileResult.error.message}`);
  }

  const membershipResult = await admin.from("aplomo_company_memberships").upsert(
    {
      company_id: input.companyId,
      profile_id: input.profileId,
      role: input.tenantRole,
      status: input.status,
      permissions_override: [],
      scope: {},
      metadata: {
        source: input.source,
        invitedEmail: input.email,
      },
    },
    {
      onConflict: "company_id,profile_id",
    },
  );

  if (membershipResult.error) {
    throw new Error(`upsert invited membership: ${membershipResult.error.message}`);
  }
};

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
): Promise<void> {
  try {
    if (request.method === "OPTIONS") {
      response.setHeader("Allow", "POST, OPTIONS");
      return json(response, 204, {});
    }

    if (request.method !== "POST") {
      response.setHeader("Allow", "POST, OPTIONS");
      return json(response, 405, {
        ok: false,
        error: "Method not allowed.",
      });
    }

    const authorization = getHeader(request.headers, "authorization");
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : "";

    if (!token) {
      return json(response, 401, {
        ok: false,
        error: "Missing bearer token.",
      });
    }

    const body = await readRequestBody(request);
    const companyId = body.companyId?.trim() ?? "";
    const email = normalizeEmail(body.email);
    const displayName = body.displayName?.trim() || email;
    const tenantRole = body.tenantRole;

    if (!companyId) {
      return json(response, 400, {
        ok: false,
        error: "companyId is required.",
      });
    }

    if (!email || !email.includes("@")) {
      return json(response, 400, {
        ok: false,
        error: "Valid email is required.",
      });
    }

    if (!isTenantRole(tenantRole)) {
      return json(response, 400, {
        ok: false,
        error: "Valid tenantRole is required.",
      });
    }

    const admin = createAdminClient();

    const userResult = await admin.auth.getUser(token);

    if (userResult.error || !userResult.data.user) {
      return json(response, 401, {
        ok: false,
        error: userResult.error?.message ?? "Invalid session.",
      });
    }

    const callerUser = userResult.data.user;
    const canManage = await canCallerManageUsers(admin, callerUser.id, companyId);

    if (!canManage) {
      return json(response, 403, {
        ok: false,
        error: "Caller cannot manage users for this company.",
      });
    }

    const existingProfile = await getExistingProfileByEmail(admin, email);

    if (existingProfile) {
      await upsertProfileAndMembership(admin, {
        profileId: existingProfile.id,
        companyId,
        email,
        displayName,
        tenantRole,
        status: "active",
        source: "service_role_existing_profile_invite",
      });

      return json(response, 200, {
        ok: true,
        mode: "existing_profile_membership_created",
        invitedUser: {
          id: existingProfile.id,
          email,
          displayName,
          tenantRole,
          status: "active",
        },
      });
    }

    const inviteResult = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        display_name: displayName,
        invited_company_id: companyId,
        invited_tenant_role: tenantRole,
      },
      redirectTo: body.redirectTo,
    });

    if (inviteResult.error || !inviteResult.data.user) {
      return json(response, 400, {
        ok: false,
        error: inviteResult.error?.message ?? "Invite failed.",
      });
    }

    const invitedUser = inviteResult.data.user;

    await upsertProfileAndMembership(admin, {
      profileId: invitedUser.id,
      companyId,
      email,
      displayName,
      tenantRole,
      status: "invited",
      source: "service_role_email_invite",
    });

    return json(response, 200, {
      ok: true,
      mode: "email_invite_sent",
      invitedUser: {
        id: invitedUser.id,
        email,
        displayName,
        tenantRole,
        status: "invited",
      },
    });
  } catch (error) {
    return json(response, 500, {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown server error.",
    });
  }
}

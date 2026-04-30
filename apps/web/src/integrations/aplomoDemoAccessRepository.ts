import { getAplomoSupabaseClient } from "./supabaseClient.js";

const supabaseAny = getAplomoSupabaseClient as any;

export interface AplomoDemoRoleAccount {
  accountKey: string;
  email: string;
  displayName: string;
  accountScope: "platform" | "tenant";
  platformRole: string;
  tenantRole: string;
  intendedEntrypoint: string;
  description: string;
}

export const APLOMO_DEMO_ROLE_ACCOUNTS: readonly AplomoDemoRoleAccount[] = [
  { accountKey: "platform_aplomo_owner", email: "demo+aplomo-owner@aplomodemo.test", displayName: "Demo Aplomo Owner", accountScope: "platform", platformRole: "aplomo_owner", tenantRole: "tenant_owner", intendedEntrypoint: "/aplomo-admin", description: "Control total de plataforma Aplomo." },
  { accountKey: "platform_aplomo_admin", email: "demo+aplomo-admin@aplomodemo.test", displayName: "Demo Aplomo Admin", accountScope: "platform", platformRole: "aplomo_admin", tenantRole: "tenant_admin", intendedEntrypoint: "/aplomo-admin", description: "Administración interna de plataforma." },
  { accountKey: "platform_aplomo_support", email: "demo+aplomo-support@aplomodemo.test", displayName: "Demo Aplomo Support", accountScope: "platform", platformRole: "aplomo_support", tenantRole: "viewer", intendedEntrypoint: "/aplomo-admin", description: "Soporte y customer success." },
  { accountKey: "platform_aplomo_viewer", email: "demo+aplomo-viewer@aplomodemo.test", displayName: "Demo Aplomo Viewer", accountScope: "platform", platformRole: "aplomo_viewer", tenantRole: "viewer", intendedEntrypoint: "/aplomo-admin", description: "Vista de solo lectura de plataforma." },
  { accountKey: "tenant_owner", email: "demo+tenant-owner@aplomodemo.test", displayName: "Demo Tenant Owner", accountScope: "tenant", platformRole: "none", tenantRole: "tenant_owner", intendedEntrypoint: "/aplomo-admin", description: "Dueño de empresa cliente." },
  { accountKey: "tenant_admin", email: "demo+tenant-admin@aplomodemo.test", displayName: "Demo Tenant Admin", accountScope: "tenant", platformRole: "none", tenantRole: "tenant_admin", intendedEntrypoint: "/aplomo-admin", description: "Administrador de tenant." },
  { accountKey: "operations_manager", email: "demo+operations-manager@aplomodemo.test", displayName: "Demo Operations Manager", accountScope: "tenant", platformRole: "none", tenantRole: "operations_manager", intendedEntrypoint: "/aplomo-admin", description: "Gerente de operaciones." },
  { accountKey: "site_supervisor", email: "demo+site-supervisor@aplomodemo.test", displayName: "Demo Site Supervisor", accountScope: "tenant", platformRole: "none", tenantRole: "site_supervisor", intendedEntrypoint: "/aplomo-admin", description: "Supervisor de patio/site." },
  { accountKey: "capture_operator", email: "demo+capture-operator@aplomodemo.test", displayName: "Demo Capture Operator", accountScope: "tenant", platformRole: "none", tenantRole: "capture_operator", intendedEntrypoint: "/aplomo-admin", description: "Capturista GPS/celular." },
  { accountKey: "machine_operator", email: "demo+machine-operator@aplomodemo.test", displayName: "Demo Machine Operator", accountScope: "tenant", platformRole: "none", tenantRole: "machine_operator", intendedEntrypoint: "/aplomo-admin", description: "Operador de maquinaria." },
  { accountKey: "viewer", email: "demo+viewer@aplomodemo.test", displayName: "Demo Viewer", accountScope: "tenant", platformRole: "none", tenantRole: "viewer", intendedEntrypoint: "/aplomo-admin", description: "Solo lectura tenant." }
];

export async function signInWithAplomoDemoAccount(email: string, password: string, redirectedTo = "/aplomo-admin") {
  const result = await supabaseAny.auth.signInWithPassword({ email, password });

  if (result.error) {
    throw new Error(result.error.message ?? "No se pudo iniciar sesión.");
  }

  return {
    email,
    redirectedTo
  };
}

export async function signOutAplomoDemoAccount(): Promise<void> {
  const result = await supabaseAny.auth.signOut();

  if (result.error) {
    throw new Error(result.error.message ?? "No se pudo cerrar sesión.");
  }
}

export async function getCurrentAplomoDemoSessionEmail(): Promise<string | null> {
  const result = await supabaseAny.auth.getSession();

  if (result.error) {
    return null;
  }

  return result.data?.session?.user?.email ?? null;
}
import { useEffect, useState, type CSSProperties } from "react";

import {
  inviteAplomoTenantUser,
  aplomoTenantInviteRoles,
  type AplomoTenantInviteRole,
} from "../integrations/aplomoTenantInviteRepository.js";
import {
  loadAplomoTenantAdminContext,
  type AplomoTenantAdminContext,
} from "../integrations/aplomoSupabaseTenantAdminRepository.js";

const styles = {
  panel: {
    border: "1px solid rgba(244, 114, 182, 0.34)",
    borderRadius: 22,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(157, 23, 77, 0.42))",
    color: "#e5e7eb",
    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.32)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  eyebrow: {
    margin: "0 0 6px",
    color: "#f9a8d4",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 950,
    letterSpacing: "-0.02em",
  },
  text: {
    margin: "8px 0 0",
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 10,
    marginTop: 16,
  },
  label: {
    display: "grid",
    gap: 6,
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: 800,
  },
  input: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.32)",
    background: "rgba(2, 6, 23, 0.72)",
    color: "#f8fafc",
    padding: "10px 12px",
    outline: "none",
  },
  buttonRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 12,
  },
  button: {
    border: 0,
    borderRadius: 12,
    padding: "10px 14px",
    background: "#f472b6",
    color: "#020617",
    fontWeight: 900,
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid rgba(148, 163, 184, 0.32)",
    borderRadius: 12,
    padding: "10px 14px",
    background: "rgba(15, 23, 42, 0.92)",
    color: "#e2e8f0",
    fontWeight: 800,
    cursor: "pointer",
  },
  card: {
    marginTop: 16,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(15, 23, 42, 0.72)",
  },
  pill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(244, 114, 182, 0.12)",
    color: "#f9a8d4",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  okPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(34, 197, 94, 0.12)",
    color: "#86efac",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  dangerPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(248, 113, 113, 0.12)",
    color: "#fca5a5",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  pre: {
    margin: "10px 0 0",
    whiteSpace: "pre-wrap",
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 1.5,
  },
} satisfies Record<string, CSSProperties>;

export function AplomoTenantInvitePanel() {
  const [context, setContext] = useState<AplomoTenantAdminContext | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tenantRole, setTenantRole] =
    useState<AplomoTenantInviteRole>("capture_operator");
  const [redirectTo, setRedirectTo] = useState("");
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const load = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      const result = await loadAplomoTenantAdminContext();
      setContext(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const invite = async () => {
    if (!context?.companyId) {
      setErrorMessage("No active company. Sign in and verify membership first.");
      return;
    }

    setIsBusy(true);
    setErrorMessage("");

    try {
      const result = await inviteAplomoTenantUser({
        companyId: context.companyId,
        email,
        displayName: displayName || email,
        tenantRole,
        ...(redirectTo.trim() ? { redirectTo: redirectTo.trim() } : {}),
      });

      setStatus(
        `Invite OK. Mode: ${result.mode}. User: ${result.invitedUser.email}. Status: ${result.invitedUser.status}.`,
      );
      setEmail("");
      setDisplayName("");
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section style={styles.panel} aria-label="Tenant user invite panel">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Tenant Invite MVP</p>
          <h2 style={styles.title}>Invitar usuarios por email</h2>
          <p style={styles.text}>
            Flujo seguro con backend service-role. El frontend envia la sesion del
            admin; el endpoint valida permisos y usa Supabase Auth Admin para invitar.
          </p>
        </div>

        <button
          type="button"
          style={styles.secondaryButton}
          disabled={isBusy}
          onClick={() => void load()}
        >
          Reload context
        </button>
      </div>

      <div style={styles.card}>
        <span style={styles.pill}>Company</span>
        <pre style={styles.pre}>
{`Company: ${context?.company?.name ?? "none"}
Company ID: ${context?.companyId ?? "none"}
Current user: ${context?.userId ?? "no session"}`}
        </pre>
      </div>

      <div style={styles.card}>
        <div style={styles.grid}>
          <label style={styles.label}>
            Email
            <input
              style={styles.input}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuario@empresa.com"
            />
          </label>

          <label style={styles.label}>
            Display name
            <input
              style={styles.input}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Nombre del usuario"
            />
          </label>

          <label style={styles.label}>
            Tenant role
            <select
              style={styles.input}
              value={tenantRole}
              onChange={(event) =>
                setTenantRole(event.target.value as AplomoTenantInviteRole)
              }
            >
              {aplomoTenantInviteRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Redirect URL opcional
            <input
              style={styles.input}
              value={redirectTo}
              onChange={(event) => setRedirectTo(event.target.value)}
              placeholder="https://aplomosystems.com"
            />
          </label>
        </div>

        <div style={styles.buttonRow}>
          <button
            type="button"
            style={styles.button}
            disabled={isBusy || !context?.companyId}
            onClick={() => void invite()}
          >
            {isBusy ? "Inviting..." : "Invite user"}
          </button>
        </div>

        <p style={styles.text}>
          Si el usuario ya existe en aplomo_profiles, se crea membership activa.
          Si no existe, se envia invitacion por email y queda como invited.
        </p>
      </div>

      {status ? (
        <div style={styles.card}>
          <span style={styles.okPill}>Status</span>
          <pre style={styles.pre}>{status}</pre>
        </div>
      ) : null}

      {errorMessage ? (
        <div style={styles.card}>
          <span style={styles.dangerPill}>Error</span>
          <pre style={styles.pre}>{errorMessage}</pre>
          <p style={styles.text}>
            Si el error dice missing server env vars, configura SUPABASE_URL y
            SUPABASE_SERVICE_ROLE_KEY en Vercel.
          </p>
        </div>
      ) : null}
    </section>
  );
}

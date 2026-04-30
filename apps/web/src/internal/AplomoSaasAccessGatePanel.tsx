import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { getAplomoSupabaseMvpClient } from "../integrations/aplomoSupabaseMvpRepository.js";
import {
  evaluateAplomoCurrentRouteAccess,
  loadAplomoSaasAccessState,
  resetAplomoSaasAccessStateCache,
  type AplomoSaasAccessState,
} from "./AplomoRouteScopedPanel.js";
import { getCurrentAplomoSaasRoute } from "./aplomoSaasRoutes.js";

const styles = {
  panel: {
    border: "1px solid rgba(34, 197, 94, 0.28)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.96), rgba(20, 83, 45, 0.32))",
    color: "#e5e7eb",
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
    color: "#86efac",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 950,
  },
  text: {
    margin: "8px 0 0",
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
    marginTop: 14,
  },
  card: {
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 14,
    padding: 12,
    background: "rgba(2, 6, 23, 0.42)",
  },
  label: {
    margin: 0,
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  value: {
    margin: "6px 0 0",
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: 850,
    wordBreak: "break-word",
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
    marginTop: 14,
  },
  inputLabel: {
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
    background: "#22c55e",
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
  okPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(34, 197, 94, 0.12)",
    color: "#86efac",
    fontSize: 11,
    fontWeight: 900,
  },
  dangerPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(248, 113, 113, 0.12)",
    color: "#fca5a5",
    fontSize: 11,
    fontWeight: 900,
  },
  warningPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(251, 191, 36, 0.12)",
    color: "#fde68a",
    fontSize: 11,
    fontWeight: 900,
  },
  pre: {
    margin: "10px 0 0",
    whiteSpace: "pre-wrap",
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 1.5,
  },
} satisfies Record<string, CSSProperties>;

const emptyAccessState = (): AplomoSaasAccessState => ({
  status: "loading",
  isAuthenticated: false,
  userId: null,
  email: null,
  platformRole: "none",
  activeCompanyIds: [],
  tenantRoles: [],
  errorMessage: null,
  loadedAt: new Date().toISOString(),
});

export function AplomoSaasAccessGatePanel() {
  const [access, setAccess] = useState<AplomoSaasAccessState>(emptyAccessState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const resolved = useMemo(() => getCurrentAplomoSaasRoute(), []);
  const decision = useMemo(() => evaluateAplomoCurrentRouteAccess(access), [access]);

  const load = async () => {
    setIsBusy(true);

    try {
      resetAplomoSaasAccessStateCache();
      const result = await loadAplomoSaasAccessState();
      setAccess(result);
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const signIn = async () => {
    setIsBusy(true);
    setStatusMessage("");

    try {
      const supabase = getAplomoSupabaseMvpClient();
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      setStatusMessage("Signed in. Reloading access context...");
      resetAplomoSaasAccessStateCache();
      window.location.reload();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unknown sign in error");
    } finally {
      setIsBusy(false);
    }
  };

  const signOut = async () => {
    setIsBusy(true);
    setStatusMessage("");

    try {
      const supabase = getAplomoSupabaseMvpClient();
      const result = await supabase.auth.signOut();

      if (result.error) {
        throw new Error(result.error.message);
      }

      setStatusMessage("Signed out.");
      resetAplomoSaasAccessStateCache();
      window.location.reload();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unknown sign out error");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section style={styles.panel} aria-label="Aplomo access gate">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Auth Access Gate MVP</p>
          <h2 style={styles.title}>
            {decision.allowed ? "Access granted" : "Access required"}
          </h2>
          <p style={styles.text}>
            Route access is now evaluated by session, platform role, tenant
            membership and tenant role.
          </p>
        </div>

        <span style={decision.allowed ? styles.okPill : styles.warningPill}>
          {decision.allowed ? "allowed" : "blocked"}
        </span>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <p style={styles.label}>Route</p>
          <p style={styles.value}>{resolved.route?.path ?? resolved.pathname}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.label}>Surface</p>
          <p style={styles.value}>{resolved.route?.surface ?? "none"}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.label}>User</p>
          <p style={styles.value}>{access.email ?? "not signed in"}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.label}>Platform role</p>
          <p style={styles.value}>{access.platformRole}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.label}>Tenant roles</p>
          <p style={styles.value}>
            {access.tenantRoles.length > 0 ? access.tenantRoles.join(", ") : "none"}
          </p>
        </div>
        <div style={styles.card}>
          <p style={styles.label}>Decision</p>
          <p style={styles.value}>{decision.reason}</p>
        </div>
      </div>

      {!access.isAuthenticated ? (
        <div style={styles.inputGrid}>
          <label style={styles.inputLabel}>
            Email
            <input
              style={styles.input}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@empresa.com"
            />
          </label>

          <label style={styles.inputLabel}>
            Password
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="password"
            />
          </label>
        </div>
      ) : null}

      <div style={styles.buttonRow}>
        {!access.isAuthenticated ? (
          <button
            type="button"
            style={styles.button}
            disabled={isBusy}
            onClick={() => void signIn()}
          >
            Sign in
          </button>
        ) : (
          <button
            type="button"
            style={styles.secondaryButton}
            disabled={isBusy}
            onClick={() => void signOut()}
          >
            Sign out
          </button>
        )}

        <button
          type="button"
          style={styles.secondaryButton}
          disabled={isBusy}
          onClick={() => void load()}
        >
          Reload access
        </button>
      </div>

      {!decision.allowed ? (
        <pre style={styles.pre}>
{`Required: ${decision.required}
Reason: ${decision.reason}`}
        </pre>
      ) : null}

      {access.status === "error" ? (
        <div style={{ marginTop: 12 }}>
          <span style={styles.dangerPill}>Access error</span>
          <pre style={styles.pre}>{access.errorMessage}</pre>
        </div>
      ) : null}

      {statusMessage ? <pre style={styles.pre}>{statusMessage}</pre> : null}
    </section>
  );
}

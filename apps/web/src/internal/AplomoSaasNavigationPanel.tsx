import { useMemo, type CSSProperties } from "react";

import {
  aplomoSaasRoutes,
  getCurrentAplomoSaasRoute,
} from "./aplomoSaasRoutes.js";

const styles = {
  shell: {
    border: "1px solid rgba(148, 163, 184, 0.24)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    background:
      "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.82))",
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
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 950,
    letterSpacing: "-0.03em",
  },
  text: {
    margin: "8px 0 0",
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 1.5,
    maxWidth: 900,
  },
  nav: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  link: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    border: "1px solid rgba(148, 163, 184, 0.28)",
    padding: "8px 12px",
    color: "#e2e8f0",
    background: "rgba(15, 23, 42, 0.86)",
    textDecoration: "none",
    fontSize: 12,
    fontWeight: 900,
  },
  activeLink: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    border: "1px solid rgba(96, 165, 250, 0.55)",
    padding: "8px 12px",
    color: "#020617",
    background: "#60a5fa",
    textDecoration: "none",
    fontSize: 12,
    fontWeight: 950,
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
    marginTop: 14,
  },
  metaCard: {
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 14,
    padding: 12,
    background: "rgba(2, 6, 23, 0.42)",
  },
  metaLabel: {
    margin: 0,
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  metaValue: {
    margin: "6px 0 0",
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: 850,
    wordBreak: "break-word",
  },
  warning: {
    marginTop: 14,
    borderRadius: 14,
    border: "1px solid rgba(251, 191, 36, 0.28)",
    background: "rgba(251, 191, 36, 0.08)",
    padding: 12,
    color: "#fde68a",
    fontSize: 12,
    lineHeight: 1.5,
  },
} satisfies Record<string, CSSProperties>;

export function AplomoSaasNavigationPanel() {
  const resolved = useMemo(() => getCurrentAplomoSaasRoute(), []);
  const activePath = resolved.route?.path ?? "/dev-tools";

  return (
    <section style={styles.shell} aria-label="Aplomo SaaS router shell">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Aplomo SaaS Shell</p>
          <h1 style={styles.title}>
            {resolved.route?.label ?? "Internal Console"}
          </h1>
          <p style={styles.text}>
            {resolved.route?.description ??
              "Internal validation console for the SaaS platform."}
          </p>
        </div>
      </div>

      <nav style={styles.nav} aria-label="Aplomo SaaS surfaces">
        {aplomoSaasRoutes.map((route) => (
          <a
            key={route.path}
            href={route.path}
            style={route.path === activePath ? styles.activeLink : styles.link}
          >
            {route.label}
          </a>
        ))}
        <a
          href="/?aplomoInternal=1"
          style={resolved.isLegacyQueryMode ? styles.activeLink : styles.link}
        >
          Legacy Internal
        </a>
      </nav>

      <div style={styles.metaGrid}>
        <div style={styles.metaCard}>
          <p style={styles.metaLabel}>Path</p>
          <p style={styles.metaValue}>{resolved.pathname}</p>
        </div>
        <div style={styles.metaCard}>
          <p style={styles.metaLabel}>Surface</p>
          <p style={styles.metaValue}>{resolved.route?.surface ?? "internal_dev_tools"}</p>
        </div>
        <div style={styles.metaCard}>
          <p style={styles.metaLabel}>Requires auth</p>
          <p style={styles.metaValue}>{resolved.route?.requiresAuth ? "yes" : "no"}</p>
        </div>
        <div style={styles.metaCard}>
          <p style={styles.metaLabel}>Internal only</p>
          <p style={styles.metaValue}>{resolved.route?.internalOnly ? "yes" : "no"}</p>
        </div>
      </div>

      <div style={styles.warning}>
        Router MVP active. This is still a shell: final behavior will hide or show
        panels by authenticated role, tenant membership and permission surface.
      </div>
    </section>
  );
}

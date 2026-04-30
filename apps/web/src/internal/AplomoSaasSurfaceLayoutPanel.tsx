import { useMemo, type CSSProperties } from "react";

import {
  getCurrentAplomoSaasRoute,
  type AplomoSaasRouteKind,
} from "./aplomoSaasRoutes.js";
import { useAplomoSaasAccessState } from "./AplomoRouteScopedPanel.js";

type SurfaceDefinition = {
  title: string;
  subtitle: string;
  audience: string;
  primaryGoal: string;
  moduleLabel: string;
  modules: string[];
  nextActions: string[];
  accent: "blue" | "teal" | "purple" | "amber" | "rose" | "slate";
};

const surfaceDefinitions: Record<AplomoSaasRouteKind, SurfaceDefinition> = {
  public_landing: {
    title: "Public Landing",
    subtitle: "Marketing and public product page.",
    audience: "Visitors and prospects",
    primaryGoal: "Explain the product and drive qualified demos.",
    moduleLabel: "Public",
    modules: ["Hero", "Product positioning", "CTA"],
    nextActions: ["Keep the public page separated from authenticated SaaS routes."],
    accent: "slate",
  },
  tenant_home: {
    title: "Tenant Home",
    subtitle: "Main customer portal overview.",
    audience: "Customer company users",
    primaryGoal: "Give each user a clean entry point into their permitted tools.",
    moduleLabel: "Customer Portal",
    modules: [
      "Company summary",
      "Recent operational activity",
      "Assigned tools by role",
      "Quick navigation",
    ],
    nextActions: [
      "Add role-based home cards.",
      "Add customer onboarding checklist.",
      "Add recent activity feed.",
    ],
    accent: "blue",
  },
  tenant_admin: {
    title: "Tenant Admin",
    subtitle: "Self-service administration for each customer company.",
    audience: "Tenant owners and tenant admins",
    primaryGoal:
      "Let customers manage users, roles, sites, devices, materials and stockpiles without asking Aplomo to customize code.",
    moduleLabel: "Administration",
    modules: [
      "User and role management",
      "Device catalog",
      "Sites, plants and yards",
      "Materials and stockpiles",
      "Tenant settings",
    ],
    nextActions: [
      "Add edit/delete flows.",
      "Add invite status management.",
      "Add audit logs for admin changes.",
    ],
    accent: "teal",
  },
  tenant_operations: {
    title: "Operations",
    subtitle: "Live yard and plant operations.",
    audience: "Operations managers, supervisors and plant leads",
    primaryGoal:
      "Monitor live device positions, operational alerts, site performance, GPS quality and stockpile activity.",
    moduleLabel: "Operations",
    modules: [
      "Live map",
      "Device health",
      "Operational alerts",
      "Site and plant performance",
      "Supervisor review tools",
    ],
    nextActions: [
      "Add alert resolution workflow.",
      "Add performance by site and shift.",
      "Add device uptime dashboard.",
    ],
    accent: "blue",
  },
  tenant_capture: {
    title: "Capture",
    subtitle: "Field capture and evidence tools.",
    audience: "Capturists, machine operators and supervisors",
    primaryGoal:
      "Capture GPS points, evidence and operational records with the minimum possible friction.",
    moduleLabel: "Field Capture",
    modules: [
      "Browser GPS capture",
      "Device check-in",
      "Stockpile boundary capture",
      "Evidence point capture",
      "Operator assignment flow",
    ],
    nextActions: [
      "Add mobile-first capture layout.",
      "Add offline queue.",
      "Add assigned work orders.",
    ],
    accent: "amber",
  },
  tenant_data_hub: {
    title: "Data Hub",
    subtitle: "Exports, integrations, BI and AI-ready data.",
    audience: "Analysts, data engineers and data scientists",
    primaryGoal:
      "Give technical customer teams governed access to exports, data products, connectors and AI tooling.",
    moduleLabel: "Data Platform",
    modules: [
      "Data products",
      "CSV / Excel / JSON exports",
      "Power BI-ready datasets",
      "Snowflake / Databricks connectors",
      "LLM tool governance",
    ],
    nextActions: [
      "Add export job UI.",
      "Add data product catalog.",
      "Add connector configuration flow.",
    ],
    accent: "purple",
  },
  aplomo_super_admin: {
    title: "Aplomo Super Admin",
    subtitle: "Internal cross-tenant platform console.",
    audience: "Aplomo founders, admins and support",
    primaryGoal:
      "Operate the SaaS platform across all customers with controlled support, visibility and auditing.",
    moduleLabel: "Platform Admin",
    modules: [
      "Companies and subscriptions",
      "Cross-tenant health",
      "Support diagnostics",
      "User support",
      "Platform audit trail",
    ],
    nextActions: [
      "Add company list.",
      "Add cross-tenant metrics.",
      "Add support impersonation policy design without unsafe impersonation.",
    ],
    accent: "rose",
  },
  internal_dev_tools: {
    title: "Internal Dev Tools",
    subtitle: "Development, validation and demo laboratory.",
    audience: "Aplomo technical team",
    primaryGoal:
      "Safely test new modules before promoting them into customer-facing routes.",
    moduleLabel: "Dev Lab",
    modules: [
      "Supabase MVP validation",
      "Experimental panels",
      "Simulation tools",
      "Data readiness checks",
      "Internal diagnostics",
    ],
    nextActions: [
      "Keep experimental features here before productizing.",
      "Promote stable tools into routed SaaS modules.",
      "Avoid exposing dev tools to customers.",
    ],
    accent: "slate",
  },
};

const accentStyles: Record<
  SurfaceDefinition["accent"],
  {
    border: string;
    background: string;
    chip: string;
    chipText: string;
  }
> = {
  blue: {
    border: "rgba(96, 165, 250, 0.34)",
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(30, 64, 175, 0.38))",
    chip: "rgba(96, 165, 250, 0.14)",
    chipText: "#bfdbfe",
  },
  teal: {
    border: "rgba(45, 212, 191, 0.34)",
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(15, 118, 110, 0.36))",
    chip: "rgba(45, 212, 191, 0.14)",
    chipText: "#99f6e4",
  },
  purple: {
    border: "rgba(192, 132, 252, 0.34)",
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(88, 28, 135, 0.38))",
    chip: "rgba(192, 132, 252, 0.14)",
    chipText: "#e9d5ff",
  },
  amber: {
    border: "rgba(251, 191, 36, 0.34)",
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(146, 64, 14, 0.34))",
    chip: "rgba(251, 191, 36, 0.14)",
    chipText: "#fde68a",
  },
  rose: {
    border: "rgba(244, 114, 182, 0.34)",
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(157, 23, 77, 0.36))",
    chip: "rgba(244, 114, 182, 0.14)",
    chipText: "#fbcfe8",
  },
  slate: {
    border: "rgba(148, 163, 184, 0.28)",
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(51, 65, 85, 0.42))",
    chip: "rgba(148, 163, 184, 0.14)",
    chipText: "#e2e8f0",
  },
};

const baseStyles = {
  shell: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    color: "#e5e7eb",
    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.32)",
  },
  header: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.8fr) minmax(280px, 0.8fr)",
    gap: 16,
    alignItems: "stretch",
  },
  eyebrow: {
    margin: "0 0 6px",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },
  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 950,
    letterSpacing: "-0.04em",
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 1.55,
    maxWidth: 920,
  },
  goal: {
    marginTop: 14,
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(2, 6, 23, 0.36)",
    color: "#e2e8f0",
    fontSize: 13,
    lineHeight: 1.55,
  },
  sideCard: {
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 18,
    padding: 14,
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
    margin: "7px 0 0",
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: 850,
    wordBreak: "break-word",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
    marginTop: 16,
  },
  card: {
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 16,
    padding: 13,
    background: "rgba(15, 23, 42, 0.62)",
  },
  cardText: {
    margin: 0,
    color: "#e2e8f0",
    fontSize: 13,
    lineHeight: 1.45,
    fontWeight: 780,
  },
  sectionTitle: {
    margin: "18px 0 0",
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: 950,
  },
  chip: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 11,
    fontWeight: 950,
  },
} satisfies Record<string, CSSProperties>;

export function AplomoSaasSurfaceLayoutPanel() {
  const resolved = useMemo(() => getCurrentAplomoSaasRoute(), []);
  const access = useAplomoSaasAccessState();

  const routeKind = resolved.route?.kind ?? "internal_dev_tools";
  const definition = surfaceDefinitions[routeKind];
  const accent = accentStyles[definition.accent];

  const shellStyle: CSSProperties = {
    ...baseStyles.shell,
    border: `1px solid ${accent.border}`,
    background: accent.background,
  };

  const chipStyle: CSSProperties = {
    ...baseStyles.chip,
    background: accent.chip,
    color: accent.chipText,
  };

  const eyebrowStyle: CSSProperties = {
    ...baseStyles.eyebrow,
    color: accent.chipText,
  };

  return (
    <section style={shellStyle} aria-label="Aplomo SaaS surface layout">
      <div style={baseStyles.header}>
        <div>
          <span style={chipStyle}>{definition.moduleLabel}</span>
          <p style={eyebrowStyle}>Surface Layout MVP</p>
          <h2 style={baseStyles.title}>{definition.title}</h2>
          <p style={baseStyles.subtitle}>{definition.subtitle}</p>
          <div style={baseStyles.goal}>
            <strong>Primary goal:</strong> {definition.primaryGoal}
          </div>
        </div>

        <aside style={baseStyles.sideCard}>
          <p style={baseStyles.label}>Audience</p>
          <p style={baseStyles.value}>{definition.audience}</p>

          <p style={{ ...baseStyles.label, marginTop: 14 }}>Signed user</p>
          <p style={baseStyles.value}>{access.email ?? "not signed in"}</p>

          <p style={{ ...baseStyles.label, marginTop: 14 }}>Platform role</p>
          <p style={baseStyles.value}>{access.platformRole}</p>

          <p style={{ ...baseStyles.label, marginTop: 14 }}>Tenant roles</p>
          <p style={baseStyles.value}>
            {access.tenantRoles.length > 0 ? access.tenantRoles.join(", ") : "none"}
          </p>
        </aside>
      </div>

      <h3 style={baseStyles.sectionTitle}>Modules in this surface</h3>
      <div style={baseStyles.grid}>
        {definition.modules.map((module) => (
          <div key={module} style={baseStyles.card}>
            <p style={baseStyles.cardText}>{module}</p>
          </div>
        ))}
      </div>

      <h3 style={baseStyles.sectionTitle}>Next product actions</h3>
      <div style={baseStyles.grid}>
        {definition.nextActions.map((action) => (
          <div key={action} style={baseStyles.card}>
            <p style={baseStyles.cardText}>{action}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

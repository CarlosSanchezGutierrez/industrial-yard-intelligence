import { useEffect, useState, type CSSProperties } from "react";

import {
  aplomoTenantAdminMembershipStatuses,
  aplomoTenantAdminRoles,
  createAplomoTenantDevice,
  createAplomoTenantMaterialType,
  createAplomoTenantSite,
  createAplomoTenantStockpile,
  loadAplomoTenantAdminContext,
  updateAplomoTenantMembership,
  type AplomoTenantAdminContext,
  type AplomoTenantAdminMembershipStatus,
  type AplomoTenantAdminRole,
} from "../integrations/aplomoSupabaseTenantAdminRepository.js";

const styles = {
  panel: {
    border: "1px solid rgba(20, 184, 166, 0.34)",
    borderRadius: 22,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(15, 118, 110, 0.42))",
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
    color: "#5eead4",
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
  button: {
    border: 0,
    borderRadius: 12,
    padding: "10px 14px",
    background: "#2dd4bf",
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
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
    gap: 10,
    marginTop: 16,
  },
  metricCard: {
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(15, 23, 42, 0.72)",
  },
  metricLabel: {
    margin: 0,
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  metricValue: {
    margin: "8px 0 0",
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: 950,
  },
  card: {
    marginTop: 16,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(15, 23, 42, 0.72)",
  },
  cardTitle: {
    margin: "0 0 10px",
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: 900,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 10,
    marginTop: 12,
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
  tableWrap: {
    marginTop: 16,
    overflowX: "auto",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 16,
    background: "rgba(2, 6, 23, 0.46)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 920,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#99f6e4",
    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px 12px",
    color: "#e2e8f0",
    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
    verticalAlign: "top",
  },
  pill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(45, 212, 191, 0.12)",
    color: "#99f6e4",
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
  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 11,
  },
} satisfies Record<string, CSSProperties>;

const emptyToNull = (value: string): string | null => {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
};

const numberOrNull = (value: string): number | null => {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number: ${value}`);
  }

  return parsed;
};

export function AplomoTenantAdminPanel() {
  const [context, setContext] = useState<AplomoTenantAdminContext | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [siteName, setSiteName] = useState("Nuevo patio");
  const [siteAddress, setSiteAddress] = useState("");
  const [siteLat, setSiteLat] = useState("");
  const [siteLng, setSiteLng] = useState("");

  const [materialName, setMaterialName] = useState("Nuevo material");
  const [materialCategory, setMaterialCategory] = useState("bulk_material");
  const [materialColor, setMaterialColor] = useState("#64748b");

  const [deviceName, setDeviceName] = useState("Nuevo dispositivo");
  const [deviceType, setDeviceType] = useState("phone");
  const [deviceRole, setDeviceRole] = useState("emitter");
  const [deviceProtocol, setDeviceProtocol] = useState("browser_geolocation");
  const [devicePhysicalLink, setDevicePhysicalLink] = useState("cellular");
  const [deviceIp, setDeviceIp] = useState("");
  const [deviceSiteId, setDeviceSiteId] = useState("");

  const [stockpileName, setStockpileName] = useState("Nuevo stockpile");
  const [stockpileSiteId, setStockpileSiteId] = useState("");
  const [stockpileMaterialId, setStockpileMaterialId] = useState("");
  const [stockpileVolume, setStockpileVolume] = useState("");
  const [stockpileWeight, setStockpileWeight] = useState("");
  const [stockpileLat, setStockpileLat] = useState("");
  const [stockpileLng, setStockpileLng] = useState("");

  const load = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      const result = await loadAplomoTenantAdminContext();
      setContext(result);

      if (!deviceSiteId && result.sites[0]) {
        setDeviceSiteId(result.sites[0].id);
      }

      if (!stockpileSiteId && result.sites[0]) {
        setStockpileSiteId(result.sites[0].id);
      }

      if (!stockpileMaterialId && result.materialTypes[0]) {
        setStockpileMaterialId(result.materialTypes[0].id);
      }

      setStatus("Tenant admin context loaded.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const companyId = context?.companyId ?? null;

  const createSite = async () => {
    if (!companyId) {
      setErrorMessage("No active company.");
      return;
    }

    setIsBusy(true);
    setErrorMessage("");

    try {
      await createAplomoTenantSite({
        companyId,
        name: siteName,
        kind: "industrial_yard",
        timezone: "America/Monterrey",
        latitude: numberOrNull(siteLat),
        longitude: numberOrNull(siteLng),
        address: emptyToNull(siteAddress),
      });

      setStatus("Site created.");
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  const createMaterial = async () => {
    if (!companyId) {
      setErrorMessage("No active company.");
      return;
    }

    setIsBusy(true);
    setErrorMessage("");

    try {
      await createAplomoTenantMaterialType({
        companyId,
        name: materialName,
        category: emptyToNull(materialCategory),
        hazardClass: null,
        color: emptyToNull(materialColor),
      });

      setStatus("Material created.");
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  const createDevice = async () => {
    if (!companyId) {
      setErrorMessage("No active company.");
      return;
    }

    setIsBusy(true);
    setErrorMessage("");

    try {
      await createAplomoTenantDevice({
        companyId,
        siteId: emptyToNull(deviceSiteId),
        name: deviceName,
        type: deviceType,
        role: deviceRole,
        protocol: emptyToNull(deviceProtocol),
        physicalLink: emptyToNull(devicePhysicalLink),
        ipAddress: emptyToNull(deviceIp),
        externalIdentifier: null,
      });

      setStatus("Device created.");
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  const createStockpile = async () => {
    if (!companyId) {
      setErrorMessage("No active company.");
      return;
    }

    setIsBusy(true);
    setErrorMessage("");

    try {
      await createAplomoTenantStockpile({
        companyId,
        siteId: emptyToNull(stockpileSiteId),
        materialTypeId: emptyToNull(stockpileMaterialId),
        name: stockpileName,
        estimatedVolumeM3: numberOrNull(stockpileVolume),
        estimatedWeightTons: numberOrNull(stockpileWeight),
        centroidLatitude: numberOrNull(stockpileLat),
        centroidLongitude: numberOrNull(stockpileLng),
      });

      setStatus("Stockpile created.");
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  const updateMembership = async (
    membershipId: string,
    role: AplomoTenantAdminRole,
    membershipStatus: AplomoTenantAdminMembershipStatus,
  ) => {
    if (!companyId) {
      setErrorMessage("No active company.");
      return;
    }

    setIsBusy(true);
    setErrorMessage("");

    try {
      await updateAplomoTenantMembership({
        companyId,
        membershipId,
        role,
        status: membershipStatus,
      });

      setStatus("Membership updated.");
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section style={styles.panel} aria-label="Tenant Admin Panel">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Tenant Admin MVP</p>
          <h2 style={styles.title}>Panel administrador de empresa</h2>
          <p style={styles.text}>
            Panel para que cada empresa administre sus usuarios, roles, sitios,
            dispositivos, materiales y stockpiles dentro de su propio tenant.
          </p>
        </div>

        <button type="button" style={styles.button} disabled={isBusy} onClick={() => void load()}>
          {isBusy ? "Loading..." : "Reload"}
        </button>
      </div>

      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Company</p>
          <p style={styles.metricValue}>{context?.company?.name ?? "none"}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Users</p>
          <p style={styles.metricValue}>{context?.memberships.length ?? 0}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Sites</p>
          <p style={styles.metricValue}>{context?.sites.length ?? 0}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Devices</p>
          <p style={styles.metricValue}>{context?.devices.length ?? 0}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Materials</p>
          <p style={styles.metricValue}>{context?.materialTypes.length ?? 0}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Stockpiles</p>
          <p style={styles.metricValue}>{context?.stockpiles.length ?? 0}</p>
        </div>
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
        </div>
      ) : null}

      {!context?.userId ? (
        <div style={styles.card}>
          <span style={styles.dangerPill}>No session</span>
          <p style={styles.text}>
            Sign in from the Supabase Write MVP panel before using tenant admin tools.
          </p>
        </div>
      ) : null}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Users and roles</h3>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Profile ID</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(context?.memberships ?? []).map((membership) => {
                let nextRole = membership.role;
                let nextStatus = membership.status;

                return (
                  <tr key={membership.id}>
                    <td style={{ ...styles.td, ...styles.mono }}>{membership.profile_id}</td>
                    <td style={styles.td}>
                      <select
                        style={styles.input}
                        defaultValue={membership.role}
                        onChange={(event) => {
                          nextRole = event.target.value as AplomoTenantAdminRole;
                        }}
                      >
                        {aplomoTenantAdminRoles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={styles.td}>
                      <select
                        style={styles.input}
                        defaultValue={membership.status}
                        onChange={(event) => {
                          nextStatus =
                            event.target.value as AplomoTenantAdminMembershipStatus;
                        }}
                      >
                        {aplomoTenantAdminMembershipStatuses.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={styles.td}>
                      <button
                        type="button"
                        style={styles.secondaryButton}
                        disabled={isBusy}
                        onClick={() => void updateMembership(membership.id, nextRole, nextStatus)}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={styles.text}>
          New user invitations will require a backend/service-role flow. This MVP can
          manage existing memberships safely through RLS.
        </p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Create site / yard / plant</h3>
        <div style={styles.grid}>
          <label style={styles.label}>
            Name
            <input style={styles.input} value={siteName} onChange={(event) => setSiteName(event.target.value)} />
          </label>
          <label style={styles.label}>
            Address
            <input style={styles.input} value={siteAddress} onChange={(event) => setSiteAddress(event.target.value)} />
          </label>
          <label style={styles.label}>
            Latitude
            <input style={styles.input} value={siteLat} onChange={(event) => setSiteLat(event.target.value)} />
          </label>
          <label style={styles.label}>
            Longitude
            <input style={styles.input} value={siteLng} onChange={(event) => setSiteLng(event.target.value)} />
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="button" style={styles.button} disabled={isBusy} onClick={() => void createSite()}>
            Create site
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Create material</h3>
        <div style={styles.grid}>
          <label style={styles.label}>
            Name
            <input style={styles.input} value={materialName} onChange={(event) => setMaterialName(event.target.value)} />
          </label>
          <label style={styles.label}>
            Category
            <input style={styles.input} value={materialCategory} onChange={(event) => setMaterialCategory(event.target.value)} />
          </label>
          <label style={styles.label}>
            Color
            <input style={styles.input} value={materialColor} onChange={(event) => setMaterialColor(event.target.value)} />
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="button" style={styles.button} disabled={isBusy} onClick={() => void createMaterial()}>
            Create material
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Create device</h3>
        <div style={styles.grid}>
          <label style={styles.label}>
            Name
            <input style={styles.input} value={deviceName} onChange={(event) => setDeviceName(event.target.value)} />
          </label>
          <label style={styles.label}>
            Site
            <select style={styles.input} value={deviceSiteId} onChange={(event) => setDeviceSiteId(event.target.value)}>
              <option value="">No site</option>
              {(context?.sites ?? []).map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </label>
          <label style={styles.label}>
            Type
            <input style={styles.input} value={deviceType} onChange={(event) => setDeviceType(event.target.value)} />
          </label>
          <label style={styles.label}>
            Role
            <input style={styles.input} value={deviceRole} onChange={(event) => setDeviceRole(event.target.value)} />
          </label>
          <label style={styles.label}>
            Protocol
            <input style={styles.input} value={deviceProtocol} onChange={(event) => setDeviceProtocol(event.target.value)} />
          </label>
          <label style={styles.label}>
            Physical link
            <input style={styles.input} value={devicePhysicalLink} onChange={(event) => setDevicePhysicalLink(event.target.value)} />
          </label>
          <label style={styles.label}>
            IP address
            <input style={styles.input} value={deviceIp} onChange={(event) => setDeviceIp(event.target.value)} />
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="button" style={styles.button} disabled={isBusy} onClick={() => void createDevice()}>
            Create device
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Create stockpile</h3>
        <div style={styles.grid}>
          <label style={styles.label}>
            Name
            <input style={styles.input} value={stockpileName} onChange={(event) => setStockpileName(event.target.value)} />
          </label>
          <label style={styles.label}>
            Site
            <select style={styles.input} value={stockpileSiteId} onChange={(event) => setStockpileSiteId(event.target.value)}>
              <option value="">No site</option>
              {(context?.sites ?? []).map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </label>
          <label style={styles.label}>
            Material
            <select style={styles.input} value={stockpileMaterialId} onChange={(event) => setStockpileMaterialId(event.target.value)}>
              <option value="">No material</option>
              {(context?.materialTypes ?? []).map((material) => (
                <option key={material.id} value={material.id}>
                  {material.name}
                </option>
              ))}
            </select>
          </label>
          <label style={styles.label}>
            Volume m3
            <input style={styles.input} value={stockpileVolume} onChange={(event) => setStockpileVolume(event.target.value)} />
          </label>
          <label style={styles.label}>
            Weight tons
            <input style={styles.input} value={stockpileWeight} onChange={(event) => setStockpileWeight(event.target.value)} />
          </label>
          <label style={styles.label}>
            Centroid lat
            <input style={styles.input} value={stockpileLat} onChange={(event) => setStockpileLat(event.target.value)} />
          </label>
          <label style={styles.label}>
            Centroid lng
            <input style={styles.input} value={stockpileLng} onChange={(event) => setStockpileLng(event.target.value)} />
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="button" style={styles.button} disabled={isBusy} onClick={() => void createStockpile()}>
            Create stockpile
          </button>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Entity</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Status / Type</th>
              <th style={styles.th}>ID</th>
            </tr>
          </thead>
          <tbody>
            {(context?.sites ?? []).map((site) => (
              <tr key={`site-${site.id}`}>
                <td style={styles.td}><span style={styles.pill}>site</span></td>
                <td style={styles.td}>{site.name}</td>
                <td style={styles.td}>{site.status}</td>
                <td style={{ ...styles.td, ...styles.mono }}>{site.id}</td>
              </tr>
            ))}
            {(context?.devices ?? []).map((device) => (
              <tr key={`device-${device.id}`}>
                <td style={styles.td}><span style={styles.pill}>device</span></td>
                <td style={styles.td}>{device.name}</td>
                <td style={styles.td}>{device.type}</td>
                <td style={{ ...styles.td, ...styles.mono }}>{device.id}</td>
              </tr>
            ))}
            {(context?.stockpiles ?? []).map((stockpile) => (
              <tr key={`stockpile-${stockpile.id}`}>
                <td style={styles.td}><span style={styles.pill}>stockpile</span></td>
                <td style={styles.td}>{stockpile.name}</td>
                <td style={styles.td}>{stockpile.status}</td>
                <td style={{ ...styles.td, ...styles.mono }}>{stockpile.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

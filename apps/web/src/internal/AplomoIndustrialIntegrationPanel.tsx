import { useMemo, type CSSProperties } from "react";

import {
  createAplomoDefaultDataInteroperabilityProfiles,
  createAplomoIndustrialIntegrationProfile,
  requiresAplomoGateway,
  supportsAplomoHighAccuracy,
} from "@iyi/domain";

import { useAplomoOperationsRuntime } from "./AplomoOperationsRuntime.js";

const styles = {
  panel: {
    border: "1px solid rgba(168, 85, 247, 0.28)",
    borderRadius: 22,
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(88, 28, 135, 0.48))",
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
    color: "#d8b4fe",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 10,
    marginTop: 16,
  },
  card: {
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
    background: "rgba(15, 23, 42, 0.72)",
  },
  cardTitle: {
    margin: "0 0 10px",
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: 900,
  },
  metric: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 7,
  },
  metricStrong: {
    color: "#f8fafc",
    fontWeight: 900,
    textAlign: "right",
  },
  sectionTitle: {
    margin: "20px 0 10px",
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: 900,
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 16,
    background: "rgba(2, 6, 23, 0.46)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 850,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#e9d5ff",
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
    background: "rgba(168, 85, 247, 0.14)",
    color: "#e9d5ff",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  goodPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(34, 197, 94, 0.12)",
    color: "#86efac",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  warningPill: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 8px",
    background: "rgba(251, 191, 36, 0.12)",
    color: "#fde68a",
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
  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 11,
  },
} satisfies Record<string, CSSProperties>;

const protocolLabels: Record<string, string> = {
  browser_geolocation: "Navegador GPS",
  mobile_native_location: "App móvil nativa",
  nmea_0183: "NMEA 0183",
  nmea_2000: "NMEA 2000",
  rtcm: "RTCM",
  ntrip: "NTRIP",
  mavlink: "MAVLink",
  mqtt: "MQTT",
  http_rest: "HTTP REST",
  websocket: "WebSocket",
  tcp_socket: "TCP socket",
  udp_datagram: "UDP datagram",
  bluetooth_gatt: "Bluetooth GATT",
  serial_text: "Serial texto",
  serial_binary: "Serial binario",
  vendor_sdk: "SDK propietario",
  vendor_cloud_api: "API cloud proveedor",
  csv_import: "CSV",
  geojson_import: "GeoJSON",
  manual: "Manual",
  unknown: "Desconocido",
};

const physicalLinkLabels: Record<string, string> = {
  none: "Ninguno",
  usb: "USB",
  usb_serial: "USB serial",
  rs232: "RS232",
  rs485: "RS485",
  bluetooth_classic: "Bluetooth clásico",
  bluetooth_ble: "Bluetooth BLE",
  wifi: "WiFi",
  ethernet: "Ethernet",
  cellular: "Red celular / 4G / 5G",
  radio_900mhz: "Radio 900 MHz",
  lora: "LoRa",
  satellite: "Satélite",
  manual_import: "Importación manual",
  vendor_cloud: "Cloud del proveedor",
  unknown: "Desconocido",
};

const patternLabels: Record<string, string> = {
  direct_browser: "Navegador directo",
  native_mobile_app: "App móvil nativa",
  desktop_agent: "Agente de escritorio",
  edge_gateway: "Gateway edge",
  iot_broker: "Broker IoT",
  vendor_cloud_bridge: "Puente cloud proveedor",
  file_import: "Importación de archivo",
  manual_entry: "Captura manual",
  simulation: "Simulación",
};

const labelOf = (labels: Record<string, string>, value: string): string => {
  return labels[value] ?? value;
};

export function AplomoIndustrialIntegrationPanel() {
  const { snapshot, selectedDeviceId } = useAplomoOperationsRuntime();

  const selectedDevice = useMemo(() => {
    if (selectedDeviceId === "all") {
      return snapshot.devices[0];
    }

    return snapshot.devices.find((device) => device.id === selectedDeviceId);
  }, [snapshot.devices, selectedDeviceId]);

  const integrationProfile = useMemo(() => {
    if (!selectedDevice) {
      return null;
    }

    return createAplomoIndustrialIntegrationProfile(selectedDevice.type);
  }, [selectedDevice]);

  const dataInteropProfiles = useMemo(() => {
    return createAplomoDefaultDataInteroperabilityProfiles();
  }, []);

  const featuredDataTargets = useMemo(() => {
    const targets = new Set([
      "excel",
      "power_bi",
      "snowflake",
      "databricks",
      "jupyter",
      "openai",
      "gemini",
      "claude",
      "custom_api",
    ]);

    return dataInteropProfiles.filter((profile) => targets.has(profile.target));
  }, [dataInteropProfiles]);

  if (!selectedDevice || !integrationProfile) {
    return (
      <section style={styles.panel}>
        <p style={styles.eyebrow}>Industrial Integration</p>
        <h2 style={styles.title}>Sin dispositivo seleccionado</h2>
      </section>
    );
  }

  const primary = integrationProfile.primaryAdapter;
  const needsGateway = requiresAplomoGateway(integrationProfile);
  const highAccuracy = supportsAplomoHighAccuracy(integrationProfile);

  return (
    <section style={styles.panel} aria-label="Perfil de integración industrial">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Industrial + Data Interoperability</p>
          <h2 style={styles.title}>Integración realista: {selectedDevice.name}</h2>
          <p style={styles.text}>
            Esta capa modela cómo se conectaría el dispositivo real al SaaS:
            navegador, app, gateway, NMEA, RTK/NTRIP, MAVLink, MQTT, SDK
            propietario, APIs externas y salida hacia herramientas de datos.
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Patrón recomendado</h3>
          <div style={styles.metric}>
            <span>Dispositivo</span>
            <strong style={styles.metricStrong}>{selectedDevice.type}</strong>
          </div>
          <div style={styles.metric}>
            <span>Compute class</span>
            <strong style={styles.metricStrong}>{integrationProfile.computeClass}</strong>
          </div>
          <div style={styles.metric}>
            <span>Patrón</span>
            <strong style={styles.metricStrong}>
              {labelOf(patternLabels, integrationProfile.recommendedPattern)}
            </strong>
          </div>
          <div style={styles.metric}>
            <span>Requiere gateway</span>
            <strong style={styles.metricStrong}>
              <span style={needsGateway ? styles.warningPill : styles.goodPill}>
                {needsGateway ? "sí" : "no"}
              </span>
            </strong>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Adaptador primario</h3>
          <div style={styles.metric}>
            <span>Protocolo</span>
            <strong style={styles.metricStrong}>
              {labelOf(protocolLabels, primary.protocol)}
            </strong>
          </div>
          <div style={styles.metric}>
            <span>Dirección</span>
            <strong style={styles.metricStrong}>{primary.direction}</strong>
          </div>
          <div style={styles.metric}>
            <span>Links físicos</span>
            <strong style={styles.metricStrong}>
              {primary.physicalLinks.map((link) => labelOf(physicalLinkLabels, link)).join(", ")}
            </strong>
          </div>
          <div style={styles.metric}>
            <span>Formatos</span>
            <strong style={styles.metricStrong}>{primary.payloadFormats.join(", ")}</strong>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Capacidades industriales</h3>
          <div style={styles.metric}>
            <span>Realtime</span>
            <strong style={styles.metricStrong}>
              <span style={primary.supportsRealtime ? styles.goodPill : styles.warningPill}>
                {primary.supportsRealtime ? "sí" : "no"}
              </span>
            </strong>
          </div>
          <div style={styles.metric}>
            <span>Alta precisión</span>
            <strong style={styles.metricStrong}>
              <span style={highAccuracy ? styles.goodPill : styles.warningPill}>
                {highAccuracy ? "sí" : "no"}
              </span>
            </strong>
          </div>
          <div style={styles.metric}>
            <span>Comandos</span>
            <strong style={styles.metricStrong}>
              <span style={primary.supportsCommands ? styles.goodPill : styles.warningPill}>
                {primary.supportsCommands ? "sí" : "no"}
              </span>
            </strong>
          </div>
          <div style={styles.metric}>
            <span>SDK propietario</span>
            <strong style={styles.metricStrong}>
              <span style={primary.requiresVendorSdk ? styles.warningPill : styles.goodPill}>
                {primary.requiresVendorSdk ? "sí" : "no"}
              </span>
            </strong>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Datos esperados</h3>
          <div style={styles.metric}>
            <span>GPS</span>
            <strong style={styles.metricStrong}>{integrationProfile.expectedData.gpsPosition ? "sí" : "no"}</strong>
          </div>
          <div style={styles.metric}>
            <span>RTK status</span>
            <strong style={styles.metricStrong}>{integrationProfile.expectedData.rtkStatus ? "sí" : "no"}</strong>
          </div>
          <div style={styles.metric}>
            <span>HDOP/VDOP</span>
            <strong style={styles.metricStrong}>{integrationProfile.expectedData.hdopVdop ? "sí" : "no"}</strong>
          </div>
          <div style={styles.metric}>
            <span>Raw payload</span>
            <strong style={styles.metricStrong}>{integrationProfile.expectedData.rawPayload ? "sí" : "no"}</strong>
          </div>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Adaptadores alternativos</h3>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Protocolo</th>
              <th style={styles.th}>Links físicos</th>
              <th style={styles.th}>Formatos</th>
              <th style={styles.th}>Gateway</th>
              <th style={styles.th}>Credenciales</th>
              <th style={styles.th}>SDK</th>
            </tr>
          </thead>
          <tbody>
            {integrationProfile.fallbackAdapters.map((adapter) => (
              <tr key={`${adapter.protocol}-${adapter.payloadFormats.join("-")}`}>
                <td style={styles.td}>{labelOf(protocolLabels, adapter.protocol)}</td>
                <td style={styles.td}>
                  {adapter.physicalLinks.map((link) => labelOf(physicalLinkLabels, link)).join(", ")}
                </td>
                <td style={styles.td}>{adapter.payloadFormats.join(", ")}</td>
                <td style={styles.td}>
                  <span style={adapter.requiresGateway ? styles.warningPill : styles.goodPill}>
                    {adapter.requiresGateway ? "sí" : "no"}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={adapter.requiresCredentials ? styles.warningPill : styles.goodPill}>
                    {adapter.requiresCredentials ? "sí" : "no"}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={adapter.requiresVendorSdk ? styles.warningPill : styles.goodPill}>
                    {adapter.requiresVendorSdk ? "sí" : "no"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={styles.sectionTitle}>Interoperabilidad de datos enterprise</h3>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Destino</th>
              <th style={styles.th}>Uso</th>
              <th style={styles.th}>Formatos</th>
              <th style={styles.th}>Entrega</th>
              <th style={styles.th}>Tier recomendado</th>
              <th style={styles.th}>Gobernanza</th>
              <th style={styles.th}>IA</th>
            </tr>
          </thead>
          <tbody>
            {featuredDataTargets.map((profile) => (
              <tr key={profile.id}>
                <td style={styles.td}>
                  <span style={styles.pill}>{profile.label}</span>
                </td>
                <td style={styles.td}>{profile.description}</td>
                <td style={styles.td}>{profile.supportedFormats.join(", ")}</td>
                <td style={styles.td}>{profile.deliveryModes.join(", ")}</td>
                <td style={styles.td}>{profile.recommendedTier}</td>
                <td style={styles.td}>
                  <span
                    style={
                      profile.requiresDataContract && profile.requiresLineage
                        ? styles.goodPill
                        : styles.warningPill
                    }
                  >
                    contract + lineage
                  </span>
                </td>
                <td style={styles.td}>
                  <span
                    style={
                      profile.requiresRedaction ? styles.warningPill : styles.goodPill
                    }
                  >
                    {profile.aiUsagePolicy}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={styles.sectionTitle}>Notas operativas y de IA</h3>
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Operación</h3>
          {integrationProfile.operationalNotes.map((note) => (
            <div key={note} style={styles.metric}>
              <span>•</span>
              <strong style={styles.metricStrong}>{note}</strong>
            </div>
          ))}
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>IA / Data science</h3>
          {integrationProfile.aiReadinessNotes.map((note) => (
            <div key={note} style={styles.metric}>
              <span>•</span>
              <strong style={styles.metricStrong}>{note}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

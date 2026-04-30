import { AplomoPlatformSupportWorkflowPanel } from "./AplomoPlatformSupportWorkflowPanel.js";
import { AplomoPlatformHealthTrendsPanel } from "./AplomoPlatformHealthTrendsPanel.js";
import { AplomoPlatformHealthExportPanel } from "./AplomoPlatformHealthExportPanel.js";
import { AplomoPlatformHealthSnapshotsPanel } from "./AplomoPlatformHealthSnapshotsPanel.js";
import { AplomoPlatformCustomerHealthPanel } from "./AplomoPlatformCustomerHealthPanel.js";
import { AplomoSuperAdminPanel } from "./AplomoSuperAdminPanel.js";
import { AplomoSaasSurfaceLayoutPanel } from "./AplomoSaasSurfaceLayoutPanel.js";
import { AplomoSaasAccessGatePanel } from "./AplomoSaasAccessGatePanel.js";
import { AplomoRouteScopedPanel } from "./AplomoRouteScopedPanel.js";
import { AplomoSaasNavigationPanel } from "./AplomoSaasNavigationPanel.js";
import { shouldMountAplomoSaasRoute } from "./aplomoSaasRoutes.js";
import { isolateAplomoInternalConsole } from "./aplomoInternalConsoleIsolation.js";
import { AplomoTenantInvitePanel } from "./AplomoTenantInvitePanel.js";
import { AplomoTenantAdminPanel } from "./AplomoTenantAdminPanel.js";
import { AplomoSupabaseLiveMapPanel } from "./AplomoSupabaseLiveMapPanel.js";
import { AplomoSupabaseGpsCapturePanel } from "./AplomoSupabaseGpsCapturePanel.js";
import { AplomoSupabaseMvpPanel } from "./AplomoSupabaseMvpPanel.js";
import { useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";

import { AplomoCloudSyncDevPanel } from "./AplomoCloudSyncDevPanel.js";
import { AplomoDataPlatformReadinessPanel } from "./AplomoDataPlatformReadinessPanel.js";
import { AplomoDeviceDetailPanel } from "./AplomoDeviceDetailPanel.js";
import { AplomoDeviceTimelinePanel } from "./AplomoDeviceTimelinePanel.js";
import { AplomoGovernedDataExportPanel } from "./AplomoGovernedDataExportPanel.js";
import { AplomoIndustrialIntegrationPanel } from "./AplomoIndustrialIntegrationPanel.js";
import { AplomoOperationalAlertsPanel } from "./AplomoOperationalAlertsPanel.js";
import { AplomoOperationalScorePanel } from "./AplomoOperationalScorePanel.js";
import { AplomoOperationsAdminPanel } from "./AplomoOperationsAdminPanel.js";
import { AplomoOperationsMapPanel } from "./AplomoOperationsMapPanel.js";
import { AplomoOperationsRuntimeProvider } from "./AplomoOperationsRuntime.js";
const shouldMountAplomoInternalTools = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);

  return shouldMountAplomoSaasRoute();
};


const hostId = "aplomo-internal-tools-root";
const storageKey = "aplomo_internal_tools";

const styles = {
  host: {
    position: "fixed",
    inset: 16,
    zIndex: 2147483647,
    overflow: "auto",
    pointerEvents: "auto",
  },
  shell: {
    display: "grid",
    gap: 14,
    maxWidth: 1320,
    margin: "0 auto",
  },
  closeButton: {
    width: "100%",
    border: "1px solid rgba(148, 163, 184, 0.32)",
    borderRadius: 12,
    padding: "10px 12px",
    background: "rgba(2, 6, 23, 0.96)",
    color: "#cbd5e1",
    fontWeight: 800,
    cursor: "pointer",
  },
} satisfies Record<string, CSSProperties>;

const readStoredFlag = (): boolean => {
  try {
    return window.localStorage.getItem(storageKey) === "1";
  } catch {
    return false;
  }
};

const writeStoredFlag = (value: boolean): void => {
  try {
    if (value) {
      window.localStorage.setItem(storageKey, "1");
    } else {
      window.localStorage.removeItem(storageKey);
    }
  } catch {
    // Local storage can be blocked. Ignore it.
  }
};

const shouldMountInternalTools = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("aplomoInternal") === "1";

  if (fromUrl) {
    writeStoredFlag(true);
    return true;
  }

  return readStoredFlag();
};

function AplomoInternalToolsShell() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return null;
  }

  return (
    <AplomoOperationsRuntimeProvider>
      <div style={styles.host}>
        <div style={styles.shell}>
          <button
            type="button"
            style={styles.closeButton}
            onClick={() => {
              writeStoredFlag(false);
              setIsOpen(false);
            }}
          >
            Cerrar herramientas internas
          </button>

          <AplomoSaasNavigationPanel />
          <AplomoSaasAccessGatePanel />
          <AplomoSaasSurfaceLayoutPanel />
          <AplomoRouteScopedPanel panelId="platform_admin">
            <AplomoSuperAdminPanel />
          <AplomoRouteScopedPanel panelId="platform_admin">
            <AplomoPlatformCustomerHealthPanel />
          <AplomoRouteScopedPanel panelId="platform_admin">
            <AplomoPlatformHealthSnapshotsPanel />
          <AplomoRouteScopedPanel panelId="platform_admin">
            <AplomoPlatformHealthExportPanel />
          <AplomoRouteScopedPanel panelId="platform_admin">
            <AplomoPlatformHealthTrendsPanel />
          <AplomoRouteScopedPanel panelId="platform_admin">
            <AplomoPlatformSupportWorkflowPanel />
          </AplomoRouteScopedPanel>
          </AplomoRouteScopedPanel>
          </AplomoRouteScopedPanel>
          </AplomoRouteScopedPanel>
          </AplomoRouteScopedPanel>
          </AplomoRouteScopedPanel>
          <AplomoRouteScopedPanel panelId="supabase_mvp">
            <AplomoSupabaseMvpPanel />
          </AplomoRouteScopedPanel>
          <AplomoRouteScopedPanel panelId="gps_capture">
            <AplomoSupabaseGpsCapturePanel />
          </AplomoRouteScopedPanel>
          <AplomoRouteScopedPanel panelId="live_map">
            <AplomoSupabaseLiveMapPanel />
          </AplomoRouteScopedPanel>
          <AplomoRouteScopedPanel panelId="tenant_admin">
            <AplomoTenantAdminPanel />
          </AplomoRouteScopedPanel>
          <AplomoRouteScopedPanel panelId="tenant_invite">
            <AplomoTenantInvitePanel />
          </AplomoRouteScopedPanel>
          <AplomoRouteScopedPanel panelId="operations_map">
            <AplomoOperationsMapPanel />
          </AplomoRouteScopedPanel>
          <AplomoOperationalScorePanel />
          <AplomoRouteScopedPanel panelId="operational_intelligence">
            <AplomoOperationalAlertsPanel />
          </AplomoRouteScopedPanel>
          <AplomoDataPlatformReadinessPanel />
          <AplomoGovernedDataExportPanel />
          <AplomoDeviceDetailPanel />
          <AplomoDeviceTimelinePanel />
          <AplomoIndustrialIntegrationPanel />
          <AplomoOperationsAdminPanel />
          <AplomoRouteScopedPanel panelId="cloud_sync_dev">
            <AplomoCloudSyncDevPanel />
          </AplomoRouteScopedPanel>
        </div>
      </div>
    </AplomoOperationsRuntimeProvider>
  );
}

export const mountAplomoInternalTools = (): void => {
    if (!shouldMountAplomoInternalTools()) {
    return;
  }

if (typeof document === "undefined") {
    return;
  }

  if (!shouldMountInternalTools()) {
    return;
  }

  if (document.getElementById(hostId)) {
    return;
  }

  const mount = () => {
    if (document.getElementById(hostId)) {
      return;
    }

    const host = document.createElement("div");
    host.id = hostId;
    isolateAplomoInternalConsole(host);
    document.body.appendChild(host);

    createRoot(host).render(<AplomoInternalToolsShell />);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
    return;
  }

  mount();
};

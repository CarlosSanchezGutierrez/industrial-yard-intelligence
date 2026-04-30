import { useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";

import { AplomoCloudSyncDevPanel } from "./AplomoCloudSyncDevPanel.js";
import { AplomoDeviceDetailPanel } from "./AplomoDeviceDetailPanel.js";
import { AplomoOperationsAdminPanel } from "./AplomoOperationsAdminPanel.js";
import { AplomoOperationsMapPanel } from "./AplomoOperationsMapPanel.js";
import { AplomoOperationsRuntimeProvider } from "./AplomoOperationsRuntime.js";

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

          <AplomoOperationsMapPanel />
          <AplomoDeviceDetailPanel />
          <AplomoOperationsAdminPanel />
          <AplomoCloudSyncDevPanel />
        </div>
      </div>
    </AplomoOperationsRuntimeProvider>
  );
}

export const mountAplomoInternalTools = (): void => {
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
    document.body.appendChild(host);

    createRoot(host).render(<AplomoInternalToolsShell />);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
    return;
  }

  mount();
};

import { useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";

import { AplomoCloudSyncDevPanel } from "./AplomoCloudSyncDevPanel.js";

const hostId = "aplomo-internal-tools-root";
const storageKey = "aplomo_internal_tools";

const styles = {
  host: {
    position: "fixed",
    right: 16,
    bottom: 16,
    zIndex: 2147483647,
    width: "min(440px, calc(100vw - 32px))",
    maxHeight: "calc(100dvh - 32px)",
    overflow: "auto",
  },
  closeButton: {
    width: "100%",
    marginBottom: 8,
    border: "1px solid rgba(148, 163, 184, 0.32)",
    borderRadius: 12,
    padding: "9px 12px",
    background: "rgba(2, 6, 23, 0.96)",
    color: "#cbd5e1",
    fontWeight: 700,
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
    <div style={styles.host}>
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

      <AplomoCloudSyncDevPanel />
    </div>
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

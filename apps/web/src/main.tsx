import { mountAplomoInternalTools } from "./internal/mountAplomoInternalTools.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";



import App from "./App.js";
import { installNamikiIntroOverlay } from "./namikiIntroOverlay.js";
import { AplomoDemoAccessLanding } from "./internal/AplomoDemoAccessLanding.js";


// APLOMO_ROOT_GATE_START
function AplomoRootGate() {
  const path = window.location.pathname;
  const appPrefixes = ["/aplomo-admin", "/admin", "/app"];
  const isAppPath = appPrefixes.some((prefix) => path === prefix || path.startsWith(prefix + "/"));

  if (!isAppPath) {
    return <AplomoDemoAccessLanding />;
  }

  return <AplomoRootGate />;
}
// APLOMO_ROOT_GATE_END

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element #root was not found.");
}

createRoot(rootElement).render(
    <StrictMode>
        <AplomoRootGate />
    </StrictMode>,
);

installNamikiIntroOverlay();

mountAplomoInternalTools();

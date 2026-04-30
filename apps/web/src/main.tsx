import { mountAplomoInternalTools } from "./internal/mountAplomoInternalTools.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";



import App from "./App.js";
import { installNamikiIntroOverlay } from "./namikiIntroOverlay.js";
import { AplomoDemoAccessLanding } from "./internal/AplomoDemoAccessLanding.js";


// APLOMO_ROOT_GATE_START
function AplomoRootGate() {
  const path = window.location.pathname;

  if (path === "/" || path === "/login" || path === "/demo" || path === "/welcome" || path === "/intro") {
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

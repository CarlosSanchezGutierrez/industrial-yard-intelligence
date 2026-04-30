import { StrictMode, createElement } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import { AplomoDemoAccessDock } from "./internal/AplomoDemoAccessDock.js";

function AplomoAppShell() {
  const path = window.location.pathname;
  const isAppPath = path === "/aplomo-admin" || path.startsWith("/aplomo-admin/");

  if (isAppPath) {
    return createElement("div", null, createElement(App), createElement(AplomoDemoAccessDock));
  }

  return createElement(AplomoDemoAccessLanding);
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found.");
}
const appShell = createElement(AplomoAppShell);

createRoot(rootElement).render(createElement(StrictMode, null, appShell));
const STYLE_ID = "aplomo-internal-console-isolation-style";

export const isolateAplomoInternalConsole = (container: HTMLElement): void => {
  const ownerDocument = container.ownerDocument;
  const html = ownerDocument.documentElement;
  const body = ownerDocument.body;

  html.classList.add("aplomo-internal-console-mode");
  body.classList.add("aplomo-internal-console-mode");

  container.id = container.id || "aplomo-internal-console-root";
  container.setAttribute("data-aplomo-internal-root", "true");

  const publicRoot = ownerDocument.getElementById("root");

  if (publicRoot && publicRoot !== container) {
    publicRoot.setAttribute("aria-hidden", "true");
  }

  Object.assign(container.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    overflow: "auto",
    background: "#020617",
    color: "#e5e7eb",
    padding: "24px",
    boxSizing: "border-box",
  });

  if (ownerDocument.getElementById(STYLE_ID)) {
    return;
  }

  const style = ownerDocument.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
html.aplomo-internal-console-mode,
body.aplomo-internal-console-mode {
  margin: 0 !important;
  min-height: 100% !important;
  background: #020617 !important;
  overflow: hidden !important;
}

body.aplomo-internal-console-mode > *:not([data-aplomo-internal-root="true"]):not(script):not(style) {
  display: none !important;
}

body.aplomo-internal-console-mode [data-aplomo-internal-root="true"] {
  display: block !important;
  visibility: visible !important;
  position: fixed !important;
  inset: 0 !important;
  z-index: 2147483647 !important;
  overflow: auto !important;
  background: #020617 !important;
  color: #e5e7eb !important;
  padding: 24px !important;
  box-sizing: border-box !important;
}

body.aplomo-internal-console-mode [data-aplomo-internal-root="true"] * {
  box-sizing: border-box;
}

@media (max-width: 768px) {
  body.aplomo-internal-console-mode [data-aplomo-internal-root="true"] {
    padding: 12px !important;
  }
}
`;

  ownerDocument.head.appendChild(style);
};

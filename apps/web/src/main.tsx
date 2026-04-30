import { StrictMode } from "react";
import { createRoot } from "react-dom/client";



import App from "./App.js";
import { NamikiAccessGate } from "./components/NamikiAccessGate.js";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element #root was not found.");
}

createRoot(rootElement).render(
    <StrictMode>
        <NamikiAccessGate>
            <App />
        </NamikiAccessGate>
    </StrictMode>,
);

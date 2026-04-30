import { AplomoDemoAccessDock } from "./AplomoDemoAccessDock.js";

export function AplomoDemoAccessLanding() {
  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc", padding: 32 }}>
      <h1>Aplomo Systems</h1>
      <p>Usa el boton flotante de acceso demo para entrar a la plataforma sin romper la pagina original.</p>
      <AplomoDemoAccessDock />
    </main>
  );
}
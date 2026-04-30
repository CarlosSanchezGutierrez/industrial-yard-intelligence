import { useEffect, useMemo, useState } from "react";
import {
  APLOMO_DEMO_ROLE_ACCOUNTS,
  getCurrentAplomoDemoSessionEmail,
  signInWithAplomoDemoAccount,
  signOutAplomoDemoAccount
} from "../integrations/aplomoDemoAccessRepository.js";

export function AplomoDemoAccessLanding() {
  const [selectedEmail, setSelectedEmail] = useState(APLOMO_DEMO_ROLE_ACCOUNTS[0]?.email ?? "");
  const [password, setPassword] = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [status, setStatus] = useState("Selecciona una cuenta demo e inicia sesión.");
  const [isLoading, setIsLoading] = useState(false);

  const selectedAccount = useMemo(
    () => APLOMO_DEMO_ROLE_ACCOUNTS.find((account) => account.email === selectedEmail) ?? APLOMO_DEMO_ROLE_ACCOUNTS[0],
    [selectedEmail]
  );

  useEffect(() => {
    void getCurrentAplomoDemoSessionEmail().then(setSessionEmail);
  }, []);

  async function login() {
    if (!selectedAccount) return;
    if (!password.trim()) {
      setStatus("Escribe la contraseña demo.");
      return;
    }
    setIsLoading(true);
    setStatus(Iniciando sesión como ...);
    try {
      const result = await signInWithAplomoDemoAccount(selectedAccount.email, password, selectedAccount.intendedEntrypoint);
      window.location.href = result.redirectedTo;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error desconocido.");
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    setIsLoading(true);
    try {
      await signOutAplomoDemoAccount();
      setSessionEmail(null);
      setStatus("Sesión cerrada.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error desconocido.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc" }}>
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)", gap: 28 }}>
          <div>
            <div style={{ display: "inline-flex", border: "1px solid rgba(148,163,184,.35)", borderRadius: 999, padding: "8px 12px", color: "#cbd5e1", fontSize: 13, marginBottom: 22 }}>
              Industrial Yard Intelligence · SaaS industrial
            </div>
            <h1 style={{ fontSize: 54, lineHeight: 1.02, margin: "0 0 18px", letterSpacing: "-0.04em" }}>Aplomo Systems</h1>
            <p style={{ fontSize: 19, lineHeight: 1.6, color: "#cbd5e1", maxWidth: 720 }}>Plataforma para patios industriales, stockpiles, GPS, dispositivos, datos, gobernanza, analítica e IA futura.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginTop: 24 }}>
              {["Multi-tenant", "RLS/RBAC", "GPS + devices", "Data governance", "Cloud ready"].map((item) => (
                <div key={item} style={{ border: "1px solid rgba(148,163,184,.28)", borderRadius: 16, padding: 14, background: "rgba(15,23,42,.78)" }}>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </div>
          <aside style={{ border: "1px solid rgba(148,163,184,.35)", borderRadius: 22, padding: 20, background: "#ffffff", color: "#0f172a" }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: .8 }}>Acceso demo</div>
            <h2 style={{ margin: "6px 0 12px", fontSize: 25 }}>Iniciar sesión</h2>
            {sessionEmail ? <div style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", borderRadius: 14, padding: 12, marginBottom: 14 }}>Sesión actual: <strong>{sessionEmail}</strong></div> : null}
            <label style={{ display: "block", fontSize: 13, fontWeight: 800, marginBottom: 6 }}>Cuenta demo</label>
            <select value={selectedEmail} onChange={(event) => setSelectedEmail(event.target.value)} disabled={isLoading} style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 12, padding: "11px 12px", marginBottom: 12 }}>
              {APLOMO_DEMO_ROLE_ACCOUNTS.map((account) => (
                <option key={account.accountKey} value={account.email}>{account.displayName} · {account.accountScope === "platform" ? account.platformRole : account.tenantRole}</option>
              ))}
            </select>
            <label style={{ display: "block", fontSize: 13, fontWeight: 800, marginBottom: 6 }}>Contraseña demo</label>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isLoading} placeholder="AplomoDemo-2026!" style={{ width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: 12, padding: "11px 12px", marginBottom: 12 }} />
            {selectedAccount ? <div style={{ border: "1px solid #e2e8f0", borderRadius: 14, padding: 12, background: "#f8fafc", marginBottom: 14 }}><strong>{selectedAccount.displayName}</strong><div style={{ fontSize: 13, color: "#475569", marginTop: 8 }}>{selectedAccount.description}</div><div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}><code>{selectedAccount.email}</code></div></div> : null}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={() => void login()} disabled={isLoading} style={{ border: 0, borderRadius: 12, padding: "11px 14px", background: "#111827", color: "#ffffff", fontWeight: 900 }}>Iniciar sesión</button>
              {sessionEmail ? <button type="button" onClick={() => void logout()} disabled={isLoading} style={{ border: "1px solid #fecaca", borderRadius: 12, padding: "11px 14px", background: "#fff1f2", color: "#991b1b", fontWeight: 800 }}>Cerrar sesión</button> : null}
            </div>
            <div style={{ marginTop: 14, color: "#475569", fontSize: 13 }}>{status}</div>
          </aside>
        </div>
        <section style={{ marginTop: 34 }}>
          <h2 style={{ fontSize: 24, margin: "0 0 14px" }}>Tipos de cuenta demo</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {APLOMO_DEMO_ROLE_ACCOUNTS.map((account) => (
              <button key={account.accountKey} type="button" onClick={() => setSelectedEmail(account.email)} style={{ textAlign: "left", border: selectedEmail === account.email ? "2px solid #38bdf8" : "1px solid rgba(148,163,184,.35)", borderRadius: 18, padding: 16, background: selectedEmail === account.email ? "rgba(14,165,233,.16)" : "rgba(15,23,42,.78)", color: "#f8fafc", cursor: "pointer" }}>
                <strong>{account.displayName}</strong>
                <div style={{ color: "#bae6fd", fontSize: 12, fontWeight: 900, marginTop: 4 }}>{account.accountScope === "platform" ? account.platformRole : account.tenantRole}</div>
                <div style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.5, marginTop: 8 }}>{account.description}</div>
                <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 10 }}>{account.email}</div>
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
import { useEffect, useMemo, useState } from "react";
import {
  APLOMO_DEMO_ROLE_ACCOUNTS,
  getCurrentAplomoDemoSessionEmail,
  signInWithAplomoDemoAccount,
  signOutAplomoDemoAccount
} from "../integrations/aplomoDemoAccessRepository.js";

export function AplomoDemoAccessDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(APLOMO_DEMO_ROLE_ACCOUNTS[0]?.email ?? "");
  const [password, setPassword] = useState("AplomoDemo-2026!");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [status, setStatus] = useState("Listo.");
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
    setIsLoading(true);
    setStatus("Iniciando sesion...");
    try {
      const result = await signInWithAplomoDemoAccount(selectedAccount.email, password, "/aplomo-admin");
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
      setStatus("Sesion cerrada.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error desconocido.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{ position: "fixed", right: 16, bottom: 16, zIndex: 2147483647, border: 0, borderRadius: 999, padding: "12px 16px", background: "#111827", color: "#ffffff", fontWeight: 900, boxShadow: "0 16px 40px rgba(0,0,0,.35)", cursor: "pointer" }}
      >
        Acceso demo
      </button>
    );
  }

  return (
    <aside style={{ position: "fixed", right: 16, bottom: 16, zIndex: 2147483647, width: 360, maxWidth: "calc(100vw - 32px)", border: "1px solid #cbd5e1", borderRadius: 18, padding: 16, background: "#ffffff", color: "#0f172a", boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10 }}>
        <strong>Acceso demo Aplomo</strong>
        <button type="button" onClick={() => setIsOpen(false)} style={{ border: "1px solid #cbd5e1", borderRadius: 999, background: "#fff", padding: "4px 8px", cursor: "pointer" }}>Cerrar</button>
      </div>
      {sessionEmail ? <div style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", borderRadius: 12, padding: 10, marginBottom: 10, fontSize: 13 }}>Sesion actual: <strong>{sessionEmail}</strong></div> : null}
      <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginBottom: 5 }}>Cuenta</label>
      <select value={selectedEmail} onChange={(event) => setSelectedEmail(event.target.value)} disabled={isLoading} style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 10, padding: "9px 10px", marginBottom: 10 }}>
        {APLOMO_DEMO_ROLE_ACCOUNTS.map((account) => (
          <option key={account.accountKey} value={account.email}>{account.displayName}</option>
        ))}
      </select>
      <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginBottom: 5 }}>Contrasena</label>
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isLoading} style={{ width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: 10, padding: "9px 10px", marginBottom: 10 }} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={() => void login()} disabled={isLoading} style={{ border: 0, borderRadius: 10, padding: "9px 12px", background: "#111827", color: "#fff", fontWeight: 900, cursor: "pointer" }}>Entrar a /aplomo-admin</button>
        {sessionEmail ? <button type="button" onClick={() => void logout()} disabled={isLoading} style={{ border: "1px solid #fecaca", borderRadius: 10, padding: "9px 12px", background: "#fff1f2", color: "#991b1b", fontWeight: 800, cursor: "pointer" }}>Salir</button> : null}
      </div>
      <div style={{ marginTop: 10, color: "#475569", fontSize: 12 }}>{status}</div>
    </aside>
  );
}
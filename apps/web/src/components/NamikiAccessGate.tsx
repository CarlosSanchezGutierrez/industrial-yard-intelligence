import { useState, type ReactNode } from "react";

import "../styles/namiki-access-gate.css";

type TenantId = "cooper-t-smith";

type TenantOption = {
    readonly id: TenantId;
    readonly name: string;
    readonly location: string;
    readonly status: string;
    readonly description: string;
};

const tenantOptions: readonly TenantOption[] = [
    {
        id: "cooper-t-smith",
        name: "Cooper/T. Smith",
        location: "Altamira, Tamaulipas",
        status: "Disponible",
        description: "Operación de patios industriales, materiales a granel, GPS, evidencia, auditoría y trabajo local sin internet.",
    },
];

const selectedTenant = tenantOptions[0]!;

function saveTenant(value: TenantId) {
    try {
        window.localStorage.setItem("namiki:tenant:selected", value);
    } catch {
        return;
    }
}

export function NamikiAccessGate({ children }: { readonly children: ReactNode }) {
    const [isUnlocked, setIsUnlocked] = useState(false);

    function enterSystem() {
        saveTenant(selectedTenant.id);
        setIsUnlocked(true);
    }

    if (isUnlocked) {
        return <>{children}</>;
    }

    return (
        <main className="nmk-access-screen" aria-label="Acceso Modelo Namiki">
            <section className="nmk-access-shell">
                <header className="nmk-access-topbar">
                    <div className="nmk-access-brand">
                        <span aria-hidden="true" />
                        <div>
                            <strong>Modelo Namiki</strong>
                            <p>Software de patios industriales</p>
                        </div>
                    </div>

                    <div className="nmk-access-status">MVP operativo</div>
                </header>

                <section className="nmk-access-main">
                    <div className="nmk-access-copy">
                        <p className="nmk-access-kicker">Bienvenido</p>
                        <h1>Sistema operativo visual para patios industriales.</h1>
                        <p className="nmk-access-lead">
                            Controla materiales, zonas, GPS, evidencia, perímetros, historial y sincronización desde una consola diseñada para operación en campo.
                        </p>

                        <div className="nmk-access-pills">
                            <span>Funciona local sin internet</span>
                            <span>GPS y mapa</span>
                            <span>Auditoría</span>
                            <span>Modo supervisor</span>
                        </div>

                        <div className="nmk-access-mini-grid">
                            <article>
                                <strong>Patio visible</strong>
                                <span>Zonas, pilas, materiales y movimientos.</span>
                            </article>
                            <article>
                                <strong>Captura de campo</strong>
                                <span>Ubicación, evidencia, precisión y perímetros.</span>
                            </article>
                            <article>
                                <strong>Sincronización</strong>
                                <span>Trabajo local primero, envío cuando haya conexión.</span>
                            </article>
                        </div>
                    </div>

                    <aside className="nmk-access-panel">
                        <div className="nmk-access-panel-head">
                            <div>
                                <p>Acceso empresarial</p>
                                <h2>Elige tu empresa</h2>
                            </div>
                            <span>1 disponible</span>
                        </div>

                        <label className="nmk-access-field">
                            <span>Empresa</span>
                            <select value={selectedTenant.id} disabled>
                                <option value={selectedTenant.id}>{selectedTenant.name}</option>
                            </select>
                        </label>

                        <article className="nmk-access-company-card">
                            <div>
                                <strong>{selectedTenant.name}</strong>
                                <span>{selectedTenant.status}</span>
                            </div>
                            <p>{selectedTenant.location}</p>
                            <small>{selectedTenant.description}</small>
                        </article>

                        <button className="nmk-access-enter" onClick={enterSystem} type="button">
                            Entrar al sistema
                        </button>

                        <div className="nmk-access-roadmap">
                            <article>
                                <strong>Próximamente</strong>
                                <span>Creación de cuentas de colaborador y administradores disponible.</span>
                            </article>
                            <article>
                                <strong>Próximamente</strong>
                                <span>App móvil para sistemas Android y iOS.</span>
                            </article>
                        </div>
                    </aside>
                </section>

                <section className="nmk-access-capabilities">
                    <article>
                        <span>01</span>
                        <strong>Inventario operativo</strong>
                        <p>Materiales visibles por patio, estado y responsable.</p>
                    </article>
                    <article>
                        <span>02</span>
                        <strong>GPS industrial</strong>
                        <p>Ubicación, precisión, perímetros y puntos de evidencia.</p>
                    </article>
                    <article>
                        <span>03</span>
                        <strong>Trabajo offline</strong>
                        <p>Captura local aunque la conexión no sea perfecta.</p>
                    </article>
                    <article>
                        <span>04</span>
                        <strong>Supervisión</strong>
                        <p>Recepción de capturas, revisión y sincronización.</p>
                    </article>
                </section>
            </section>
        </main>
    );
}
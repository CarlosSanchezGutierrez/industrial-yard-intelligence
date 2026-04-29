import { useMemo, useState, type ReactNode } from "react";

import "../styles/namiki-access-gate.css";

type TenantId = "cooper-t-smith";

type TenantOption = {
    readonly id: TenantId;
    readonly name: string;
    readonly location: string;
    readonly status: string;
    readonly description: string;
};

const accessStorageKey = "namiki:access-gate:v1";

const tenantOptions: readonly TenantOption[] = [
    {
        id: "cooper-t-smith",
        name: "Cooper/T. Smith",
        location: "Altamira, Tamaulipas",
        status: "Disponible",
        description: "Patios industriales, materiales a granel, GPS, evidencia, auditoría y operación local-first.",
    },
];

function readStoredTenant(): TenantId | null {
    try {
        const value = window.localStorage.getItem(accessStorageKey);

        return value === "cooper-t-smith" ? value : null;
    } catch {
        return null;
    }
}

function saveTenant(value: TenantId) {
    window.localStorage.setItem(accessStorageKey, value);
}

export function NamikiAccessGate({ children }: { readonly children: ReactNode }) {
    const [selectedTenant, setSelectedTenant] = useState<TenantId>("cooper-t-smith");
    const [isUnlocked, setIsUnlocked] = useState(() => readStoredTenant() !== null);

    const tenant = useMemo(
        () => tenantOptions.find((item) => item.id === selectedTenant) ?? tenantOptions[0]!,
        [selectedTenant],
    );

    function enterSystem() {
        saveTenant(selectedTenant);
        setIsUnlocked(true);
    }

    if (isUnlocked) {
        return <>{children}</>;
    }

    return (
        <main className="nmk-access-screen">
            <section className="nmk-access-shell">
                <div className="nmk-access-brandbar">
                    <div className="nmk-access-brand">
                        <span />
                        <div>
                            <strong>Modelo Namiki</strong>
                            <p>Software de patios industriales</p>
                        </div>
                    </div>

                    <div className="nmk-access-badge">
                        MVP local-first
                    </div>
                </div>

                <section className="nmk-access-hero">
                    <div className="nmk-access-copy">
                        <p className="nmk-access-kicker">Bienvenido</p>
                        <h1>Sistema operativo para patios industriales.</h1>
                        <p className="nmk-access-subtitle">
                            Controla materiales, ubicación, evidencia, GPS, perímetros, historial y sincronización desde una consola visual preparada para campo.
                        </p>

                        <div className="nmk-access-feature-row">
                            <span>Funciona local sin internet</span>
                            <span>GPS y mapa</span>
                            <span>Auditoría</span>
                            <span>Sincronización</span>
                        </div>
                    </div>

                    <aside className="nmk-access-card">
                        <div className="nmk-access-card-head">
                            <div>
                                <p>Acceso empresarial</p>
                                <h2>Elige tu empresa</h2>
                            </div>
                            <span>1 disponible</span>
                        </div>

                        <label className="nmk-access-field">
                            <span>Empresa</span>
                            <select
                                onChange={(event) => setSelectedTenant(event.target.value as TenantId)}
                                value={selectedTenant}
                            >
                                {tenantOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <article className="nmk-access-tenant-card">
                            <div>
                                <strong>{tenant.name}</strong>
                                <span>{tenant.status}</span>
                            </div>
                            <p>{tenant.location}</p>
                            <small>{tenant.description}</small>
                        </article>

                        <button className="nmk-access-enter" onClick={enterSystem} type="button">
                            Entrar al sistema
                        </button>

                        <div className="nmk-access-coming-soon">
                            <strong>Próximamente</strong>
                            <span>Creación de cuentas de colaborador y administradores disponible.</span>
                        </div>
                    </aside>
                </section>

                <section className="nmk-access-capabilities">
                    <article>
                        <span>01</span>
                        <strong>Patio visible</strong>
                        <p>Mapa operativo, zonas, materiales, equipos y movimientos.</p>
                    </article>
                    <article>
                        <span>02</span>
                        <strong>Captura de campo</strong>
                        <p>GPS, evidencia, dirección, precisión y perímetros desde cualquier dispositivo.</p>
                    </article>
                    <article>
                        <span>03</span>
                        <strong>Operación local-first</strong>
                        <p>Registro local, exportación, auditoría y sincronización cuando haya conexión.</p>
                    </article>
                    <article>
                        <span>04</span>
                        <strong>Supervisión</strong>
                        <p>Panel para recibir capturas, revisar estado y validar información crítica.</p>
                    </article>
                </section>
            </section>
        </main>
    );
}
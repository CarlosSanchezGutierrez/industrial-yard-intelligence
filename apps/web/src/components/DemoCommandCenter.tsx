const demoSteps = [
    {
        title: "1. Confirmar arquitectura",
        description: "Ejecutar architecture:check y architecture:gate para demostrar que el skeleton v1 esta cerrado.",
    },
    {
        title: "2. Levantar stack local",
        description: "Usar dev:stack:windows para iniciar Cloud API, Edge y cockpit web.",
    },
    {
        title: "3. Crear stockpile",
        description: "Registrar una pila de material desde el cockpit para probar captura operacional.",
    },
    {
        title: "4. Cambiar estado",
        description: "Actualizar lifecycle del stockpile usando reglas de dominio compartidas.",
    },
    {
        title: "5. Auditar mutacion",
        description: "Mostrar timeline y evidencia de cambios para trazabilidad industrial.",
    },
    {
        title: "6. Validar sync seguro",
        description: "Exportar paquete edge, previsualizar en cloud y confirmar que apply sigue bloqueado.",
    },
] as const;

const demoCommands = [
    "pnpm architecture:check",
    "pnpm architecture:gate -- -SkipInstall",
    "pnpm dev:stack:windows",
    "pnpm api:smoke",
    "pnpm demo:smoke",
    "pnpm sync:smoke",
    "pnpm architecture:runtime",
] as const;

function StatusPill({
    label,
    value,
}: {
    readonly label: string;
    readonly value: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
        </div>
    );
}

function DemoStepCard({
    title,
    description,
}: {
    readonly title: string;
    readonly description: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
    );
}

export function DemoCommandCenter() {
    return (
        <section className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-300">
                        Fase 2 / Demo cockpit
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                        Industrial Yard Intelligence demo command center
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                        Guia la presentacion del skeleton v1 hacia una demo vendible: arquitectura local-first,
                        stockpiles, lifecycle, auditoria y sync seguro edge-to-cloud.
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                        Baseline
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">architecture-v1-demo-baseline</p>
                    <p className="mt-1 text-sm text-slate-300">Siguiente foco: flujo operador y polish visual.</p>
                </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
                <StatusPill label="Arquitectura" value="V1 cerrada para demo" />
                <StatusPill label="Runtime" value="Edge + API + Web local" />
                <StatusPill label="Sync" value="Preview seguro, apply bloqueado" />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                            Flujo recomendado de demo
                        </h2>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        {demoSteps.map((step) => (
                            <DemoStepCard
                                key={step.title}
                                title={step.title}
                                description={step.description}
                            />
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                        Comandos de validacion
                    </h2>
                    <div className="mt-4 grid gap-2">
                        {demoCommands.map((command) => (
                            <code
                                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100"
                                key={command}
                            >
                                {command}
                            </code>
                        ))}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-300">
                        Este panel existe para que la demo no parezca una app suelta, sino una plataforma con
                        arquitectura verificable.
                    </p>
                </div>
            </div>
        </section>
    );
}
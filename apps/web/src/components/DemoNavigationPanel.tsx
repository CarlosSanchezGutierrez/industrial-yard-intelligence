const demoSections = [
    {
        label: "Arquitectura",
        title: "Baseline v1",
        description: "Explica local-first, cloud-ready, contratos compartidos y gates de validacion.",
        signal: "V1 cerrado",
    },
    {
        label: "Operacion",
        title: "Stockpile workflow",
        description: "Crear stockpile y cambiar estado para demostrar captura operacional.",
        signal: "Flujo operador",
    },
    {
        label: "Auditoria",
        title: "Mutation history",
        description: "Mostrar trazabilidad por evento y por stockpile especifico.",
        signal: "Evidencia",
    },
    {
        label: "Sync",
        title: "Edge to Cloud",
        description: "Probar export edge, preview cloud y apply bloqueado de forma segura.",
        signal: "Seguro",
    },
] as const;

const operatorFlow = [
    "Abrir cockpit con stack local activo.",
    "Revisar estado de Cloud API y Edge.",
    "Crear stockpile demo.",
    "Mover lifecycle a operational o pending_review.",
    "Abrir auditoria global.",
    "Abrir historial por stockpile.",
    "Validar Cloud Edge sync readiness.",
] as const;

function DemoSectionCard({
    label,
    title,
    description,
    signal,
}: {
    readonly label: string;
    readonly title: string;
    readonly description: string;
    readonly signal: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {label}
                </p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {signal}
                </span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
    );
}

export function DemoNavigationPanel() {
    return (
        <section data-iyi-section="overview" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Demo navigation
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                        Orden recomendado para vender la demo
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Esta seccion convierte el cockpit en una presentacion guiada: primero arquitectura,
                        luego operacion, despues auditoria y finalmente sync edge-to-cloud seguro.
                    </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        Demo posture
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-950">
                        Presentable para revision tecnica
                    </p>
                </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {demoSections.map((section) => (
                    <DemoSectionCard
                        key={section.title}
                        label={section.label}
                        title={section.title}
                        description={section.description}
                        signal={section.signal}
                    />
                ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Operator flow
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-slate-950">
                            Checklist de demostracion en vivo
                        </h3>
                    </div>
                    <p className="text-sm text-slate-600">Duracion objetivo: 5 a 8 minutos.</p>
                </div>

                <ol className="mt-4 grid gap-2 md:grid-cols-2">
                    {operatorFlow.map((step, index) => (
                        <li
                            className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700"
                            key={step}
                        >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                                {index + 1}
                            </span>
                            <span className="pt-1">{step}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
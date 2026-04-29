const workflowStages = [
    {
        step: "01",
        title: "Stack local",
        description: "Cloud API, Edge y Web cockpit activos para demo.",
        status: "ready",
    },
    {
        step: "02",
        title: "Captura stockpile",
        description: "Registrar material a granel como activo operacional.",
        status: "operator",
    },
    {
        step: "03",
        title: "Lifecycle",
        description: "Mover estado con reglas controladas del dominio.",
        status: "domain",
    },
    {
        step: "04",
        title: "Auditoria",
        description: "Mostrar historial de cambios y trazabilidad.",
        status: "audit",
    },
    {
        step: "05",
        title: "Sync seguro",
        description: "Previsualizar edge-to-cloud sin aplicar datos reales.",
        status: "sync",
    },
] as const;

const demoSignals = [
    {
        label: "Narrativa",
        value: "Local-first industrial SaaS",
    },
    {
        label: "Operacion",
        value: "Stockpiles + lifecycle",
    },
    {
        label: "Control",
        value: "Audit trail visible",
    },
    {
        label: "Escala",
        value: "Edge-to-cloud path",
    },
] as const;

function getStatusClasses(status: string): string {
    if (status === "ready") {
        return "border-emerald-200 bg-emerald-50 text-emerald-800";
    }

    if (status === "operator") {
        return "border-blue-200 bg-blue-50 text-blue-800";
    }

    if (status === "domain") {
        return "border-violet-200 bg-violet-50 text-violet-800";
    }

    if (status === "audit") {
        return "border-amber-200 bg-amber-50 text-amber-800";
    }

    return "border-slate-200 bg-slate-50 text-slate-800";
}

function WorkflowStageCard({
    step,
    title,
    description,
    status,
}: {
    readonly step: string;
    readonly title: string;
    readonly description: string;
    readonly status: string;
}) {
    return (
        <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold ${getStatusClasses(status)}`}>
                    {step}
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                </div>
            </div>
        </div>
    );
}

function SignalCard({
    label,
    value,
}: {
    readonly label: string;
    readonly value: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
        </div>
    );
}

export function OperatorWorkflowProgressPanel() {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Operator workflow
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                        Flujo de demostracion industrial
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Este flujo resume el camino que debe ver Cooper/T. Smith: del stack local a la captura,
                        lifecycle, auditoria y sincronizacion segura entre edge y cloud.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                        Demo objective
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                        Que el evaluador entienda valor operativo en menos de 8 minutos.
                    </p>
                </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {workflowStages.map((stage) => (
                    <WorkflowStageCard
                        key={stage.step}
                        step={stage.step}
                        title={stage.title}
                        description={stage.description}
                        status={stage.status}
                    />
                ))}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
                {demoSignals.map((signal) => (
                    <SignalCard key={signal.label} label={signal.label} value={signal.value} />
                ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Presenter line
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                    Modelo Namiki no solo registra pilas de material; crea una capa de inteligencia operacional
                    auditable, local-first y preparada para escalar como plataforma SaaS industrial.
                </p>
            </div>
        </section>
    );
}
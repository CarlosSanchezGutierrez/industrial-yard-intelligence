const sections = [
    {
        href: "#demo-command-center",
        label: "Inicio",
        title: "Command center",
        description: "Baseline, comandos y narrativa principal.",
    },
    {
        href: "#runtime-status",
        label: "Runtime",
        title: "Estado local",
        description: "Cloud API, Edge y Sync vivos.",
    },
    {
        href: "#industrial-value",
        label: "Negocio",
        title: "Valor industrial",
        description: "Traduce la demo tecnica a valor ejecutivo.",
    },
    {
        href: "#stockpile-summary",
        label: "Operacion",
        title: "Stockpiles",
        description: "Inventario, estados y material en patio.",
    },
    {
        href: "#audit-story",
        label: "Auditoria",
        title: "Timeline",
        description: "Trazabilidad de cambios por evento.",
    },
    {
        href: "#sync-story",
        label: "Sync",
        title: "Edge to Cloud",
        description: "Export, preview y apply bloqueado.",
    },
    {
        href: "#yard-map",
        label: "Mapa",
        title: "Patio",
        description: "Vista conceptual fisico-digital.",
    },
] as const;

function SectionLinkCard({
    href,
    label,
    title,
    description,
}: {
    readonly href: string;
    readonly label: string;
    readonly title: string;
    readonly description: string;
}) {
    return (
        <a
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            href={href}
        >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {label}
            </p>
            <h3 className="mt-2 text-sm font-semibold text-slate-950 group-hover:text-slate-700">
                {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </a>
    );
}

export function CockpitSectionNavigationPanel() {
    return (
        <section data-iyi-section="overview" id="cockpit-section-navigation" className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Cockpit sections
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                        Navegacion rapida para demo
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Usa estos accesos para presentar sin hacer scroll infinito. La demo queda ordenada
                        por arquitectura, runtime, negocio, operacion, auditoria, sync y patio.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Presenter mode
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                        Orden recomendado de izquierda a derecha.
                    </p>
                </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {sections.map((section) => (
                    <SectionLinkCard
                        key={section.href}
                        href={section.href}
                        label={section.label}
                        title={section.title}
                        description={section.description}
                    />
                ))}
            </div>
        </section>
    );
}
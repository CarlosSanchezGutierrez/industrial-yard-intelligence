const yardZones = [
    {
        id: "A1",
        name: "Patio A / Descarga",
        material: "Coque / mineral",
        status: "Recepcion",
        position: "left-8 top-10",
        size: "h-24 w-32",
        tone: "bg-blue-100 border-blue-300 text-blue-950",
    },
    {
        id: "B2",
        name: "Patio B / Stockpile",
        material: "Material validado",
        status: "Operacional",
        position: "left-44 top-20",
        size: "h-32 w-40",
        tone: "bg-emerald-100 border-emerald-300 text-emerald-950",
    },
    {
        id: "C3",
        name: "Patio C / Revision",
        material: "Pendiente inspeccion",
        status: "Review",
        position: "right-10 top-12",
        size: "h-28 w-36",
        tone: "bg-amber-100 border-amber-300 text-amber-950",
    },
    {
        id: "D4",
        name: "Patio D / Archivo",
        material: "Cierre operativo",
        status: "Archivado",
        position: "left-20 bottom-10",
        size: "h-24 w-36",
        tone: "bg-slate-100 border-slate-300 text-slate-950",
    },
    {
        id: "E5",
        name: "Patio E / Buffer",
        material: "Zona flexible",
        status: "Draft",
        position: "right-24 bottom-12",
        size: "h-28 w-40",
        tone: "bg-violet-100 border-violet-300 text-violet-950",
    },
] as const;

const operationFlows = [
    {
        label: "1. Descarga",
        detail: "Material entra desde muelle o transporte interno.",
    },
    {
        label: "2. Registro",
        detail: "Operador crea stockpile y evidencia inicial.",
    },
    {
        label: "3. Seguimiento",
        detail: "Supervisor revisa estado y cambios.",
    },
    {
        label: "4. Auditoria",
        detail: "Historial queda visible por stockpile.",
    },
    {
        label: "5. Sync",
        detail: "Edge exporta paquete para preview cloud.",
    },
] as const;

const mapSignals = [
    {
        label: "Zonas",
        value: "5 demo zones",
    },
    {
        label: "Estados",
        value: "Lifecycle visible",
    },
    {
        label: "Vista",
        value: "Patio operativo",
    },
] as const;

function YardZoneBlock({
    id,
    name,
    material,
    status,
    position,
    size,
    tone,
}: {
    readonly id: string;
    readonly name: string;
    readonly material: string;
    readonly status: string;
    readonly position: string;
    readonly size: string;
    readonly tone: string;
}) {
    return (
        <div className={`absolute ${position} ${size} rounded-2xl border p-3 shadow-sm ${tone}`}>
            <div className="flex items-start justify-between gap-2">
                <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-bold">{id}</span>
                <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-semibold">{status}</span>
            </div>
            <p className="mt-3 text-sm font-semibold leading-5">{name}</p>
            <p className="mt-1 text-xs leading-5 opacity-80">{material}</p>
        </div>
    );
}

function FlowStep({
    label,
    detail,
    index,
}: {
    readonly label: string;
    readonly detail: string;
    readonly index: number;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xs font-bold text-white">
                    {index + 1}
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-950">{label}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
                </div>
            </div>
        </div>
    );
}

function MapSignalCard({
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

export function YardOperationsMapPanel() {
    return (
        <section data-iyi-section="map gps operations" id="yard-map" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Yard operations map
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                        Vista conceptual de patio industrial
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Esta vista ayuda a explicar que los stockpiles pertenecen a zonas fisicas del patio.
                        No reemplaza un mapa GIS real; es una capa visual para vender el flujo operacional.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    {mapSignals.map((signal) => (
                        <MapSignalCard key={signal.label} label={signal.label} value={signal.value} />
                    ))}
                </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
                <div className="relative min-h-[430px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 p-5">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />

                    <div className="absolute left-1/2 top-0 h-full w-10 -translate-x-1/2 bg-slate-300/70" />
                    <div className="absolute left-0 top-1/2 h-10 w-full -translate-y-1/2 bg-slate-300/70" />

                    <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-400 bg-white text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                        Yard hub
                    </div>

                    {yardZones.map((zone) => (
                        <YardZoneBlock
                            key={zone.id}
                            id={zone.id}
                            name={zone.name}
                            material={zone.material}
                            status={zone.status}
                            position={zone.position}
                            size={zone.size}
                            tone={zone.tone}
                        />
                    ))}

                    <div className="absolute bottom-4 left-4 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Conceptual
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">
                            Futura capa GPS / geoespacial
                        </p>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Operator movement
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-950">
                        Narrativa fisico-digital
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        El valor de Modelo Namiki es conectar ubicacion fisica, material, estado,
                        evidencia, auditoria y sincronizacion.
                    </p>

                    <div className="mt-4 grid gap-3">
                        {operationFlows.map((flow, index) => (
                            <FlowStep
                                key={flow.label}
                                label={flow.label}
                                detail={flow.detail}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
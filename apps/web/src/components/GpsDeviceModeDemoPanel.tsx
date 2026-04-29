import { useEffect, useMemo, useState } from "react";

type DeviceMode = "capturador" | "supervisor" | "dual";
type LinkState = "Sin enlazar" | "Enlazando" | "Enlace activo" | "Recibiendo";
type DemoPacketStatus = "Preparado" | "Enviado" | "Recibido";

type DemoPacket = {
    readonly id: string;
    readonly label: string;
    readonly material: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly accuracy: number;
    readonly address: string;
    readonly sourceDevice: string;
    readonly targetDevice: string;
    readonly status: DemoPacketStatus;
    readonly createdAt: string;
};

const demoMaterials = ["Pet coke", "Clinker", "Chatarra HMS", "Fluorita MT", "Patio completo"] as const;

function nowLabel() {
    return new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function formatCoordinate(value: number) {
    return value.toFixed(6);
}

function createDemoPacket(index: number, status: DemoPacketStatus): DemoPacket {
    const material = demoMaterials[index % demoMaterials.length] ?? "Pet coke";
    const latitude = 22.4003 + index * 0.00008;
    const longitude = -97.9386 - index * 0.00007;
    const accuracy = Math.max(4, 14 - index);

    return {
        id: "GPS-LIVE-" + String(Date.now()) + "-" + String(index),
        label: "Captura de campo " + String(index + 1),
        material,
        latitude,
        longitude,
        accuracy,
        address: "Puerto de Altamira, Tamaulipas · referencia operativa simulada",
        sourceDevice: "Celular capturador",
        targetDevice: "Panel supervisor",
        status,
        createdAt: nowLabel(),
    };
}

function signalLabel(accuracy: number) {
    if (accuracy <= 5) return "Excelente";
    if (accuracy <= 12) return "Buena";
    if (accuracy <= 25) return "Media";
    return "Baja";
}

function deviceModeLabel(mode: DeviceMode) {
    if (mode === "capturador") return "Capturador de campo";
    if (mode === "supervisor") return "Supervisor receptor";

    return "Modo dual";
}

export function GpsDeviceModeDemoPanel() {
    const [mode, setMode] = useState<DeviceMode>("dual");
    const [linkState, setLinkState] = useState<LinkState>("Sin enlazar");
    const [liveMode, setLiveMode] = useState(false);
    const [packetIndex, setPacketIndex] = useState(0);
    const [outgoingPackets, setOutgoingPackets] = useState<readonly DemoPacket[]>([]);
    const [receivedPackets, setReceivedPackets] = useState<readonly DemoPacket[]>([]);

    const latestPacket = receivedPackets[0] ?? outgoingPackets[0] ?? null;

    const accuracy = latestPacket?.accuracy ?? 8;
    const packetCount = outgoingPackets.length + receivedPackets.length;

    const workflowText = useMemo(() => {
        if (mode === "capturador") {
            return "Este dispositivo se presenta como celular de campo: captura ubicación, material, evidencia y envía paquete.";
        }

        if (mode === "supervisor") {
            return "Este dispositivo se presenta como estación supervisora: recibe capturas, revisa precisión y valida paquetes.";
        }

        return "Este dispositivo muestra ambos lados de la demo: celular emisor, API receptora y panel supervisor.";
    }, [mode]);

    useEffect(() => {
        if (!liveMode) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setPacketIndex((current) => {
                const nextPacket = createDemoPacket(current, "Recibido");

                setOutgoingPackets((packets) => [createDemoPacket(current, "Enviado"), ...packets].slice(0, 5));
                setReceivedPackets((packets) => [nextPacket, ...packets].slice(0, 8));
                setLinkState("Recibiendo");

                return current + 1;
            });
        }, 4200);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [liveMode]);

    function startLink() {
        setLinkState("Enlazando");

        window.setTimeout(() => {
            setLinkState("Enlace activo");
        }, 700);
    }

    function simulateCapture() {
        const packet = createDemoPacket(packetIndex, "Preparado");

        setOutgoingPackets((packets) => [packet, ...packets].slice(0, 5));
        setPacketIndex((value) => value + 1);
        setLinkState("Enlace activo");
    }

    function sendToSupervisor() {
        const packet = outgoingPackets[0];

        if (!packet) {
            const nextPacket = createDemoPacket(packetIndex, "Recibido");

            setPacketIndex((value) => value + 1);
            setOutgoingPackets((packets) => [createDemoPacket(packetIndex, "Enviado"), ...packets].slice(0, 5));
            setReceivedPackets((packets) => [nextPacket, ...packets].slice(0, 8));
            setLinkState("Recibiendo");
            return;
        }

        const receivedPacket: DemoPacket = {
            ...packet,
            status: "Recibido",
            createdAt: nowLabel(),
        };

        setOutgoingPackets((packets) => packets.slice(1));
        setReceivedPackets((packets) => [receivedPacket, ...packets].slice(0, 8));
        setLinkState("Recibiendo");
    }

    function toggleLiveMode() {
        setLiveMode((value) => !value);
        setLinkState(liveMode ? "Enlace activo" : "Recibiendo");
    }

    function clearDemo() {
        setLiveMode(false);
        setOutgoingPackets([]);
        setReceivedPackets([]);
        setPacketIndex(0);
        setLinkState("Sin enlazar");
    }

    return (
        <section className="nmk-device-demo">
            <div className="nmk-device-demo-head">
                <div>
                    <p>GPS multi-dispositivo</p>
                    <h2>Celular emisor y supervisor receptor</h2>
                    <span>{workflowText}</span>
                </div>

                <div className={"nmk-device-link-state nmk-device-link-state-" + linkState.toLowerCase().replaceAll(" ", "-")}>
                    <strong>{linkState}</strong>
                    <span>{liveMode ? "Recepción automática simulada" : "Flujo manual para demo"}</span>
                </div>
            </div>

            <div className="nmk-device-mode-switch">
                <button className={mode === "capturador" ? "is-active" : ""} onClick={() => setMode("capturador")} type="button">
                    Celular capturador
                </button>
                <button className={mode === "supervisor" ? "is-active" : ""} onClick={() => setMode("supervisor")} type="button">
                    Supervisor receptor
                </button>
                <button className={mode === "dual" ? "is-active" : ""} onClick={() => setMode("dual")} type="button">
                    Demo completa
                </button>
            </div>

            <div className="nmk-device-flow">
                <article className="nmk-device-node nmk-device-node-phone">
                    <span>01</span>
                    <h3>Celular de campo</h3>
                    <p>Captura GPS, material, evidencia, dirección aproximada y precisión.</p>
                    <strong>{mode === "supervisor" ? "Modo remoto" : "Emisor activo"}</strong>
                </article>

                <div className="nmk-device-signal">
                    <i />
                    <strong>{liveMode ? "live" : "push"}</strong>
                    <span>{signalLabel(accuracy)} · {accuracy} m</span>
                </div>

                <article className="nmk-device-node nmk-device-node-api">
                    <span>02</span>
                    <h3>Backend receptor</h3>
                    <p>Recibe paquetes GPS por API y los deja listos para consultar.</p>
                    <strong>/gps/captures</strong>
                </article>

                <div className="nmk-device-signal">
                    <i />
                    <strong>sync</strong>
                    <span>{packetCount} paquetes</span>
                </div>

                <article className="nmk-device-node nmk-device-node-supervisor">
                    <span>03</span>
                    <h3>Panel supervisor</h3>
                    <p>Visualiza capturas recientes, precisión, material y estado del paquete.</p>
                    <strong>{receivedPackets.length} recibidos</strong>
                </article>
            </div>

            <div className="nmk-device-actions">
                <button onClick={startLink} type="button">Enlazar dispositivos</button>
                <button onClick={simulateCapture} type="button">Simular captura celular</button>
                <button onClick={sendToSupervisor} type="button">Enviar al supervisor</button>
                <button className={liveMode ? "is-active" : ""} onClick={toggleLiveMode} type="button">
                    {liveMode ? "Detener modo vivo" : "Activar modo vivo"}
                </button>
                <button onClick={clearDemo} type="button">Limpiar demo</button>
            </div>

            <div className="nmk-device-dashboard">
                <article>
                    <span>Modo</span>
                    <strong>{deviceModeLabel(mode)}</strong>
                </article>
                <article>
                    <span>Precisión simulada</span>
                    <strong>{signalLabel(accuracy)} · {accuracy} m</strong>
                </article>
                <article>
                    <span>Paquetes emitidos</span>
                    <strong>{outgoingPackets.length}</strong>
                </article>
                <article>
                    <span>Paquetes recibidos</span>
                    <strong>{receivedPackets.length}</strong>
                </article>
            </div>

            <div className="nmk-device-lists">
                <section>
                    <div className="nmk-device-list-title">
                        <p>Emisor</p>
                        <h3>Cola del celular</h3>
                    </div>

                    <div className="nmk-device-list">
                        {outgoingPackets.length > 0 ? (
                            outgoingPackets.map((packet) => (
                                <article key={packet.id}>
                                    <div>
                                        <strong>{packet.label}</strong>
                                        <span>{packet.status}</span>
                                    </div>
                                    <p>{packet.material} · {formatCoordinate(packet.latitude)}, {formatCoordinate(packet.longitude)}</p>
                                    <footer>{packet.createdAt} · precisión {packet.accuracy} m</footer>
                                </article>
                            ))
                        ) : (
                            <article>
                                <div>
                                    <strong>Sin capturas en cola</strong>
                                    <span>Esperando celular</span>
                                </div>
                                <p>Presiona “Simular captura celular” para preparar un paquete.</p>
                            </article>
                        )}
                    </div>
                </section>

                <section>
                    <div className="nmk-device-list-title">
                        <p>Receptor</p>
                        <h3>Vista del supervisor</h3>
                    </div>

                    <div className="nmk-device-list">
                        {receivedPackets.length > 0 ? (
                            receivedPackets.map((packet) => (
                                <article key={packet.id}>
                                    <div>
                                        <strong>{packet.material}</strong>
                                        <span>{packet.status}</span>
                                    </div>
                                    <p>{packet.address}</p>
                                    <footer>{packet.sourceDevice} → {packet.targetDevice} · {packet.createdAt}</footer>
                                </article>
                            ))
                        ) : (
                            <article>
                                <div>
                                    <strong>Sin paquetes recibidos</strong>
                                    <span>Esperando envío</span>
                                </div>
                                <p>El supervisor verá aquí las capturas que mande el celular.</p>
                            </article>
                        )}
                    </div>
                </section>
            </div>
        </section>
    );
}
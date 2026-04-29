const gpsCapabilities = [
    {
        label: "Ubicacion",
        title: "GPS del dispositivo",
        text: "Solicitar permiso desde celular o laptop y centrar el mapa en la posicion real.",
    },
    {
        label: "Patio",
        title: "Universo industrial",
        text: "Dibujar o registrar el perimetro general del patio antes de crear objetos internos.",
    },
    {
        label: "Zonas",
        title: "Poligonos operativos",
        text: "Trazar areas de almacenamiento, descarga, revision, buffer o zonas prohibidas.",
    },
    {
        label: "Objetos",
        title: "Stockpiles dentro del patio",
        text: "Relacionar pilas de material, evidencia y lifecycle contra zonas geoespaciales.",
    },
] as const;

export function PremiumGpsPreviewPanel() {
    return (
        <section id="premium-gps-preview" className="iyi-gps-preview">
            <div className="iyi-gps-preview-copy">
                <p className="iyi-premium-kicker">Next module</p>
                <h2>GPS, mapa y perimetros: el salto de cockpit a sistema fisico-digital.</h2>
                <p>
                    La siguiente construccion debe convertir cualquier celular o laptop en herramienta de captura:
                    pedir ubicacion, mostrar mapa, registrar el patio completo y despues dibujar objetos dentro.
                </p>
            </div>

            <div className="iyi-gps-preview-map">
                <div className="iyi-gps-orbit iyi-gps-orbit-one" />
                <div className="iyi-gps-orbit iyi-gps-orbit-two" />
                <div className="iyi-gps-pin">
                    <span />
                    GPS
                </div>
                <div className="iyi-gps-zone iyi-gps-zone-a">Patio A</div>
                <div className="iyi-gps-zone iyi-gps-zone-b">Stockpile</div>
                <div className="iyi-gps-zone iyi-gps-zone-c">Perimetro</div>
            </div>

            <div className="iyi-gps-capabilities">
                {gpsCapabilities.map((capability) => (
                    <div className="iyi-gps-capability" key={capability.label}>
                        <p>{capability.label}</p>
                        <h3>{capability.title}</h3>
                        <span>{capability.text}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
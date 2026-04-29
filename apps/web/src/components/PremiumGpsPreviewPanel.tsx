const gpsCapabilities = [
    {
        label: "1",
        title: "Pedir ubicación",
        text: "Usar GPS del celular o laptop.",
    },
    {
        label: "2",
        title: "Dibujar patio",
        text: "Marcar el perímetro general.",
    },
    {
        label: "3",
        title: "Crear zonas",
        text: "Separar descarga, almacén y revisión.",
    },
    {
        label: "4",
        title: "Guardar objetos",
        text: "Asignar materiales dentro del mapa.",
    },
] as const;

export function PremiumGpsPreviewPanel() {
    return (
        <section data-iyi-section="map" id="premium-gps-preview" className="iyi-gps-preview">
            <div className="iyi-gps-preview-copy">
                <p className="iyi-premium-kicker">Siguiente módulo</p>
                <h2>GPS y perímetros del patio.</h2>
                <p>
                    El siguiente paso es abrir el mapa, pedir ubicación y dibujar áreas reales del patio desde cualquier dispositivo.
                </p>
            </div>

            <div className="iyi-gps-preview-map">
                <div className="iyi-gps-orbit iyi-gps-orbit-one" />
                <div className="iyi-gps-orbit iyi-gps-orbit-two" />
                <div className="iyi-gps-pin">
                    <span />
                    GPS
                </div>
                <div className="iyi-gps-zone iyi-gps-zone-a">Zona A</div>
                <div className="iyi-gps-zone iyi-gps-zone-b">Material</div>
                <div className="iyi-gps-zone iyi-gps-zone-c">Perímetro</div>
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
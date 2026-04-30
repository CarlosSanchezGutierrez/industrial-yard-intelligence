type IntroSlide = {
    readonly eyebrow: string;
    readonly title: string;
    readonly text: string;
    readonly chips: readonly string[];
};

const slides: readonly IntroSlide[] = [
    {
        eyebrow: "Bienvenido",
        title: "Sistema de patios industriales",
        text: "Una consola visual para controlar materiales, zonas, GPS, evidencia, perímetros, historial operativo y sincronización de campo.",
        chips: ["Patios", "Materiales", "GPS", "Evidencia"],
    },
    {
        eyebrow: "Empresa",
        title: "Cooper/T. Smith",
        text: "Por ahora esta versión del MVP está configurada para Cooper/T. Smith en Altamira, Tamaulipas.",
        chips: ["Altamira", "Carga a granel", "Operación portuaria", "MVP"],
    },
    {
        eyebrow: "Operación",
        title: "Funciona local y está listo para campo",
        text: "El software puede operar localmente sin internet, guardar capturas, trabajar con GPS, simular envío entre celular y supervisor, y sincronizar cuando exista conexión.",
        chips: ["Local sin internet", "Celular capturador", "Supervisor", "Backend"],
    },
    {
        eyebrow: "Próximamente",
        title: "Cuentas y app móvil",
        text: "Próximamente: cuentas de colaboradores, administradores y app móvil para Android y iOS.",
        chips: ["Colaboradores", "Administradores", "Android", "iOS"],
    },
];

function installStyles() {
    if (document.getElementById("namiki-intro-overlay-style")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "namiki-intro-overlay-style";
    style.textContent = `
        .namiki-intro-overlay {
            position: fixed;
            inset: 0;
            z-index: 2147483647;
            display: grid;
            place-items: center;
            padding: 22px;
            color: #f8fafc;
            background:
                radial-gradient(circle at 12% 0%, rgba(56, 189, 248, 0.24), transparent 34%),
                radial-gradient(circle at 88% 18%, rgba(52, 211, 153, 0.16), transparent 32%),
                radial-gradient(circle at 50% 100%, rgba(251, 191, 36, 0.09), transparent 28%),
                #020617;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        }

        .namiki-intro-card {
            width: min(1120px, 100%);
            min-height: min(680px, calc(100vh - 44px));
            display: grid;
            grid-template-rows: auto 1fr auto;
            gap: 18px;
            overflow: hidden;
            padding: clamp(18px, 3vw, 34px);
            border: 1px solid rgba(148, 163, 184, 0.18);
            border-radius: 34px;
            background:
                linear-gradient(to right, rgba(125, 211, 252, 0.055) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(125, 211, 252, 0.055) 1px, transparent 1px),
                linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 0.99));
            background-size: 54px 54px, 54px 54px, auto;
            box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.04),
                0 34px 110px rgba(0, 0, 0, 0.46);
        }

        .namiki-intro-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
        }

        .namiki-intro-brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .namiki-intro-dot {
            width: 18px;
            height: 18px;
            border-radius: 999px;
            background: #34d399;
            box-shadow: 0 0 0 10px rgba(52, 211, 153, 0.1);
        }

        .namiki-intro-brand strong {
            display: block;
            font-size: 18px;
            font-weight: 850;
            letter-spacing: -0.035em;
        }

        .namiki-intro-brand span {
            display: block;
            margin-top: 3px;
            color: rgba(203, 213, 225, 0.72);
            font-size: 13px;
        }

        .namiki-intro-badge {
            padding: 10px 14px;
            border: 1px solid rgba(52, 211, 153, 0.28);
            border-radius: 999px;
            color: #34d399;
            background: rgba(6, 78, 59, 0.16);
            font-size: 13px;
            font-weight: 850;
            white-space: nowrap;
        }

        .namiki-intro-body {
            display: grid;
            gap: 24px;
            align-content: center;
        }

        .namiki-intro-eyebrow {
            margin: 0;
            color: #38bdf8;
            font-size: 12px;
            font-weight: 950;
            letter-spacing: 0.2em;
            text-transform: uppercase;
        }

        .namiki-intro-title {
            max-width: 900px;
            margin: 16px 0 0;
            color: #f8fafc;
            font-size: clamp(46px, 8vw, 96px);
            font-weight: 850;
            letter-spacing: -0.078em;
            line-height: 0.9;
        }

        .namiki-intro-text {
            max-width: 760px;
            margin: 22px 0 0;
            color: rgba(226, 232, 240, 0.76);
            font-size: clamp(16px, 1.7vw, 22px);
            line-height: 1.55;
        }

        .namiki-intro-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 26px;
        }

        .namiki-intro-chips span {
            padding: 9px 12px;
            border: 1px solid rgba(56, 189, 248, 0.24);
            border-radius: 999px;
            color: #dbeafe;
            background: rgba(8, 47, 73, 0.4);
            font-size: 13px;
            font-weight: 780;
        }

        .namiki-intro-company {
            display: grid;
            gap: 10px;
            max-width: 520px;
            margin-top: 26px;
            padding: 16px;
            border: 1px solid rgba(56, 189, 248, 0.22);
            border-radius: 22px;
            background:
                radial-gradient(circle at 12% 0%, rgba(56, 189, 248, 0.14), transparent 36%),
                linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 0.98));
        }

        .namiki-intro-company label {
            color: rgba(203, 213, 225, 0.72);
            font-size: 11px;
            font-weight: 950;
            letter-spacing: 0.14em;
            text-transform: uppercase;
        }

        .namiki-intro-company select {
            min-height: 50px;
            width: 100%;
            padding: 0 13px;
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 16px;
            color: #f8fafc;
            background: rgba(2, 6, 23, 0.94);
            font: inherit;
            font-weight: 800;
        }

        .namiki-intro-roadmap {
            display: grid;
            gap: 10px;
            max-width: 760px;
            margin-top: 18px;
        }

        @media (min-width: 860px) {
            .namiki-intro-roadmap {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }

        .namiki-intro-roadmap article {
            padding: 13px;
            border: 1px solid rgba(251, 191, 36, 0.22);
            border-radius: 18px;
            background: rgba(120, 53, 15, 0.13);
        }

        .namiki-intro-roadmap strong {
            display: block;
            color: #fbbf24;
            font-size: 13px;
            font-weight: 950;
        }

        .namiki-intro-roadmap span {
            display: block;
            margin-top: 5px;
            color: rgba(254, 243, 199, 0.84);
            font-size: 13px;
            line-height: 1.4;
        }

        .namiki-intro-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            flex-wrap: wrap;
        }

        .namiki-intro-progress {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .namiki-intro-progress span {
            width: 34px;
            height: 6px;
            border-radius: 999px;
            background: rgba(148, 163, 184, 0.24);
        }

        .namiki-intro-progress span.is-active {
            background: #38bdf8;
            box-shadow: 0 0 18px rgba(56, 189, 248, 0.5);
        }

        .namiki-intro-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .namiki-intro-actions button {
            min-height: 48px;
            padding: 0 18px;
            border: 1px solid rgba(56, 189, 248, 0.34);
            border-radius: 999px;
            color: #f8fafc;
            background:
                linear-gradient(180deg, rgba(14, 116, 144, 0.98), rgba(7, 89, 133, 0.98));
            box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.09),
                0 18px 42px rgba(8, 47, 73, 0.34);
            cursor: pointer;
            font-size: 14px;
            font-weight: 900;
        }

        .namiki-intro-actions button[data-kind="ghost"] {
            border-color: rgba(148, 163, 184, 0.18);
            background: rgba(15, 23, 42, 0.8);
            box-shadow: none;
        }

        @media (max-width: 760px) {
            .namiki-intro-overlay {
                padding: 10px;
            }

            .namiki-intro-card {
                min-height: calc(100vh - 20px);
                border-radius: 24px;
            }

            .namiki-intro-top {
                align-items: flex-start;
                flex-direction: column;
            }

            .namiki-intro-title {
                font-size: 44px;
                line-height: 0.95;
            }

            .namiki-intro-bottom {
                align-items: flex-start;
                flex-direction: column;
            }

            .namiki-intro-actions,
            .namiki-intro-actions button {
                width: 100%;
            }
        }
    `;

    document.head.appendChild(style);
}

function renderSlide(root: HTMLElement, index: number) {
    const slide = slides[index] ?? slides[0]!;
    const isLast = index >= slides.length - 1;

    root.innerHTML = `
        <section class="namiki-intro-card">
            <header class="namiki-intro-top">
                <div class="namiki-intro-brand">
                    <span class="namiki-intro-dot"></span>
                    <div>
                        <strong>Modelo Namiki</strong>
                        <span>Software de patios industriales</span>
                    </div>
                </div>
                <div class="namiki-intro-badge">MVP operativo</div>
            </header>

            <div class="namiki-intro-body">
                <div>
                    <p class="namiki-intro-eyebrow">${slide.eyebrow}</p>
                    <h1 class="namiki-intro-title">${slide.title}</h1>
                    <p class="namiki-intro-text">${slide.text}</p>

                    <div class="namiki-intro-chips">
                        ${slide.chips.map((chip) => `<span>${chip}</span>`).join("")}
                    </div>

                    <div class="namiki-intro-company">
                        <label>Empresa</label>
                        <select disabled>
                            <option>Cooper/T. Smith</option>
                        </select>
                    </div>

                    ${
                        isLast
                            ? `<div class="namiki-intro-roadmap">
                                <article>
                                    <strong>Próximamente</strong>
                                    <span>Creación de cuentas de colaborador y administradores disponible.</span>
                                </article>
                                <article>
                                    <strong>Próximamente</strong>
                                    <span>App móvil para sistemas Android y iOS.</span>
                                </article>
                            </div>`
                            : ""
                    }
                </div>
            </div>

            <footer class="namiki-intro-bottom">
                <div class="namiki-intro-progress">
                    ${slides.map((_, slideIndex) => `<span class="${slideIndex === index ? "is-active" : ""}"></span>`).join("")}
                </div>

                <div class="namiki-intro-actions">
                    ${index > 0 ? `<button type="button" data-kind="ghost" data-action="back">Atrás</button>` : ""}
                    <button type="button" data-action="next">${isLast ? "Entrar al sistema" : "Siguiente"}</button>
                </div>
            </footer>
        </section>
    `;
}

export function installNamikiIntroOverlay() {
    window.setTimeout(() => {
        installStyles();

        const existing = document.getElementById("namiki-intro-overlay");

        if (existing) {
            existing.remove();
        }

        const overlay = document.createElement("div");
        overlay.id = "namiki-intro-overlay";
        overlay.className = "namiki-intro-overlay";

        let index = 0;

        function update() {
            renderSlide(overlay, index);
        }

        overlay.addEventListener("click", (event) => {
            const target = event.target;

            if (!(target instanceof HTMLElement)) {
                return;
            }

            const button = target.closest("button");

            if (!(button instanceof HTMLButtonElement)) {
                return;
            }

            const action = button.dataset.action;

            if (action === "back") {
                index = Math.max(0, index - 1);
                update();
                return;
            }

            if (action === "next") {
                if (index >= slides.length - 1) {
                    overlay.remove();
                    return;
                }

                index += 1;
                update();
            }
        });

        update();
        document.body.appendChild(overlay);
    }, 250);
}
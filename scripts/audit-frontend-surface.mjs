import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const sourceRoots = [
    "apps/api/src",
    "apps/edge/src",
    "apps/web/src",
    "packages",
    "libs",
    "scripts",
].filter((relativePath) => fs.existsSync(path.join(repoRoot, relativePath)));

const webRoots = [
    "apps/web/src",
].filter((relativePath) => fs.existsSync(path.join(repoRoot, relativePath)));

const reportDir = path.join(repoRoot, "reports");
const docsDir = path.join(repoRoot, "docs");

fs.mkdirSync(reportDir, { recursive: true });
fs.mkdirSync(docsDir, { recursive: true });

const ignoredDirectories = new Set([
    ".git",
    "node_modules",
    "dist",
    "build",
    ".turbo",
    ".next",
    "coverage",
    ".vite",
    "out",
]);

const interestingTerms = [
    "dashboard",
    "chart",
    "graph",
    "recharts",
    "LineChart",
    "BarChart",
    "AreaChart",
    "PieChart",
    "ScatterChart",
    "ResponsiveContainer",
    "metric",
    "metrics",
    "kpi",
    "stockpile",
    "stockpiles",
    "material",
    "materials",
    "yard",
    "map",
    "gps",
    "geolocation",
    "location",
    "polygon",
    "perimeter",
    "perimetro",
    "perímetro",
    "zone",
    "zones",
    "audit",
    "timeline",
    "history",
    "historial",
    "sync",
    "edge",
    "cloud",
    "offline",
    "mutation",
    "measurement",
    "medicion",
    "medición",
    "volume",
    "volumen",
    "demand",
    "demanda",
    "comparison",
    "compare",
    "forecast",
    "scenario",
    "filter",
    "filters",
    "drone",
    "drones",
    "rtk",
    "topographic",
    "topografia",
    "topografía",
    "tripod",
    "tripode",
    "trípode",
    "equipment",
    "maquinaria",
    "weighbridge",
    "bascula",
    "báscula",
    "operator",
    "workflow",
    "evidence",
    "evidencia",
];

const businessTerms = [
    "stockpile",
    "material",
    "yard",
    "map",
    "gps",
    "zone",
    "audit",
    "timeline",
    "sync",
    "measurement",
    "volume",
    "demand",
    "dashboard",
    "chart",
    "filter",
    "drone",
    "rtk",
    "equipment",
    "evidence",
    "operator",
    "workflow",
];

function walkDirectory(root) {
    const absoluteRoot = path.join(repoRoot, root);
    const results = [];

    function walk(currentDirectory) {
        if (!fs.existsSync(currentDirectory)) {
            return;
        }

        for (const entry of fs.readdirSync(currentDirectory, { withFileTypes: true })) {
            const absolutePath = path.join(currentDirectory, entry.name);
            const relativePath = path.relative(repoRoot, absolutePath).replaceAll("\\", "/");

            if (entry.isDirectory()) {
                if (!ignoredDirectories.has(entry.name)) {
                    walk(absolutePath);
                }

                continue;
            }

            if (
                entry.isFile() &&
                /\.(ts|tsx|js|jsx|mjs|cjs|json|md|css|scss)$/u.test(entry.name)
            ) {
                results.push(relativePath);
            }
        }
    }

    walk(absoluteRoot);

    return results;
}

const allFiles = [...new Set(sourceRoots.flatMap(walkDirectory))].sort();
const webFiles = [...new Set(webRoots.flatMap(walkDirectory))].sort();

function readFile(relativePath) {
    return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function lineNumberForIndex(text, index) {
    return text.slice(0, index).split(/\r?\n/u).length;
}

function findMatches(text, regex) {
    const matches = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        matches.push({
            value: match[0],
            groups: match.groups ?? {},
            index: match.index,
            line: lineNumberForIndex(text, match.index),
        });

        if (match.index === regex.lastIndex) {
            regex.lastIndex += 1;
        }
    }

    return matches;
}

function extractTerms(text) {
    const lowerText = text.toLowerCase();
    return interestingTerms
        .filter((term) => lowerText.includes(term.toLowerCase()))
        .sort((left, right) => left.localeCompare(right));
}

function scoreBusinessValue(terms, relativePath, text) {
    let score = 0;
    const lowerPath = relativePath.toLowerCase();
    const lowerText = text.toLowerCase();

    for (const term of terms) {
        if (businessTerms.includes(term.toLowerCase())) {
            score += 2;
        } else {
            score += 1;
        }
    }

    if (lowerPath.includes("component")) score += 2;
    if (lowerPath.includes("dashboard")) score += 4;
    if (lowerPath.includes("chart")) score += 4;
    if (lowerPath.includes("map")) score += 4;
    if (lowerPath.includes("gps")) score += 4;
    if (lowerPath.includes("audit")) score += 3;
    if (lowerPath.includes("sync")) score += 3;
    if (lowerText.includes("recharts")) score += 6;
    if (lowerText.includes("fetch(")) score += 2;
    if (lowerText.includes("useeffect")) score += 1;

    return score;
}

function extractApiRoutes() {
    const routeCandidates = [];

    for (const relativePath of allFiles) {
        if (!relativePath.startsWith("apps/api/") && !relativePath.startsWith("apps/edge/") && !relativePath.startsWith("packages/")) {
            continue;
        }

        const text = readFile(relativePath);

        const literalRoutes = findMatches(
            text,
            /["'`](\/(?:api\/)?[a-zA-Z0-9_:$.*+?()[\]{}|\\^~=%-]+(?:\/[a-zA-Z0-9_:$.*+?()[\]{}|\\^~=%-]+)*)(?:\?[^"'`]*)?["'`]/gu,
        )
            .map((match) => ({
                path: match.groups[1] ?? match.value.replaceAll(/["'`]/gu, ""),
                line: match.line,
            }))
            .filter((route) =>
                route.path.length > 1 &&
                !route.path.includes(" ") &&
                !route.path.includes(".js") &&
                !route.path.includes(".ts") &&
                !route.path.includes(".tsx") &&
                !route.path.includes("//"),
            );

        const methodMatches = findMatches(
            text,
            /\b(GET|POST|PUT|PATCH|DELETE)\b/gu,
        ).map((match) => ({
            method: match.value,
            line: match.line,
        }));

        for (const route of literalRoutes) {
            const nearbyMethod = methodMatches
                .filter((method) => Math.abs(method.line - route.line) <= 10)
                .map((method) => method.method)[0] ?? "UNKNOWN";

            routeCandidates.push({
                method: nearbyMethod,
                path: route.path,
                file: relativePath,
                line: route.line,
                terms: extractTerms(route.path),
            });
        }
    }

    const unique = new Map();

    for (const route of routeCandidates) {
        const key = `${route.method} ${route.path} ${route.file}:${route.line}`;

        if (!unique.has(key)) {
            unique.set(key, route);
        }
    }

    return [...unique.values()].sort((left, right) =>
        `${left.path} ${left.file}`.localeCompare(`${right.path} ${right.file}`),
    );
}

function extractFetchUsages() {
    const usages = [];

    for (const relativePath of webFiles) {
        const text = readFile(relativePath);

        for (const match of findMatches(text, /\bfetch\s*\(([^)]{1,260})\)/gu)) {
            usages.push({
                file: relativePath,
                line: match.line,
                expression: match.value.replace(/\s+/gu, " ").trim(),
                terms: extractTerms(match.value),
            });
        }

        for (const match of findMatches(text, /Invoke|RestMethod|axios|ky\.|client\./gu)) {
            usages.push({
                file: relativePath,
                line: match.line,
                expression: match.value,
                terms: extractTerms(match.value),
            });
        }
    }

    return usages;
}

function extractComponents() {
    const components = [];

    for (const relativePath of webFiles) {
        if (!/\.(tsx|jsx)$/u.test(relativePath)) {
            continue;
        }

        const text = readFile(relativePath);
        const componentNames = new Set();

        for (const match of findMatches(text, /\bexport\s+function\s+([A-Z][A-Za-z0-9_]*)\b/gu)) {
            componentNames.add(match.value.replace(/^export\s+function\s+/u, "").trim());
        }

        for (const match of findMatches(text, /\bexport\s+const\s+([A-Z][A-Za-z0-9_]*)\b/gu)) {
            componentNames.add(match.value.replace(/^export\s+const\s+/u, "").trim());
        }

        for (const match of findMatches(text, /\bfunction\s+([A-Z][A-Za-z0-9_]*)\b/gu)) {
            componentNames.add(match.value.replace(/^function\s+/u, "").trim());
        }

        const terms = extractTerms(text);
        const imports = findMatches(text, /^\s*import\s+.+?from\s+["'`](.+?)["'`]/gmu).map((match) => match.value.trim());
        const fetchCount = findMatches(text, /\bfetch\s*\(/gu).length;
        const chartCount = findMatches(text, /\b(LineChart|BarChart|AreaChart|PieChart|ScatterChart|ResponsiveContainer|recharts)\b/gu).length;
        const stateCount = findMatches(text, /\buse(State|Memo|Effect|Reducer)\b/gu).length;
        const buttonCount = findMatches(text, /<button\b/gu).length;
        const formCount = findMatches(text, /<(form|input|select|textarea)\b/gu).length;
        const svgCount = findMatches(text, /<svg\b/gu).length;

        if (componentNames.size === 0 && !relativePath.includes("/components/")) {
            continue;
        }

        components.push({
            file: relativePath,
            names: [...componentNames].sort(),
            terms,
            imports,
            fetchCount,
            chartCount,
            stateCount,
            buttonCount,
            formCount,
            svgCount,
            score: scoreBusinessValue(terms, relativePath, text),
            lineCount: text.split(/\r?\n/u).length,
        });
    }

    return components.sort((left, right) => right.score - left.score);
}

function extractShellVisibility(components) {
    const appPath = "apps/web/src/App.tsx";
    const shellPath = "apps/web/src/components/NamikiProductShell.tsx";
    const appText = fs.existsSync(path.join(repoRoot, appPath)) ? readFile(appPath) : "";
    const shellText = fs.existsSync(path.join(repoRoot, shellPath)) ? readFile(shellPath) : "";
    const visibleText = `${appText}\n${shellText}`;

    return components.map((component) => {
        const visibleNames = component.names.filter((name) => visibleText.includes(`<${name}`) || visibleText.includes(`{ ${name} }`) || visibleText.includes(name));
        const importedByShell = shellText.includes(component.file.split("/").at(-1)?.replace(/\.(tsx|jsx)$/u, ".js") ?? "");
        const renderedByShell = component.names.some((name) => shellText.includes(`<${name}`));
        const importedByApp = appText.includes(component.file.split("/").at(-1)?.replace(/\.(tsx|jsx)$/u, ".js") ?? "");
        const renderedByApp = component.names.some((name) => appText.includes(`<${name}`));

        return {
            ...component,
            visibleNames,
            importedByShell,
            renderedByShell,
            importedByApp,
            renderedByApp,
            surfaced: importedByShell || renderedByShell || renderedByApp || importedByApp,
        };
    });
}

function classifyGap(component) {
    const terms = new Set(component.terms.map((term) => term.toLowerCase()));
    const labels = [];

    if (component.chartCount > 0 || terms.has("chart") || terms.has("dashboard") || terms.has("metric") || terms.has("metrics")) {
        labels.push("dashboard/graficas");
    }

    if (terms.has("map") || terms.has("gps") || terms.has("geolocation") || terms.has("polygon") || terms.has("perimeter")) {
        labels.push("mapa/GPS/perimetros");
    }

    if (terms.has("stockpile") || terms.has("material")) {
        labels.push("materiales/stockpiles");
    }

    if (terms.has("audit") || terms.has("timeline") || terms.has("history") || terms.has("historial")) {
        labels.push("historial/auditoria");
    }

    if (terms.has("sync") || terms.has("edge") || terms.has("offline")) {
        labels.push("envios/sincronizacion");
    }

    if (terms.has("demand") || terms.has("comparison") || terms.has("forecast") || terms.has("scenario")) {
        labels.push("analisis/demanda");
    }

    if (terms.has("filter") || terms.has("filters")) {
        labels.push("filtros");
    }

    if (terms.has("drone") || terms.has("rtk") || terms.has("topographic") || terms.has("equipment")) {
        labels.push("equipo/captura");
    }

    if (labels.length === 0) {
        labels.push("otro");
    }

    return labels;
}

function priorityFor(component) {
    if (component.surfaced) {
        return "visible";
    }

    if (component.score >= 18 || component.chartCount > 0 || component.fetchCount > 0) {
        return "alta";
    }

    if (component.score >= 10) {
        return "media";
    }

    return "baja";
}

function extractCssWhiteRisks() {
    const risks = [];

    for (const relativePath of webFiles.filter((file) => /\.(css|scss)$/u.test(file))) {
        const text = readFile(relativePath);
        const matches = findMatches(
            text,
            /(background(?:-color)?\s*:\s*(?:#fff|#ffffff|white|rgb\(255,\s*255,\s*255\)|rgba\(255,\s*255,\s*255,\s*[^)]+\))|color\s*:\s*(?:#fff|#ffffff|white))/giu,
        );

        for (const match of matches) {
            risks.push({
                file: relativePath,
                line: match.line,
                rule: match.value.replace(/\s+/gu, " ").trim(),
            });
        }
    }

    return risks;
}

const apiRoutes = extractApiRoutes();
const fetchUsages = extractFetchUsages();
const components = extractShellVisibility(extractComponents());
const cssWhiteRisks = extractCssWhiteRisks();

const hiddenComponents = components
    .filter((component) => !component.surfaced)
    .map((component) => ({
        ...component,
        gapLabels: classifyGap(component),
        priority: priorityFor(component),
    }))
    .sort((left, right) => {
        const priorityOrder = { alta: 0, media: 1, baja: 2, visible: 3 };
        return priorityOrder[left.priority] - priorityOrder[right.priority] || right.score - left.score;
    });

const visibleComponents = components.filter((component) => component.surfaced);

const routeGroups = Object.groupBy(
    apiRoutes,
    (route) => {
        const lower = route.path.toLowerCase();

        if (lower.includes("stockpile") || lower.includes("material")) return "materiales/stockpiles";
        if (lower.includes("audit") || lower.includes("mutation") || lower.includes("history")) return "historial/auditoria";
        if (lower.includes("sync") || lower.includes("package")) return "envios/sincronizacion";
        if (lower.includes("health") || lower.includes("status")) return "estado/sistema";
        if (lower.includes("map") || lower.includes("gps") || lower.includes("zone")) return "mapa/GPS/zonas";
        return "otros";
    },
);

const componentGroups = Object.groupBy(
    hiddenComponents,
    (component) => component.gapLabels[0] ?? "otro",
);

const recommendedSurfacePlan = [
    {
        page: "Inicio",
        shouldShow: [
            "resumen ejecutivo de capacidades",
            "KPIs principales",
            "alertas operativas",
            "accesos a módulos",
        ],
    },
    {
        page: "Patio",
        shouldShow: [
            "mapa operativo visual",
            "zonas configurables",
            "rutas, muelles, básculas, bodegas",
            "capas de GPS/perímetros",
        ],
    },
    {
        page: "Materiales",
        shouldShow: [
            "todos los stockpiles/materiales",
            "cantidad, zona, estado, prioridad, responsable",
            "formularios de registro/edición si existen",
            "historial por material",
        ],
    },
    {
        page: "Captura",
        shouldShow: [
            "GPS real",
            "perímetros/polígonos",
            "evidencias",
            "drones RTK",
            "bastones topográficos con trípode",
            "mediciones",
        ],
    },
    {
        page: "Equipo",
        shouldShow: [
            "maquinaria",
            "básculas",
            "cuadrillas",
            "drones",
            "sensores futuros",
            "estado operativo",
        ],
    },
    {
        page: "Historial",
        shouldShow: [
            "línea del tiempo",
            "filtros",
            "eventos por material/zona/responsable",
            "auditoría entendible",
        ],
    },
    {
        page: "Análisis",
        shouldShow: [
            "gráficas existentes",
            "dashboards",
            "comparación por tiempo",
            "demanda",
            "escenarios",
            "recomendaciones",
        ],
    },
    {
        page: "Envíos",
        shouldShow: [
            "sync",
            "export/import",
            "paquetes",
            "estado offline/local",
            "preview antes de aplicar",
        ],
    },
    {
        page: "Interno",
        shouldShow: [
            "API",
            "Edge",
            "runtime",
            "reset",
            "checks técnicos",
        ],
    },
];

const audit = {
    generatedAt: new Date().toISOString(),
    totals: {
        filesScanned: allFiles.length,
        webFilesScanned: webFiles.length,
        apiRouteCandidates: apiRoutes.length,
        fetchUsages: fetchUsages.length,
        components: components.length,
        visibleComponents: visibleComponents.length,
        hiddenComponents: hiddenComponents.length,
        cssWhiteRisks: cssWhiteRisks.length,
    },
    apiRoutes,
    routeGroups,
    fetchUsages,
    visibleComponents,
    hiddenComponents,
    componentGroups,
    cssWhiteRisks,
    recommendedSurfacePlan,
};

fs.writeFileSync(
    path.join(reportDir, "frontend-surface-gap-audit.json"),
    `${JSON.stringify(audit, null, 2)}\n`,
    "utf8",
);

function markdownTable(rows, columns) {
    if (rows.length === 0) {
        return "_Sin resultados._\n";
    }

    const header = `| ${columns.map((column) => column.label).join(" | ")} |`;
    const separator = `| ${columns.map(() => "---").join(" | ")} |`;
    const body = rows.map((row) =>
        `| ${columns
            .map((column) => {
                const rawValue = column.value(row);
                return String(rawValue ?? "")
                    .replaceAll("\n", " ")
                    .replaceAll("|", "\\|")
                    .slice(0, 220);
            })
            .join(" | ")} |`,
    );

    return [header, separator, ...body].join("\n") + "\n";
}

const highPriorityHidden = hiddenComponents.filter((component) => component.priority === "alta");
const mediumPriorityHidden = hiddenComponents.filter((component) => component.priority === "media");

const markdown = `# Frontend surface gap audit

## Resumen ejecutivo

Este reporte compara lo que existe en código contra lo que está visible en la interfaz actual.

| Métrica | Total |
| --- | ---: |
| Archivos escaneados | ${audit.totals.filesScanned} |
| Archivos web escaneados | ${audit.totals.webFilesScanned} |
| Endpoints/rutas candidatas | ${audit.totals.apiRouteCandidates} |
| Consumos fetch/client detectados | ${audit.totals.fetchUsages} |
| Componentes detectados | ${audit.totals.components} |
| Componentes visibles/importados por shell/App | ${audit.totals.visibleComponents} |
| Componentes posiblemente ocultos | ${audit.totals.hiddenComponents} |
| Riesgos de fondo blanco en CSS | ${audit.totals.cssWhiteRisks} |

## Prioridad alta: cosas que probablemente deberían mostrarse

${markdownTable(highPriorityHidden.slice(0, 40), [
    { label: "Archivo", value: (row) => row.file },
    { label: "Componentes", value: (row) => row.names.join(", ") || "(sin nombre exportado)" },
    { label: "Categoría", value: (row) => row.gapLabels.join(", ") },
    { label: "Score", value: (row) => row.score },
    { label: "Fetch", value: (row) => row.fetchCount },
    { label: "Charts", value: (row) => row.chartCount },
    { label: "Botones/forms", value: (row) => `${row.buttonCount}/${row.formCount}` },
])}

## Prioridad media: revisar para diseño

${markdownTable(mediumPriorityHidden.slice(0, 60), [
    { label: "Archivo", value: (row) => row.file },
    { label: "Componentes", value: (row) => row.names.join(", ") || "(sin nombre exportado)" },
    { label: "Categoría", value: (row) => row.gapLabels.join(", ") },
    { label: "Score", value: (row) => row.score },
])}

## Componentes visibles actualmente

${markdownTable(visibleComponents.slice(0, 80), [
    { label: "Archivo", value: (row) => row.file },
    { label: "Componentes", value: (row) => row.names.join(", ") || "(sin nombre exportado)" },
    { label: "Shell", value: (row) => row.importedByShell || row.renderedByShell ? "sí" : "no" },
    { label: "App", value: (row) => row.importedByApp || row.renderedByApp ? "sí" : "no" },
    { label: "Términos", value: (row) => row.terms.slice(0, 8).join(", ") },
])}

## Endpoints/rutas candidatas detectadas

${markdownTable(apiRoutes.slice(0, 120), [
    { label: "Método", value: (row) => row.method },
    { label: "Ruta", value: (row) => row.path },
    { label: "Archivo", value: (row) => `${row.file}:${row.line}` },
])}

## Consumos desde frontend detectados

${markdownTable(fetchUsages.slice(0, 80), [
    { label: "Archivo", value: (row) => `${row.file}:${row.line}` },
    { label: "Uso", value: (row) => row.expression },
    { label: "Términos", value: (row) => row.terms.join(", ") },
])}

## Riesgos de fondos blancos o texto blanco mal aplicado en CSS

${markdownTable(cssWhiteRisks.slice(0, 120), [
    { label: "Archivo", value: (row) => `${row.file}:${row.line}` },
    { label: "Regla", value: (row) => row.rule },
])}

## Plan de superficie recomendado

${recommendedSurfacePlan
    .map(
        (item) => `### ${item.page}

${item.shouldShow.map((entry) => `- ${entry}`).join("\n")}
`,
    )
    .join("\n")}

## Decisión recomendada

Antes de seguir diseñando a ciegas, el siguiente paso debe ser convertir este reporte en una matriz:

- Qué existe.
- Qué sí aparece.
- Qué no aparece.
- En qué página debe aparecer.
- Si será vista principal, card, drawer, filtro, gráfica o modo interno.

Después de eso ya se rediseña con precisión.
`;

fs.writeFileSync(
    path.join(docsDir, "FRONTEND_SURFACE_GAP_AUDIT.md"),
    markdown,
    "utf8",
);

console.log("");
console.log("Frontend surface gap audit generated.");
console.log("");
console.log(`Files scanned: ${audit.totals.filesScanned}`);
console.log(`API route candidates: ${audit.totals.apiRouteCandidates}`);
console.log(`Fetch usages: ${audit.totals.fetchUsages}`);
console.log(`Components: ${audit.totals.components}`);
console.log(`Visible components: ${audit.totals.visibleComponents}`);
console.log(`Hidden components: ${audit.totals.hiddenComponents}`);
console.log(`High priority hidden components: ${highPriorityHidden.length}`);
console.log(`Medium priority hidden components: ${mediumPriorityHidden.length}`);
console.log(`CSS white risks: ${audit.totals.cssWhiteRisks}`);
console.log("");
console.log("Report:");
console.log("docs/FRONTEND_SURFACE_GAP_AUDIT.md");
console.log("reports/frontend-surface-gap-audit.json");
console.log("");
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";

type JsonRecord = Record<string, unknown>;

type GpsCaptureStatus = "Borrador" | "Listo para enviar" | "Sincronizado" | "Recibido";

type StoredGpsCapture = {
    readonly id: string;
    readonly packageId: string;
    readonly status: GpsCaptureStatus;
    readonly qualityScore: number;
    readonly pointCount: number;
    readonly vertexCount: number;
    readonly auditCount: number;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly payload: JsonRecord;
};

type GpsCaptureStore = {
    readonly version: 1;
    readonly captures: readonly StoredGpsCapture[];
};

function findRepoRoot() {
    let currentDirectory = process.cwd();

    for (let index = 0; index < 8; index += 1) {
        if (
            existsSync(path.join(currentDirectory, "pnpm-workspace.yaml")) ||
            existsSync(path.join(currentDirectory, ".git"))
        ) {
            return currentDirectory;
        }

        const parentDirectory = path.dirname(currentDirectory);

        if (parentDirectory === currentDirectory) {
            break;
        }

        currentDirectory = parentDirectory;
    }

    return process.cwd();
}

const repoRoot = findRepoRoot();
const storePath = path.join(repoRoot, ".data", "gps-captures.json");

function nowIso() {
    return new Date().toISOString();
}

function isRecord(value: unknown): value is JsonRecord {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asRecord(value: unknown): JsonRecord {
    return isRecord(value) ? value : {};
}

function asArray(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : [];
}

function asNumber(value: unknown, fallback: number) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback: string) {
    return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function normalizeStatus(value: unknown): GpsCaptureStatus {
    if (value === "Borrador" || value === "Listo para enviar" || value === "Sincronizado") {
        return value;
    }

    return "Recibido";
}

function normalizeStoredCapture(value: unknown): StoredGpsCapture | null {
    if (!isRecord(value)) {
        return null;
    }

    if (
        typeof value.id !== "string" ||
        typeof value.packageId !== "string" ||
        typeof value.createdAt !== "string" ||
        typeof value.updatedAt !== "string" ||
        !isRecord(value.payload)
    ) {
        return null;
    }

    return {
        id: value.id,
        packageId: value.packageId,
        status: normalizeStatus(value.status),
        qualityScore: asNumber(value.qualityScore, 0),
        pointCount: asNumber(value.pointCount, 0),
        vertexCount: asNumber(value.vertexCount, 0),
        auditCount: asNumber(value.auditCount, 0),
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
        payload: value.payload,
    };
}

async function readStore(): Promise<GpsCaptureStore> {
    try {
        const raw = await readFile(storePath, "utf8");
        const parsed = JSON.parse(raw) as unknown;

        if (!isRecord(parsed) || !Array.isArray(parsed.captures)) {
            return {
                version: 1,
                captures: [],
            };
        }

        return {
            version: 1,
            captures: parsed.captures
                .map((item) => normalizeStoredCapture(item))
                .filter((item): item is StoredGpsCapture => item !== null),
        };
    } catch {
        return {
            version: 1,
            captures: [],
        };
    }
}

async function writeStore(store: GpsCaptureStore) {
    await mkdir(path.dirname(storePath), {
        recursive: true,
    });

    await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
    const chunks: Buffer[] = [];

    for await (const chunk of request) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const rawBody = Buffer.concat(chunks).toString("utf8").trim();

    if (rawBody.length === 0) {
        return {};
    }

    return JSON.parse(rawBody) as unknown;
}

function writeJson(response: ServerResponse, statusCode: number, payload: unknown) {
    if (response.headersSent) {
        return;
    }

    response.writeHead(statusCode, {
        "access-control-allow-headers": "content-type, authorization",
        "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
        "access-control-allow-origin": "*",
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
    });

    response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function writeNoContent(response: ServerResponse) {
    if (response.headersSent) {
        return;
    }

    response.writeHead(204, {
        "access-control-allow-headers": "content-type, authorization",
        "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
        "access-control-allow-origin": "*",
        "cache-control": "no-store",
    });

    response.end();
}

function createStoredCapture(payload: JsonRecord): StoredGpsCapture {
    const timestamp = nowIso();
    const savedPoints = asArray(payload.savedPoints);
    const perimeterPoints = asArray(payload.perimeterPoints);
    const auditEntries = asArray(payload.auditEntries);

    return {
        id: randomUUID(),
        packageId: asString(payload.packageId, `NAMIKI-GPS-${timestamp}`),
        status: normalizeStatus(payload.status),
        qualityScore: asNumber(payload.qualityScore, 0),
        pointCount: savedPoints.length,
        vertexCount: perimeterPoints.length,
        auditCount: auditEntries.length,
        createdAt: timestamp,
        updatedAt: timestamp,
        payload,
    };
}

function summarizeCapture(capture: StoredGpsCapture) {
    return {
        id: capture.id,
        packageId: capture.packageId,
        status: capture.status,
        qualityScore: capture.qualityScore,
        pointCount: capture.pointCount,
        vertexCount: capture.vertexCount,
        auditCount: capture.auditCount,
        createdAt: capture.createdAt,
        updatedAt: capture.updatedAt,
    };
}

function normalizedPathname(url: URL) {
    const normalized = url.pathname.replace(/\/+$/u, "");
    return normalized.length > 0 ? normalized : "/";
}

export async function tryHandleGpsCaptureRoute(request: IncomingMessage, response: ServerResponse): Promise<boolean> {
    const baseUrl = `http://${request.headers.host ?? "localhost"}`;
    const url = new URL(request.url ?? "/", baseUrl);
    const pathname = normalizedPathname(url);
    const method = request.method ?? "GET";

    if (!pathname.startsWith("/gps")) {
        return false;
    }

    if (method === "OPTIONS") {
        writeNoContent(response);
        return true;
    }

    if (pathname === "/gps/health" && method === "GET") {
        const store = await readStore();

        writeJson(response, 200, {
            ok: true,
            service: "gps-captures",
            captureCount: store.captures.length,
            storePath,
        });

        return true;
    }

    if (pathname === "/gps/captures" && method === "GET") {
        const store = await readStore();

        writeJson(response, 200, {
            items: store.captures.map(summarizeCapture),
            count: store.captures.length,
        });

        return true;
    }

    if (pathname === "/gps/captures" && method === "POST") {
        try {
            const body = await readJsonBody(request);

            if (!isRecord(body)) {
                writeJson(response, 400, {
                    error: "GPS_CAPTURE_PAYLOAD_REQUIRED",
                    message: "Expected JSON object payload.",
                });

                return true;
            }

            const store = await readStore();
            const storedCapture = createStoredCapture(asRecord(body));

            await writeStore({
                version: 1,
                captures: [storedCapture, ...store.captures],
            });

            writeJson(response, 201, {
                item: summarizeCapture(storedCapture),
                payload: storedCapture.payload,
            });

            return true;
        } catch (error) {
            writeJson(response, 400, {
                error: "GPS_CAPTURE_INVALID_JSON",
                message: error instanceof Error ? error.message : "Invalid JSON body.",
            });

            return true;
        }
    }

    if (pathname === "/gps/captures/export" && method === "GET") {
        const store = await readStore();

        writeJson(response, 200, {
            exportedAt: nowIso(),
            version: store.version,
            captures: store.captures,
        });

        return true;
    }

    if ((pathname === "/gps/captures/reset" && method === "POST") || (pathname === "/gps/captures" && method === "DELETE")) {
        await writeStore({
            version: 1,
            captures: [],
        });

        writeJson(response, 200, {
            ok: true,
            message: "GPS capture store reset.",
        });

        return true;
    }

    const captureIdMatch = /^\/gps\/captures\/([^/]+)$/u.exec(pathname);
    const rawCaptureId = captureIdMatch?.[1];

    if (typeof rawCaptureId === "string" && rawCaptureId.length > 0) {
        const captureId = decodeURIComponent(rawCaptureId);
        const store = await readStore();

        if (method === "GET") {
            const capture = store.captures.find((item) => item.id === captureId || item.packageId === captureId);

            if (!capture) {
                writeJson(response, 404, {
                    error: "GPS_CAPTURE_NOT_FOUND",
                    message: `GPS capture not found: ${captureId}`,
                });

                return true;
            }

            writeJson(response, 200, {
                item: capture,
            });

            return true;
        }

        if (method === "DELETE") {
            const nextCaptures = store.captures.filter((item) => item.id !== captureId && item.packageId !== captureId);

            await writeStore({
                version: 1,
                captures: nextCaptures,
            });

            writeJson(response, 200, {
                ok: true,
                deleted: store.captures.length - nextCaptures.length,
            });

            return true;
        }
    }

    writeJson(response, 404, {
        error: "GPS_ROUTE_NOT_FOUND",
        method,
        path: pathname,
    });

    return true;
}
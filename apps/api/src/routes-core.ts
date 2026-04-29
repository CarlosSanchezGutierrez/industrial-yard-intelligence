import { createStockpileLifecyclePayload } from "./stockpile-lifecycle-response.js";
import { createApiRequestHandler as createCoreApiRequestHandler } from "./routes-core.js";

export * from "./routes-core.js";

const jsonHeaders = {
    "access-control-allow-headers": "content-type,authorization,x-request-id",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-allow-origin": "*",
    "content-type": "application/json; charset=utf-8",
} as const;

function jsonResponse(data: unknown, init?: ResponseInit): Response {
    return new Response(JSON.stringify(data, null, 2), {
        ...init,
        headers: {
            ...jsonHeaders,
            ...(init?.headers ?? {}),
        },
    });
}

export function createApiRequestHandler(
    ...args: Parameters<typeof createCoreApiRequestHandler>
): ReturnType<typeof createCoreApiRequestHandler> {
    const coreHandler = createCoreApiRequestHandler(...args);

    return (async (request: Request) => {
        const url = new URL(request.url);

        if (request.method === "GET" && url.pathname === "/stockpiles/lifecycle") {
            return jsonResponse({
                ok: true,
                data: createStockpileLifecyclePayload(),
            });
        }

        return coreHandler(request);
    }) as ReturnType<typeof createCoreApiRequestHandler>;
}

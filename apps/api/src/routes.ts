import { createStockpileLifecyclePayload } from "./stockpile-lifecycle-response.js";
import * as coreRoutes from "./routes-core.js";

export * from "./routes-core.js";

type ApiRequestHandler = (request: Request) => Response | Promise<Response>;
type UnknownFunction = (...args: unknown[]) => unknown;

const exportedCoreRoutes = coreRoutes as Record<string, unknown>;

const jsonHeaders = {
    "access-control-allow-headers": "content-type,authorization,x-request-id",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-allow-origin": "*",
    "content-type": "application/json; charset=utf-8",
} as const;

function jsonResponse(data: unknown, init: ResponseInit = {}): Response {
    const headers = new Headers(init.headers);

    for (const [key, value] of Object.entries(jsonHeaders)) {
        headers.set(key, value);
    }

    return new Response(JSON.stringify(data, null, 2), {
        ...init,
        headers,
    });
}

function notFoundResponse(): Response {
    return jsonResponse(
        {
            ok: false,
            error: {
                code: "not_found",
                message: "Route not found.",
            },
        },
        {
            status: 404,
        },
    );
}

function getExportedFunction(name: string): UnknownFunction | undefined {
    const value = exportedCoreRoutes[name];

    if (typeof value === "function") {
        return value as UnknownFunction;
    }

    return undefined;
}

function findNamedFunction(names: readonly string[]): UnknownFunction | undefined {
    for (const name of names) {
        const value = getExportedFunction(name);

        if (value) {
            return value;
        }
    }

    return undefined;
}

function findDiscoveredFunction(pattern: RegExp): UnknownFunction | undefined {
    for (const [name, value] of Object.entries(exportedCoreRoutes)) {
        if (!pattern.test(name)) {
            continue;
        }

        if (typeof value === "function") {
            return value as UnknownFunction;
        }
    }

    return undefined;
}

function findCoreFactory(): UnknownFunction | undefined {
    return (
        findNamedFunction([
            "createApiRequestHandler",
            "createCloudApiRequestHandler",
            "createRequestHandler",
            "createHttpRequestHandler",
            "createServerRequestHandler",
            "createRouteHandler",
            "createRoutes",
            "createRouter",
        ]) ?? findDiscoveredFunction(/^create.*(RequestHandler|Handler|Routes|Router)$/u)
    );
}

function findDirectHandler(): UnknownFunction | undefined {
    return (
        findNamedFunction([
            "handleApiRequest",
            "handleRequest",
            "handleHttpRequest",
            "routeRequest",
            "dispatchRequest",
            "requestHandler",
            "default",
        ]) ?? findDiscoveredFunction(/(handle|handler|request|route|dispatch)/iu)
    );
}

function isLifecycleRequest(request: Request): boolean {
    const url = new URL(request.url);

    return request.method === "GET" && url.pathname === "/stockpiles/lifecycle";
}

function lifecycleResponse(): Response {
    return jsonResponse({
        ok: true,
        data: createStockpileLifecyclePayload(),
    });
}

export function createApiRequestHandler(...args: unknown[]): ApiRequestHandler {
    const coreFactory = findCoreFactory();
    const maybeCoreHandler = coreFactory ? coreFactory(...args) : undefined;
    const coreHandler = typeof maybeCoreHandler === "function" ? (maybeCoreHandler as ApiRequestHandler) : undefined;
    const directHandler = findDirectHandler();

    return async (request: Request): Promise<Response> => {
        if (isLifecycleRequest(request)) {
            return lifecycleResponse();
        }

        if (coreHandler) {
            return coreHandler(request);
        }

        if (directHandler) {
            const directResult = directHandler(request, ...args);

            return Promise.resolve(directResult as Response);
        }

        return notFoundResponse();
    };
}
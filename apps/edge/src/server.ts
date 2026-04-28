import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { createApiError, createApiFailure } from "@iyi/api-contracts";
import { routeEdgeRequest } from "./routes.js";

const defaultPort = 8787;
const port = Number.parseInt(process.env["PORT"] ?? `${defaultPort}`, 10);

async function readRequestBody(request: import("node:http").IncomingMessage): Promise<unknown> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    request.on("error", reject);

    request.on("end", () => {
      if (chunks.length === 0) {
        resolve(undefined);
        return;
      }

      const rawBody = Buffer.concat(chunks).toString("utf8").trim();

      if (rawBody.length === 0) {
        resolve(undefined);
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
  });
}

function writeJsonResponse(
  response: import("node:http").ServerResponse,
  statusCode: number,
  body: unknown
): void {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type, x-tenant-id, x-terminal-id, x-user-id, x-device-id"
  });
  response.end(JSON.stringify(body, null, 2));
}

const server = createServer((request, response) => {
  void (async () => {
    const requestId = randomUUID();
    const now = new Date().toISOString();

    try {
      const host = request.headers.host ?? `localhost:${port}`;
      const url = new URL(request.url ?? "/", `http://${host}`);
      const body = await readRequestBody(request);

      const result = routeEdgeRequest({
        method: request.method ?? "GET",
        pathname: url.pathname,
        requestId,
        now,
        body
      });

      response.writeHead(result.statusCode, result.headers);
      response.end(result.body);
    } catch {
      writeJsonResponse(
        response,
        400,
        createApiFailure(
          createApiError("bad_request", "Request body must be valid JSON."),
          requestId,
          now
        )
      );
    }
  })();
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Industrial Yard Intelligence Edge listening on http://localhost:${port}`);
});
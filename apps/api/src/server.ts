import { randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { routeApiRequest } from "./routes.js";

function getPort(): number {
  const value = process.env["IYI_API_PORT"] ?? process.env["PORT"] ?? "8788";
  const port = Number.parseInt(value, 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid API port: ${value}`);
  }

  return port;
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return undefined;
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();

  if (raw.length === 0) {
    return undefined;
  }

  return JSON.parse(raw) as unknown;
}

function writeResponse(
  response: ServerResponse,
  statusCode: number,
  headers: Readonly<Record<string, string>>,
  body: string
): void {
  response.writeHead(statusCode, headers);
  response.end(body);
}

const server = createServer((request, response) => {
  void (async () => {
    const requestUrl = new URL(request.url ?? "/", "http://localhost");
    const body = await readJsonBody(request);

    const apiResponse = await routeApiRequest({
      method: request.method ?? "GET",
      pathname: requestUrl.pathname,
      query: Object.fromEntries(requestUrl.searchParams.entries()),
      requestId: randomUUID(),
      now: new Date().toISOString(),
      body
    });

    writeResponse(response, apiResponse.statusCode, apiResponse.headers, apiResponse.body);
  })().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown API server error.";

    writeResponse(
      response,
      500,
      {
        "content-type": "application/json; charset=utf-8"
      },
      `${JSON.stringify(
        {
          ok: false,
          error: {
            code: "internal_server_error",
            message
          },
          requestId: randomUUID(),
          timestamp: new Date().toISOString()
        },
        null,
        2
      )}\n`
    );
  });
});

const port = getPort();

server.listen(port, () => {
  console.log(`@iyi/api listening on http://localhost:${port}`);
});
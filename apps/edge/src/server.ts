import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { routeEdgeRequest } from "./routes.js";

const defaultPort = 8787;
const port = Number.parseInt(process.env["PORT"] ?? `${defaultPort}`, 10);

const server = createServer((request, response) => {
  const host = request.headers.host ?? `localhost:${port}`;
  const url = new URL(request.url ?? "/", `http://${host}`);

  const result = routeEdgeRequest({
    method: request.method ?? "GET",
    pathname: url.pathname,
    requestId: randomUUID(),
    now: new Date().toISOString()
  });

  response.writeHead(result.statusCode, result.headers);
  response.end(result.body);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Industrial Yard Intelligence Edge listening on http://localhost:${port}`);
});
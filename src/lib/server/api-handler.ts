import serverless from "serverless-http";
const app = require("@/lib/server/app");
const { connectDb } = require("@/lib/server/config/db");

const handler = serverless(app);

function buildQuery(url: URL) {
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

async function toEvent(request: Request, pathname: string) {
  const url = new URL(request.url);
  const bodyBuffer = Buffer.from(await request.arrayBuffer());
  const headerEntries = Object.fromEntries(request.headers.entries());
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

  return {
    version: "1.0",
    resource: pathname,
    path: pathname,
    httpMethod: request.method,
    headers: {
      ...headerEntries,
      "x-forwarded-for": forwardedFor,
    },
    multiValueHeaders: Object.fromEntries(
      Object.entries(headerEntries).map(([key, value]) => [key, [value]])
    ),
    queryStringParameters: buildQuery(url),
    multiValueQueryStringParameters: null,
    body: bodyBuffer.length > 0 ? bodyBuffer.toString("base64") : undefined,
    isBase64Encoded: bodyBuffer.length > 0,
    requestContext: {
      httpMethod: request.method,
      path: pathname,
      identity: {
        sourceIp: forwardedFor,
        userAgent: request.headers.get("user-agent") ?? "",
      },
    },
  };
}

export async function handleLegacyApiRequest(request: Request, pathname: string) {
  await connectDb();
  const event = await toEvent(request, pathname);
  const result = (await handler(event, {})) as {
    statusCode?: number;
    headers?: Record<string, string>;
    body?: string;
    isBase64Encoded?: boolean;
  };

  const body = result.body
    ? result.isBase64Encoded
      ? Buffer.from(result.body, "base64")
      : result.body
    : null;

  return new Response(body, {
    status: result.statusCode ?? 200,
    headers: result.headers,
  });
}

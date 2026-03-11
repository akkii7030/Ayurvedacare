import { handleLegacyApiRequest } from "@/lib/server/api-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    path: string[];
  };
};

async function handle(request: Request, { params }: RouteContext) {
  try {
    const pathname = `/api/${params.path.join("/")}`;
    return await handleLegacyApiRequest(request, pathname);
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { 
        error: "Internal Server Error", 
        message: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, context: RouteContext) {
  return handle(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handle(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return handle(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return handle(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return handle(request, context);
}

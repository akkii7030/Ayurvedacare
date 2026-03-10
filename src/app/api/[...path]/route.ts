import { handleLegacyApiRequest } from "@/lib/server/api-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    path: string[];
  };
};

async function handle(request: Request, { params }: RouteContext) {
  const pathname = `/api/${params.path.join("/")}`;
  return handleLegacyApiRequest(request, pathname);
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

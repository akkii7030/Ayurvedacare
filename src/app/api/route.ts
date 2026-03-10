export async function GET() {
  return Response.json({
    message: "Sharavat Pali Clinic API",
    status: "running",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      doctors: "/api/doctors",
      appointments: "/api/appointments",
      products: "/api/products",
      blogs: "/api/blogs",
    },
  });
}

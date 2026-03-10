"use client";

import ServiceDetailPage from "@/components/pages/ServiceDetail";

export default function ServiceDetailRoute({ params }: { params: { slug: string } }) {
  return <ServiceDetailPage slug={params.slug} />;
}

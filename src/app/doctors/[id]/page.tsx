"use client";

import DoctorDetailPage from "@/components/pages/DoctorDetail";

export default function DoctorDetailRoute({ params }: { params: { id: string } }) {
  return <DoctorDetailPage id={params.id} />;
}

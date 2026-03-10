"use client";

import BlogDetailPage from "@/components/pages/BlogDetail";

export default function BlogDetailRoute({ params }: { params: { slug: string } }) {
  return <BlogDetailPage slug={params.slug} />;
}

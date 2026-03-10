"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { api } from "@/lib/api";

type BlogDetailProps = {
  slug: string;
};

const BlogDetail = ({ slug }: BlogDetailProps) => {
  const [blog, setBlog] = useState<any | null>(null);

  useEffect(() => {
    api.getBlogBySlug(slug).then(setBlog).catch(() => setBlog(null));
  }, [slug]);

  return (
    <PageShell>
      <section className="py-14 container mx-auto px-4 max-w-3xl">
        {!blog && <p>Article not found.</p>}
        {blog && (
          <>
            <p className="text-xs text-secondary font-semibold">{blog.category}</p>
            <h1 className="font-heading font-bold text-3xl mt-2">{blog.title}</h1>
            <p className="text-muted-foreground mt-2">{blog.excerpt}</p>
            <article className="prose max-w-none mt-8">
              <p>{blog.content}</p>
            </article>
          </>
        )}
      </section>
    </PageShell>
  );
};

export default BlogDetail;

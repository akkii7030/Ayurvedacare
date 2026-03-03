/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { api } from "@/lib/api";

const BlogList = () => {
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    api.getBlogs().then(setBlogs).catch(() => setBlogs([]));
  }, []);

  return (
    <PageShell>
      <section className="bg-hero-gradient text-primary-foreground py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl">Health Blog</h1>
          <p className="opacity-90 mt-2">Eye care, Ayurveda, women health, emergency awareness.</p>
        </div>
      </section>
      <section className="py-12 container mx-auto px-4 grid md:grid-cols-3 gap-5">
        {blogs.map((b) => (
          <article key={b._id} className="bg-card rounded-xl p-5 shadow-card">
            <p className="text-xs text-secondary font-semibold">{b.category}</p>
            <h2 className="font-heading font-semibold text-lg mt-2">{b.title}</h2>
            <p className="text-sm text-muted-foreground mt-2">{b.excerpt}</p>
            <Link className="inline-block text-primary text-sm mt-4" to={`/blog/${b.slug}`}>
              Read article
            </Link>
          </article>
        ))}
      </section>
    </PageShell>
  );
};

export default BlogList;

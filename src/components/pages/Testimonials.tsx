/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { api } from "@/lib/api";
import { Star } from "lucide-react";
import HeroMedia from "@/components/HeroMedia";

const Testimonials = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.getTestimonials().then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AggregateRating",
            itemReviewed: { "@type": "MedicalOrganization", name: "Sharavat Pali Clinic" },
            ratingValue: "4.8",
            reviewCount: String(items.length || 1),
          }),
        }}
      />
      <section className="bg-hero-gradient text-primary-foreground py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl">Patient Testimonials</h1>
          <p className="opacity-90 mt-2">Trusted care from Jaunpur and nearby cities.</p>
          <p className="mt-3 text-sm">Average rating: 4.8/5</p>
          <HeroMedia
            src="https://images.unsplash.com/photo-1582719478171-2f2df44e8d4e?q=80&w=1400&auto=format&fit=crop"
            alt="Happy patient with doctor after successful treatment"
            badge="4.8 / 5 patient satisfaction"
          />
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-5">
          {items.map((t) => (
            <article key={t._id} className="bg-card rounded-xl p-5 shadow-card">
              <div className="flex gap-1 mb-2">
                {Array.from({ length: t.rating || 0 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">"{t.reviewText}"</p>
              <p className="mt-3 font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.city}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="container mx-auto px-4 pb-14 grid md:grid-cols-3 gap-5">
        <iframe className="w-full h-56 rounded-xl shadow-card" src="https://www.google.com/maps?output=embed" title="Google Reviews" />
        <iframe className="w-full h-56 rounded-xl shadow-card" src="https://www.instagram.com/reel/C0QvNl6J0Bm/embed" title="Instagram reels" />
        <iframe className="w-full h-56 rounded-xl shadow-card" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube testimonials" />
      </section>
    </PageShell>
  );
};

export default Testimonials;

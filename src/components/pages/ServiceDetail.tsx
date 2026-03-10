"use client";

import { useMemo } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { serviceCatalog } from "@/data/clinic";
import HeroMedia from "@/components/HeroMedia";

type ServiceDetailProps = {
  slug: string;
};

const ServiceDetail = ({ slug }: ServiceDetailProps) => {
  const service = useMemo(() => serviceCatalog.find((s) => s.slug === slug), [slug]);

  if (!service) {
    return (
      <PageShell>
        <section className="py-14 container mx-auto px-4">Service not found.</section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: service.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
      <section className="bg-hero-gradient text-primary-foreground py-14">
        <div className="container mx-auto px-4">
          <p className="text-sm opacity-90">{service.category}</p>
          <h1 className="font-heading font-bold text-4xl mt-2">{service.name}</h1>
          <p className="opacity-90 mt-2">{service.description}</p>
          <Link className="inline-block bg-white text-primary-dark px-5 py-2.5 rounded-lg font-semibold mt-5" href="/booking">
            Book Now
          </Link>
          <HeroMedia
            src="/hero-services.svg"
            alt="Service details and care"
            className="md:justify-start"
          />
        </div>
      </section>
      <section className="py-12 container mx-auto px-4 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-heading font-semibold text-xl">Symptoms</h2>
          <ul className="list-disc pl-5 mt-2 text-muted-foreground">
            {service.symptoms.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
        <div>
          <h2 className="font-heading font-semibold text-xl">Treatment</h2>
          <ul className="list-disc pl-5 mt-2 text-muted-foreground">
            {service.treatment.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
      </section>
    </PageShell>
  );
};

export default ServiceDetail;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { api } from "@/lib/api";

const Doctors = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  useEffect(() => {
    api.getDoctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  return (
    <PageShell>
      <section className="bg-hero-gradient text-primary-foreground py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl">Our Doctors</h1>
        </div>
      </section>
      <section className="py-12 container mx-auto px-4 grid md:grid-cols-3 gap-5">
        {doctors.map((d) => (
          <article key={d._id} className="bg-card rounded-xl p-5 shadow-card">
            <h2 className="font-heading font-semibold">{d.name}</h2>
            <p className="text-primary mt-1">{d.specialization}</p>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{d.bio || "Experienced specialist."}</p>
            <Link to={`/doctors/${d._id}`} className="inline-block mt-4 text-primary text-sm">
              View profile
            </Link>
          </article>
        ))}
      </section>
    </PageShell>
  );
};

export default Doctors;

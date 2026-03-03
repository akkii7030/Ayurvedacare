/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { api } from "@/lib/api";

const DoctorDetail = () => {
  const { id = "" } = useParams();
  const [doctor, setDoctor] = useState<any | null>(null);

  useEffect(() => {
    api.request(`/doctors/${id}`).then(setDoctor).catch(() => setDoctor(null));
  }, [id]);

  return (
    <PageShell>
      <section className="py-14 container mx-auto px-4">
        {!doctor && <p>Doctor not found.</p>}
        {doctor && (
          <>
            <h1 className="font-heading font-bold text-3xl">{doctor.name}</h1>
            <p className="text-primary mt-2">{doctor.specialization}</p>
            <p className="text-muted-foreground mt-4">{doctor.bio || "Experienced consultant."}</p>
            <p className="mt-4">Consultation Fee: INR {doctor.fees}</p>
            <Link className="inline-block mt-6 bg-hero-gradient text-primary-foreground px-5 py-2.5 rounded-lg" to="/booking">
              Book Appointment
            </Link>
          </>
        )}
      </section>
    </PageShell>
  );
};

export default DoctorDetail;

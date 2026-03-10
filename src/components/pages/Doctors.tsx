/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { api } from "@/lib/api";
import HeroMedia from "@/components/HeroMedia";
import { Stethoscope, CheckCircle2, Star, Calendar } from "lucide-react";

const Doctors = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  useEffect(() => {
    api.getDoctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  return (
    <PageShell>
      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1551076805-e1869043e560?q=80&w=2000&auto=format&fit=crop" 
            alt="Medical Team" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm mb-6 backdrop-blur-md">
            <Stethoscope className="w-4 h-4 text-primary" />
            <span>World-class Medical Staff</span>
          </div>
          <h1 className="font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl text-white mb-6 tracking-tight">
            Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Specialists</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Our team brings together decades of experience across modern medicine and Ayurvedic treatments to provide you with the best holistic care.
          </p>
        </div>
      </section>

      {/* Roster Section */}
      <section className="py-24 bg-slate-50 relative -mt-10 rounded-t-[3rem] z-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 border-b border-slate-200 pb-6">
            <div>
              <h2 className="font-heading font-extrabold text-3xl text-slate-900 tracking-tight">Featured Doctors</h2>
              <p className="text-slate-500 font-medium mt-2">Filter and find the right specialist for your needs.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((d) => (
              <article key={d._id} className="bg-white rounded-[2rem] p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group border border-slate-100 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                
                <div className="flex items-start gap-5 mb-6">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                    <img
                      src={d.image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop&crop=face"}
                      alt={d.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                      }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute bottom-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-xl text-slate-900 group-hover:text-primary transition-colors leading-tight">
                      {d.name}
                    </h2>
                    <p className="text-primary font-bold text-sm mt-1">{d.specialization}</p>
                    <div className="flex items-center gap-1 mt-2 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs font-bold text-slate-700 ml-1">4.9 <span className="text-slate-400 font-medium">(1.2k+ reviews)</span></span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-1">
                  {d.bio || "Experienced specialist dedicated to providing exceptional patient care with advanced medical practices."}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <Link 
                    href={`/doctors/${d._id}`} 
                    className="flex justify-center items-center py-3 px-4 rounded-xl border-2 border-slate-100 text-slate-700 font-bold text-sm hover:border-primary hover:text-primary transition-colors text-center"
                  >
                    View Profile
                  </Link>
                  <Link 
                    href="/booking" 
                    className="flex justify-center items-center gap-2 py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-primary transition-colors text-center shadow-md active:scale-95"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Now
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Doctors;

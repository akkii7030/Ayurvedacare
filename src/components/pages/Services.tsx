"use client";

import Link from "next/link";
import PageShell from "@/components/PageShell";
import { serviceCatalog } from "@/data/clinic";
import { useI18n } from "@/i18n/I18nProvider";
import { Building2, Stethoscope, ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Emergency & ICU",
    items: serviceCatalog.filter((s) => s.category === "Emergency & ICU"),
  },
  {
    title: "Eye Care",
    items: serviceCatalog.filter((s) => s.category === "Eye Care"),
  },
  {
    title: "Ayurveda",
    items: serviceCatalog.filter((s) => s.category === "Ayurveda"),
  },
];

const Services = () => {
  const { t, lang } = useI18n();

  return (
    <PageShell>
      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-home.png" 
            alt="Hospital facility" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/30 rounded-full blur-[120px] pointer-events-none"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm mb-6 backdrop-blur-md">
            <Building2 className="w-4 h-4 text-primary" />
            <span>Comprehensive Paramedical Care</span>
          </div>
          <h1 className="font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl text-white mb-6 tracking-tight">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Medical Services</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            From 24/7 advanced emergency care to holistic Ayurvedic healing. Discover our state-of-the-art facilities and dedicated specialist departments.
          </p>
        </div>
      </section>

      {/* Services Content Section */}
      <section className="py-24 bg-slate-50 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Featured Specialists Banner */}
          <div className="mb-20 bg-white rounded-[2rem] border border-slate-100 p-8 md:p-12 shadow-xl grid md:grid-cols-2 gap-10 items-center transform -translate-y-20 relative z-20">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-64 md:h-full">
              <img
                src="/service-intensive.png"
                alt="Medical Specialists"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white text-sm font-medium">Over 25+ Years of Combined Experience</div>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-3xl text-slate-900 mb-4 tracking-tight">
                {lang === "hi" ? "सेवा विशेषज्ञ" : "Lead Service Specialists"}
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Our departments are headed by highly qualified professionals dedicated to delivering the highest standard of patient care.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                  <span className="font-bold text-slate-800">Dr. A. K. Vishwakarma <span className="font-normal text-slate-500 block text-sm">B.A.M.S., D.Ph</span></span>
                </li>
                <li className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0"></div>
                  <span className="font-bold text-slate-800">Dr. Anu Vishwakarma <span className="font-normal text-slate-500 block text-sm">B.A.M.S. (BHU)</span></span>
                </li>
              </ul>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="-mt-10">
            {categories.map((cat) => (
              <div key={cat.title} className="mb-20 last:mb-0">
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-slate-900 tracking-tight">{cat.title}</h2>
                  <div className="h-px bg-slate-200 flex-1 ml-4 mt-2"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {cat.items.map((s) => (
                    <article key={s.slug} className="bg-white rounded-[1.5rem] p-8 shadow-card border border-slate-100 hover:shadow-card-hover transition-all duration-300 group flex flex-col relative overflow-hidden">
                      {/* Gradient Hover background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75"></div>
                      
                      <div className="relative z-10 flex-1">
                        <h3 className="font-heading font-bold text-xl text-slate-900 mb-3 group-hover:text-primary transition-colors">
                          {lang === "hi" ? `${s.name} सेवा` : s.name}
                        </h3>
                        <p className="text-slate-600 leading-relaxed mb-6">
                          {lang === "hi" ? "लक्षण, उपचार और बुकिंग जानकारी उपलब्ध।" : s.description}
                        </p>
                      </div>
                      
                      <Link 
                        href={`/services/${s.slug}`} 
                        className="relative z-10 inline-flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide group-hover:text-primary-dark transition-colors mt-auto w-max"
                      >
                        {t("services.viewDetails")}
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </PageShell>
  );
};

export default Services;

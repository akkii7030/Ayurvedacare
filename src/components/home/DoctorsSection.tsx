import { motion } from "framer-motion";
import { Star, CalendarCheck, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { Badge } from "@/components/ui/badge";
import HeroMedia from "@/components/HeroMedia";

const doctors = [
  {
    name: "Dr. A. K. Vishwakarma",
    specialty: "Ayurvedic Medical Officer",
    qualifications: "B.A.M.S., D.Ph",
    experience: "15+ Years Experience",
    rating: 4.9,
    reviews: "1.2k+",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&auto=format&fit=crop&q=80",
    availability: "Mon-Sat • 9am-6pm",
    accent: "from-blue-500 to-cyan-500"
  },
  {
    name: "Dr. Anu Vishwakarma",
    specialty: "Senior Consultant",
    qualifications: "B.A.M.S. (BHU)",
    experience: "10+ Years Experience",
    rating: 4.8,
    reviews: "850+",
    image: "https://images.unsplash.com/photo-1594824436998-05a92bc037f4?w=800&auto=format&fit=crop&q=80",
    availability: "Mon-Sat • 10am-7pm",
    accent: "from-teal-500 to-emerald-500"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const }
  },
};

const DoctorsSection = () => {
  const { t, lang } = useI18n();
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-teal-50/50 to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <Badge
            variant="outline"
            className="mb-6 rounded-full border-primary/20 bg-primary/10 px-5 py-1.5 text-sm font-bold uppercase tracking-widest text-primary-dark shadow-sm"
          >
            Our Medical Experts
          </Badge>
          <h2 className="font-heading mb-6 text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Consult with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Top Doctors</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Our highly qualified medical professionals are dedicated to providing you with the best personalized healthcare.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 max-w-5xl mx-auto"
        >
          {doctors.map((doc, i) => (
            <motion.div
              key={doc.name}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 border border-slate-100 group relative flex flex-col sm:flex-row gap-8 items-center sm:items-start"
            >
              {/* Doctor Image */}
              <div className="relative shrink-0">
                <div className={`absolute inset-0 bg-gradient-to-br ${doc.accent} rounded-full transform rotate-6 group-hover:rotate-12 transition-transform duration-300 opacity-20 hidden sm:block`}></div>
                <div className="w-32 h-32 sm:w-40 sm:h-40 relative rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <HeroMedia
                    src={doc.image}
                    alt={doc.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Verified Badge */}
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                  <div className="bg-success text-white rounded-full p-1.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600 mb-3">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{doc.rating} Rating ({doc.reviews} Reviews)</span>
                </div>
                
                <h3 className="font-heading font-extrabold text-2xl text-slate-900 mb-1 group-hover:text-primary transition-colors">{doc.name}</h3>
                <p className="text-primary font-bold text-sm uppercase tracking-wide mb-2">{doc.specialty}</p>
                <p className="text-sm font-semibold text-slate-700 mb-4">{doc.qualifications}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-600 font-medium">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                      <CalendarCheck className="w-3.5 h-3.5 text-primary" />
                    </div>
                    {doc.availability}
                  </div>
                </div>

                <Link
                  href="/booking"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-md group-hover:shadow-lg"
                >
                  Book Consultation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default DoctorsSection;

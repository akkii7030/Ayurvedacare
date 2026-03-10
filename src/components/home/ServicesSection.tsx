import { motion } from "framer-motion";
import Link from "next/link";
import { Stethoscope, Ambulance, Clock, ShieldPlus, Dna, Activity, ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { Badge } from "@/components/ui/badge";

const services = [
  {
    icon: Stethoscope,
    title: "Specialist Consultations",
    desc: "Comprehensive eye care, Ayurveda and general medicine with experienced MBBS & BAMS doctors.",
    color: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20",
    bgLight: "bg-blue-50 text-blue-600",
    image: "/service-ayurveda.png"
  },
  {
    icon: Ambulance,
    title: "24/7 Emergency & ICU",
    desc: "Rapid ambulance dispatch, advanced oxygen support, and strictly monitored ICU care.",
    color: "from-rose-500 to-pink-500",
    shadow: "shadow-rose-500/20",
    bgLight: "bg-rose-50 text-rose-600",
    image: "/service-intensive.png"
  },
  {
    icon: Clock,
    title: "TeleCare & Follow-ups",
    desc: "Book video consultations and expert follow-up care without ever leaving your home.",
    color: "from-teal-500 to-emerald-500",
    shadow: "shadow-teal-500/20",
    bgLight: "bg-teal-50 text-teal-600",
    image: "/service-telecare.png"
  },
  {
    icon: Dna,
    title: "Advanced Lab Tests",
    desc: "State-of-the-art pathology and diagnostic testing with quick, accurate report delivery.",
    color: "from-indigo-500 to-purple-500",
    shadow: "shadow-indigo-500/20",
    bgLight: "bg-indigo-50 text-indigo-600",
    image: "https://images.unsplash.com/photo-1581093458791-9f3c3250bb8b?q=80&w=800&auto=format&fit=crop"
  },
  {
    icon: ShieldPlus,
    title: "Paramedical Courses",
    desc: "World-class certified paramedical and nursing courses for aspiring healthcare pros.",
    color: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
    bgLight: "bg-amber-50 text-amber-600",
    image: "https://images.unsplash.com/photo-1576091160550-217359f48f6c?q=80&w=800&auto=format&fit=crop"
  },
  {
    icon: Activity,
    title: "Physiotherapy & Rehab",
    desc: "Expert guided rehabilitation, pain management, and holistic physical therapy.",
    color: "from-sky-500 to-blue-500",
    shadow: "shadow-sky-500/20",
    bgLight: "bg-sky-50 text-sky-600",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  },
};

const ServicesSection = () => {
  const { t } = useI18n();
  
  return (
    <section className="bg-slate-50/50 py-24 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center max-w-3xl mx-auto"
        >
          <Badge
            variant="outline"
            className="mb-6 rounded-full border-primary/20 bg-primary/10 px-5 py-1.5 text-sm font-bold uppercase tracking-widest text-primary-dark shadow-sm"
          >
            Premium Paramedical Services
          </Badge>
          <h2 className="font-heading mb-6 text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Care for Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Family's Health</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            We combine modern emergency medicine, specialized therapeutics, and holistic care 
            to provide a unified, superior healthcare experience.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className="bg-white rounded-3xl p-0 shadow-card hover:shadow-card-hover transition-all duration-300 border border-slate-100 group relative overflow-hidden"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-20`}></div>
                <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl ${service.bgLight} flex items-center justify-center shadow-lg backdrop-blur-md bg-white/10 border border-white/20`}>
                  <service.icon className="w-6 h-6" />
                </div>
              </div>

              <div className="p-8">
                <h3 className="font-heading font-bold text-2xl text-slate-900 mb-4 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed mb-8">
                  {service.desc}
                </p>
                
                <Link 
                  href="/services" 
                  className={`inline-flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-slate-400 group-hover:text-primary transition-colors`}
                >
                  Learn More 
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-primary-dark text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Explore All Services
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;

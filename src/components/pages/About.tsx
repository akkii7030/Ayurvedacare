import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmergencyFloat from "@/components/EmergencyFloat";
import MobileBottomBar from "@/components/MobileBottomBar";
import { motion } from "framer-motion";
import { Shield, Award, Building, Users } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import HeroMedia from "@/components/HeroMedia";

const stats = [
  { icon: Users, label: "Patients Treated", value: "50,000+" },
  { icon: Award, label: "Years of Service", value: "20+" },
  { icon: Building, label: "Departments", value: "6" },
  { icon: Shield, label: "Success Rate", value: "98%" },
];

const About = () => {
  const { t, lang } = useI18n();

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />
      <main>
        {/* Premium Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-slate-900 text-center">
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
              <Building className="w-4 h-4 text-primary" />
              <span>Sharavat Pali Clinic</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl text-white mb-6 tracking-tight"
            >
              {t("about.title")}
            </motion.h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t("about.subtitle")}
            </p>
          </div>
        </section>

        {/* Premium Stats Section */}
        <section className="py-24 bg-slate-50 relative -mt-10 rounded-t-[3rem] z-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[1.5rem] p-8 text-center shadow-card border border-slate-100 hover:shadow-card-hover transition-all duration-300 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <s.icon className="w-8 h-8" />
                  </div>
                  <p className="font-heading font-extrabold text-4xl text-slate-900 mb-2">{s.value}</p>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 bg-white rounded-[2rem] p-8 md:p-12 shadow-card border border-slate-100">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading font-extrabold text-3xl text-slate-900 mb-6 tracking-tight">{t("about.visionTitle")}</h2>
                <div className="w-12 h-1 bg-primary mb-6 rounded-full"></div>
                <p className="text-slate-600 leading-relaxed mb-6 font-medium">
                  {lang === "hi"
                    ? "हमारा लक्ष्य ग्रामीण और अर्ध-शहरी जौनपुर में सभी परिवारों को सुलभ, किफायती और गुणवत्तापूर्ण स्वास्थ्य सेवा देना है।"
                    : "To provide accessible, affordable, and quality healthcare to every family in rural and semi-urban Jaunpur. We believe in combining modern medicine with the wisdom of Ayurveda."}
                </p>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {lang === "hi"
                    ? "हम विश्वस्तरीय इमरजेंसी सेवाएं, उन्नत नेत्र चिकित्सा और समग्र आयुर्वेदिक उपचार देकर स्वास्थ्य असमानता कम करना चाहते हैं।"
                    : "Our mission is to reduce healthcare inequality by offering world-class emergency services, advanced eye care, and holistic Ayurvedic treatments at the doorstep of our community."}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading font-extrabold text-3xl text-slate-900 mb-6 tracking-tight">{t("about.infrastructureTitle")}</h2>
                <div className="w-12 h-1 bg-secondary mb-6 rounded-full"></div>
                <ul className="space-y-4 mb-8">
                  {[
                    "Fully equipped ICU with ventilator support",
                    "Modern operation theatre for eye surgeries",
                    "Dedicated Ayurveda consultation rooms",
                    "24x7 pharmacy & oxygen supply",
                    "Ambulance services for emergencies",
                    "TeleCare setup for video consultations",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      </div>
                      <span className="text-slate-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <h3 className="font-heading font-bold text-xl text-slate-900 mb-4">{t("about.licenseTitle")}</h3>
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <ul className="space-y-3 text-sm text-slate-600 font-medium">
                    <li className="flex justify-between border-b border-slate-200 pb-2"><span>AYUSH Registration:</span> <span className="text-slate-900 font-bold">AY-2026-JNP-001</span></li>
                    <li className="flex justify-between border-b border-slate-200 pb-2"><span>Clinical Establishment:</span> <span className="text-slate-900 font-bold">UP-JNP-CE-2471</span></li>
                    <li className="flex justify-between"><span>Telemedicine Consent:</span> <span className="text-green-600 font-bold">Enabled</span></li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Link href="/doctors" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-primary transition-colors hover:shadow-lg active:scale-95 w-full text-center">
                    {lang === "hi" ? "डॉक्टर्स प्रोफाइल देखें" : "View Doctors Detailed Profile"}
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <EmergencyFloat />
      <MobileBottomBar />
    </div>
  );
};

export default About;

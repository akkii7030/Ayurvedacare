import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmergencyFloat from "@/components/EmergencyFloat";
import MobileBottomBar from "@/components/MobileBottomBar";
import { motion } from "framer-motion";
import { Shield, Award, Building, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nProvider";

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
        {/* Hero */}
        <section className="bg-hero-gradient text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading font-bold text-4xl md:text-5xl mb-4"
            >
              {t("about.title")}
            </motion.h1>
            <p className="opacity-90 max-w-2xl mx-auto">
              {t("about.subtitle")}
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <p className="font-heading font-bold text-2xl text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading font-bold text-2xl text-foreground mb-4">{t("about.visionTitle")}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === "hi"
                    ? "हमारा लक्ष्य ग्रामीण और अर्ध-शहरी जौनपुर में सभी परिवारों को सुलभ, किफायती और गुणवत्तापूर्ण स्वास्थ्य सेवा देना है।"
                    : "To provide accessible, affordable, and quality healthcare to every family in rural and semi-urban Jaunpur. We believe in combining modern medicine with the wisdom of Ayurveda."}
                </p>
                <p className="text-muted-foreground leading-relaxed">
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
                <h2 className="font-heading font-bold text-2xl text-foreground mb-4">{t("about.infrastructureTitle")}</h2>
                <ul className="space-y-3 text-muted-foreground">
                  {[
                    "Fully equipped ICU with ventilator support",
                    "Modern operation theatre for eye surgeries",
                    "Dedicated Ayurveda consultation rooms",
                    "24x7 pharmacy & oxygen supply",
                    "Ambulance services for emergencies",
                    "TeleCare setup for video consultations",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <h3 className="font-heading font-semibold text-lg mt-7 mb-2">{t("about.licenseTitle")}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>AYUSH Registration: AY-2026-JNP-001</li>
                  <li>Clinical Establishment: UP-JNP-CE-2471</li>
                  <li>Telemedicine Consent Framework: Enabled</li>
                </ul>
                <div className="mt-6 rounded-xl overflow-hidden border border-border">
                  <img
                    src="/doctor-poster.jpg"
                    alt="Sharavat Pali Clinic Doctors"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                    }}
                    className="w-full h-56 object-cover"
                    loading="lazy"
                  />
                </div>
                <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                  <li>Dr. B. P. Rai - M.S. (Ophthalmology)</li>
                  <li>Dr. A. K. Vishwakarma - B.A.M.S., D.Ph</li>
                  <li>Dr. Anu Vishwakarma - B.A.M.S. (BHU)</li>
                </ul>
                <Link className="inline-block text-primary text-sm mt-4" to="/doctors">{lang === "hi" ? "डॉक्टर्स प्रोफाइल देखें" : "View Doctors Detailed Profile"}</Link>
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

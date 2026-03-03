import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Stethoscope, Eye, Leaf, Ambulance, Syringe, Activity } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const services = [
  { icon: Ambulance, title: "Emergency & ICU", desc: "24x7 critical care with oxygen support", link: "/services/icu-care" },
  { icon: Eye, title: "Cataract Surgery", desc: "Advanced phaco surgery with IOL implant", link: "/services/cataract-surgery" },
  { icon: Leaf, title: "Ayurvedic Care", desc: "Joint pain, PCOS, skin & Panchakarma", link: "/services/joint-pain-ayurveda" },
  { icon: Stethoscope, title: "TeleCare", desc: "Video consultation from home", link: "/booking" },
  { icon: Activity, title: "Retina & Glaucoma", desc: "Expert retina diagnosis & treatment", link: "/services" },
  { icon: Syringe, title: "Ambulance Service", desc: "Quick response ambulance pickup", link: "/contact" },
];

const ServicesSection = () => {
  const { t, lang } = useI18n();
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-2">{t("home.services.label")}</p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground">
            {t("home.services.title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={s.link}
                className="block bg-card rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-foreground text-sm">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{lang === "hi" ? "विस्तृत विवरण उपलब्ध" : s.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

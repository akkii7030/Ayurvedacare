import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Clock, Phone } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-hero-gradient text-primary-foreground">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary-foreground/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-emergency text-emergency-foreground px-4 py-1.5 rounded-full text-sm font-semibold mb-6 shadow-emergency animate-pulse-emergency"
          >
            <Phone className="w-4 h-4" />
            {t("home.hero.badge")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-extrabold text-4xl md:text-6xl leading-tight mb-4"
          >
            {t("home.hero.title1")}{" "}
            <span className="relative">
              {t("home.hero.title2")}
              <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-secondary rounded-full opacity-60" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            {t("home.hero.desc")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              to="/booking"
              className="inline-flex items-center justify-center gap-2 bg-primary-foreground text-primary-dark px-6 py-3 rounded-lg font-heading font-semibold text-base hover:bg-primary-foreground/90 transition-colors"
            >
              {t("cta.bookAppointment")}
            </Link>
            <a
              href="tel:+919999999999"
              className="inline-flex items-center justify-center gap-2 border-2 border-primary-foreground/40 text-primary-foreground px-6 py-3 rounded-lg font-heading font-semibold text-base hover:bg-primary-foreground/10 transition-colors"
            >
              <Phone className="w-4 h-4" />
              {t("cta.callNow")}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 mt-10 text-sm opacity-80"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t("home.hero.ayush")}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t("home.hero.badge")}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {t("home.hero.telecare")}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

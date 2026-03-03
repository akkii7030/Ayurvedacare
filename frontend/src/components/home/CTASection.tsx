import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const CTASection = () => {
  const { t } = useI18n();
  return (
    <section className="py-16 bg-hero-gradient text-primary-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
            {t("home.cta.title")}
          </h2>
          <p className="opacity-90 mb-8 leading-relaxed">
            {t("home.cta.desc")}
          </p>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 bg-primary-foreground text-primary-dark px-8 py-3.5 rounded-lg font-heading font-semibold text-base hover:bg-primary-foreground/90 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            {t("cta.bookNow")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

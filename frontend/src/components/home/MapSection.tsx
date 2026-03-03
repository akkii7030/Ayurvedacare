import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";

const MapSection = () => {
  const { t } = useI18n();
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-2">{t("home.location.label")}</p>
          <h2 className="font-heading font-bold text-3xl text-foreground">{t("home.location.title")}</h2>
          <p className="text-muted-foreground text-sm mt-2">Kushaha Road, Singra Mau, Jaunpur, Uttar Pradesh</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-xl overflow-hidden shadow-card max-w-4xl mx-auto"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28867.8!2d82.68!3d25.73!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399267!2sJaunpur!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Sharavat Pali Clinic Location"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default MapSection;

import { motion } from "framer-motion";
import { Heart, Eye, Leaf } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const AboutSection = () => {
  const { t, lang } = useI18n();
  const cards = [
    {
      icon: Heart,
      title: lang === "hi" ? "इमरजेंसी और ICU" : "Emergency & ICU",
      desc:
        lang === "hi"
          ? "24x7 इमरजेंसी सेवा, ऑक्सीजन सपोर्ट और एम्बुलेंस सुविधा।"
          : "Round-the-clock emergency care with ICU facilities, oxygen support, and ambulance services.",
      color: "text-emergency",
    },
    {
      icon: Eye,
      title: lang === "hi" ? "नेत्र देखभाल" : "Eye Care Center",
      desc:
        lang === "hi"
          ? "कैटरैक्ट, ग्लूकोमा और रेटिना के लिए विशेषज्ञ उपचार।"
          : "Advanced cataract surgery, glaucoma treatment, and retina care by expert ophthalmologists.",
      color: "text-primary",
    },
    {
      icon: Leaf,
      title: lang === "hi" ? "आयुर्वेद और वेलनेस" : "Ayurveda & Wellness",
      desc:
        lang === "hi"
          ? "जॉइंट पेन, PCOS, स्किन डिसऑर्डर और पंचकर्म मार्गदर्शन।"
          : "Authentic Ayurvedic treatments for joint pain, PCOS, skin disorders, and Panchakarma guidance.",
      color: "text-success",
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-2">{t("home.about.label")}</p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            {t("home.about.title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("home.about.desc")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 border border-border/60"
            >
              <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

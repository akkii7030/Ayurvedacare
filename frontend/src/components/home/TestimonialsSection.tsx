import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const testimonials = [
  {
    name: "Rajesh Kumar",
    city: "Jaunpur",
    rating: 5,
    text: "Excellent emergency care. The doctors were available at midnight and saved my father's life. Highly recommended!",
  },
  {
    name: "Sunita Devi",
    city: "Singra Mau",
    rating: 5,
    text: "Got my cataract surgery done here. Very affordable and the results are amazing. Dr. Priya is wonderful.",
  },
  {
    name: "Mohd. Irfan",
    city: "Mau",
    rating: 4,
    text: "The Ayurvedic treatment for my joint pain worked wonders. Very knowledgeable doctors and caring staff.",
  },
];

const TestimonialsSection = () => {
  const { t, lang } = useI18n();
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-2">{t("home.testimonials.label")}</p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground">
            {t("home.testimonials.title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-6 shadow-card relative"
            >
              <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{lang === "hi" ? "उत्कृष्ट सेवा, डॉक्टरों का व्यवहार बहुत अच्छा था।" : t.text}"</p>
              <div>
                <p className="font-heading font-semibold text-sm text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.city}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

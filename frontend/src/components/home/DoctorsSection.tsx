import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const doctors = [
  {
    name: "Dr. B. P. Rai",
    specialty: "M.S. (Ophthalmology)",
    experience: "20+ Years Experience",
    rating: 4.8,
    image: "/doctor-poster.jpg",
  },
  {
    name: "Dr. A. K. Vishwakarma",
    specialty: "B.A.M.S., D.Ph",
    experience: "15+ Years Experience",
    rating: 4.9,
    image: "/doctor-poster.jpg",
  },
  {
    name: "Dr. Anu Vishwakarma",
    specialty: "B.A.M.S. (BHU)",
    experience: "10+ Years Experience",
    rating: 4.7,
    image: "/doctor-poster.jpg",
  },
];

const DoctorsSection = () => {
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
          <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-2">{t("home.doctors.label")}</p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground">
            {t("home.doctors.title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {doctors.map((doc, i) => (
            <motion.div
              key={doc.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow text-center"
            >
              <img
                src={doc.image}
                alt={doc.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                }}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                loading="lazy"
              />
              <h3 className="font-heading font-semibold text-foreground">{doc.name}</h3>
              <p className="text-sm text-primary font-medium mt-1">{doc.specialty}</p>
              <p className="text-xs text-muted-foreground mt-1">{lang === "hi" ? doc.experience.replace("Years Experience", "वर्ष अनुभव") : doc.experience}</p>
              <div className="flex items-center justify-center gap-1 mt-3">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-foreground">{doc.rating}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;

import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nProvider";

const ProductHighlightSection = () => {
  const { t, lang } = useI18n();
  const products = [
    {
      name: lang === "hi" ? "त्रिफला वेलनेस पैक" : "Triphala Wellness Pack",
      image:
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1200&auto=format&fit=crop",
      description: lang === "hi" ? "आयुर्वेदिक फॉर्मूलेशन से पाचन और डिटॉक्स सपोर्ट।" : "Digestive and detox support by Ayurvedic formulation.",
    },
    {
      name: lang === "hi" ? "जॉइंट रिलीफ ऑयल" : "Joint Relief Oil",
      image:
        "https://images.unsplash.com/photo-1612277795421-9bc7706a4a41?q=80&w=1200&auto=format&fit=crop",
      description: lang === "hi" ? "मांसपेशी और जोड़ों के आराम के लिए दर्द निवारक मिश्रण।" : "Pain support blend for muscle and joint comfort.",
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-2">{t("home.products.label")}</p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl">{t("home.products.title")}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {products.map((p) => (
            <article key={p.name} className="bg-card rounded-xl p-5 shadow-card">
              <img src={p.image} alt={p.name} className="w-full h-44 rounded-lg object-cover mb-4" loading="lazy" />
              <h3 className="font-heading font-semibold">{p.name}</h3>
              <p className="text-sm text-muted-foreground mt-2">{p.description}</p>
            </article>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/products" className="inline-block bg-hero-gradient text-primary-foreground px-6 py-2.5 rounded-lg">
            {t("home.products.explore")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductHighlightSection;

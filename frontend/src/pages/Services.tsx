import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { serviceCatalog } from "@/data/clinic";
import { useI18n } from "@/i18n/I18nProvider";

const categories = [
  {
    title: "Emergency & ICU",
    items: serviceCatalog.filter((s) => s.category === "Emergency & ICU"),
  },
  {
    title: "Eye Care",
    items: serviceCatalog.filter((s) => s.category === "Eye Care"),
  },
  {
    title: "Ayurveda",
    items: serviceCatalog.filter((s) => s.category === "Ayurveda"),
  },
];

const Services = () => {
  const { t, lang } = useI18n();

  return (
    <PageShell>
    <section className="bg-hero-gradient text-primary-foreground py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">{t("services.title")}</h1>
        <p className="opacity-90 max-w-2xl mx-auto">{t("services.subtitle")}</p>
      </div>
    </section>
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-10 bg-card rounded-xl border border-border p-5 shadow-card grid md:grid-cols-2 gap-5 items-center">
          <img
            src="/doctor-poster.jpg"
            alt="Sharavat Pali Clinic Services Poster"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
            }}
            className="w-full h-56 object-cover rounded-lg"
            loading="lazy"
          />
          <div>
            <h3 className="font-heading font-semibold text-xl">{lang === "hi" ? "सेवा विशेषज्ञ" : "Service Specialists"}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Dr. B. P. Rai - M.S. (Ophthalmology)</li>
              <li>Dr. A. K. Vishwakarma - B.A.M.S., D.Ph</li>
              <li>Dr. Anu Vishwakarma - B.A.M.S. (BHU)</li>
            </ul>
          </div>
        </div>
        {categories.map((cat) => (
          <div key={cat.title} className="mb-12">
            <h2 className="font-heading font-bold text-2xl mb-6">{cat.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {cat.items.map((s) => (
                <article key={s.slug} className="bg-card rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow">
                  <h3 className="font-heading font-semibold mb-2">{lang === "hi" ? `${s.name} सेवा` : s.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{lang === "hi" ? "लक्षण, उपचार और बुकिंग जानकारी उपलब्ध।" : s.description}</p>
                  <Link to={`/services/${s.slug}`} className="text-sm font-medium text-primary hover:underline">
                    {t("services.viewDetails")}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  </PageShell>
  );
};

export default Services;

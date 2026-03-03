/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import PageShell from "@/components/PageShell";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { whatsappNumber } from "@/data/clinic";
import { useI18n } from "@/i18n/I18nProvider";

const defaultImages = [
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1612277795421-9bc7706a4a41?q=80&w=1200&auto=format&fit=crop",
];

const Products = () => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [products, setProducts] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const categories = useMemo(() => ["all", ...new Set(products.map((p) => p.category || "General"))], [products]);

  const filtered = products.filter((p) => {
    const byText = p.name?.toLowerCase().includes(query.toLowerCase());
    const byCategory = category === "all" || (p.category || "General") === category;
    return byText && byCategory;
  });

  const sendInquiry = async (product: any) => {
    const customerName = prompt(t("contact.yourName"));
    const customerPhone = prompt(t("booking.phone"));
    if (!customerName || !customerPhone) return;

    await api.createInquiry(product._id, {
      name: customerName,
      phone: customerPhone,
      quantity: 1,
      message: `Inquiry for ${product.name}`,
    });
    toast({ title: t("products.saveInquiry"), description: t("contact.subtitle") });
  };

  return (
    <PageShell>
      <section className="bg-hero-gradient text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">{t("products.title")}</h1>
          <p className="opacity-90 max-w-2xl mx-auto">{t("products.subtitle")}</p>
        </div>
      </section>
      <section className="py-8 container mx-auto px-4 flex flex-col sm:flex-row gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("products.search")} className="px-4 py-2.5 rounded-lg border border-input bg-card text-sm flex-1" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2.5 rounded-lg border border-input bg-card text-sm">
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </section>
      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p, i) => (
              <article key={p._id} className="bg-card rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow">
                <img src={p.image || defaultImages[i % defaultImages.length]} alt={p.name} className="w-full h-40 object-cover rounded-lg mb-4" loading="lazy" />
                <h3 className="font-heading font-semibold text-foreground">{p.name}</h3>
                {typeof p.price === "number" && <p className="text-primary font-bold text-lg mt-1">INR {p.price}</p>}
                <p className="text-sm text-muted-foreground mt-1 mb-4">{p.description}</p>
                {p.offerBadge && <p className="text-xs text-emergency mb-2">{p.offerBadge}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`I want to order ${p.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-success text-success-foreground px-4 py-2 rounded-lg text-sm font-semibold justify-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t("products.whatsapp")}
                  </a>
                  <button onClick={() => sendInquiry(p)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold">
                    {t("products.saveInquiry")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Products;

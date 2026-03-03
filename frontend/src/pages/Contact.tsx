/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Phone, MessageCircle, MapPin, Mail, Clock } from "lucide-react";
import PageShell from "@/components/PageShell";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n/I18nProvider";

const Contact = () => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast({ title: t("common.fillAllFields"), variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      await api.createContact(form);
      toast({ title: t("contact.send"), description: t("contact.subtitle") });
      setForm({ name: "", phone: "", message: "" });
    } catch (error: any) {
      toast({ title: "Unable to submit", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="bg-hero-gradient text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">{t("contact.title")}</h1>
          <p className="opacity-90">{t("contact.subtitle")}</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="font-heading font-bold text-2xl mb-6">{t("contact.getInTouch")}</h2>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: "Address", value: "Kushaha Road, Singra Mau, Jaunpur, UP" },
                  { icon: Phone, label: "Phone", value: "+91-9999999999" },
                  { icon: Phone, label: "Emergency", value: "+91-9999999999 (24x7)" },
                  { icon: MessageCircle, label: "WhatsApp", value: "+91-9999999999" },
                  { icon: Mail, label: "Email", value: "info@sharavatclinic.com" },
                  { icon: Clock, label: "OPD Timings", value: "Mon-Sat: 9:00 AM - 8:00 PM" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-heading font-bold text-2xl mb-6">{t("contact.sendMessage")}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm" placeholder={t("contact.yourName")} />
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm" placeholder={t("contact.phonePlaceholder")} />
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm resize-none" placeholder={t("contact.messagePlaceholder")} />
                <button type="submit" disabled={loading} className="w-full bg-hero-gradient text-primary-foreground py-3 rounded-lg font-heading font-semibold disabled:opacity-70">
                  {loading ? t("contact.sending") : t("contact.send")}
                </button>
              </form>
            </div>
          </div>
          <div className="mt-12 rounded-xl overflow-hidden shadow-card">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28867.8!2d82.68!3d25.73!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399267!2sJaunpur!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="320"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Clinic Location"
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Contact;

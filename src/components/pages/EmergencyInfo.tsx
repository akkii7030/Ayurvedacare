import PageShell from "@/components/PageShell";
import { emergencyPhone } from "@/data/clinic";
import { useI18n } from "@/i18n/I18nProvider";

const EmergencyInfo = () => {
  const { lang } = useI18n();
  return (
    <PageShell>
  <section className="bg-emergency text-emergency-foreground py-14">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-heading font-bold text-4xl">{lang === "hi" ? "24x7 इमरजेंसी जानकारी" : "24x7 Emergency Information"}</h1>
        <p className="mt-3">{lang === "hi" ? "ICU बेड, ऑक्सीजन सपोर्ट और एम्बुलेंस सुविधा उपलब्ध है।" : "ICU beds, oxygen support, ambulance and emergency triage available."}</p>
        <a href={`tel:${emergencyPhone}`} className="inline-block mt-6 rounded-full bg-white px-7 py-3 text-sm font-semibold text-emergency shadow-emergency">
          {lang === "hi" ? "अभी इमरजेंसी कॉल करें" : "Call Emergency Now"}
        </a>
      </div>
    </section>
    <section className="py-12 container mx-auto px-4 grid md:grid-cols-3 gap-5">
      <div className="bg-card rounded-xl p-5 shadow-card">{lang === "hi" ? "ICU बेड काउंटर" : "ICU Bed Counter"}: <b>{lang === "hi" ? "उपलब्ध" : "Available"}</b></div>
      <div className="bg-card rounded-xl p-5 shadow-card">{lang === "hi" ? "एम्बुलेंस डिस्पैच" : "Ambulance Dispatch"}: <b>{lang === "hi" ? "15 मिनट के अंदर" : "Under 15 min"}</b></div>
      <div className="bg-card rounded-xl p-5 shadow-card">{lang === "hi" ? "क्रिटिकल अलर्ट" : "Critical Alert"}: <b>{lang === "hi" ? "ऑन-कॉल ड्यूटी सक्रिय" : "On-call duty active"}</b></div>
    </section>
  </PageShell>
  );
};

export default EmergencyInfo;

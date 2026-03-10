"use client";

import LegalPage from "@/components/pages/Legal";
import { useI18n } from "@/i18n/I18nProvider";

export default function TermsPage() {
  const { lang, t } = useI18n();

  const sections = [
    {
      heading: lang === "hi" ? "टेलीमेडिसिन सहमति" : "Telemedicine Consent",
      text:
        lang === "hi"
          ? "ऑनलाइन बुकिंग से आप डिजिटल परामर्श के लिए सहमति देते हैं।"
          : "By booking online, you consent to remote consultation and digital communication.",
    },
    {
      heading: lang === "hi" ? "अपॉइंटमेंट नीति" : "Appointment Policy",
      text:
        lang === "hi"
          ? "स्लॉट डॉक्टर उपलब्धता के अनुसार रहेंगे।"
          : "Slots are subject to doctor availability and may be rescheduled by the clinic if needed.",
    },
  ];

  return <LegalPage title={t("footer.terms")} sections={sections} />;
}

"use client";

import LegalPage from "@/components/pages/Legal";
import { useI18n } from "@/i18n/I18nProvider";

export default function PrivacyPage() {
  const { lang, t } = useI18n();

  const sections = [
    {
      heading: lang === "hi" ? "डेटा संग्रह" : "Data Collection",
      text:
        lang === "hi"
          ? "हम प्रोफाइल, बुकिंग और भुगतान से जुड़ा डेटा सेवा देने हेतु संग्रह करते हैं।"
          : "We collect profile, booking, payment and consultation details needed to deliver healthcare services.",
    },
    {
      heading: lang === "hi" ? "भुगतान हैंडलिंग" : "Payment Handling",
      text:
        lang === "hi"
          ? "भुगतान Razorpay के माध्यम से सुरक्षित सत्यापन के साथ प्रोसेस किया जाता है।"
          : "Payments are processed through Razorpay with verification signatures and audit logging.",
    },
    {
      heading: "Cookies",
      text:
        lang === "hi"
          ? "सेशन और लॉगिन के लिए कुकीज/लोकल स्टोरेज का उपयोग होता है।"
          : "Cookies and local storage are used for authentication and session continuity.",
    },
  ];

  return <LegalPage title={t("footer.privacy")} sections={sections} />;
}

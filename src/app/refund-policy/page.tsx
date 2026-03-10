"use client";

import LegalPage from "@/components/pages/Legal";
import { useI18n } from "@/i18n/I18nProvider";

export default function RefundPolicyPage() {
  const { lang, t } = useI18n();

  const sections = [
    {
      heading: lang === "hi" ? "रद्द करने की अवधि" : "Cancellation Window",
      text:
        lang === "hi"
          ? "समय सीमा के भीतर रद्द करने पर रिफंड पात्रता लागू होगी।"
          : "Appointments cancelled within the allowed window are eligible for partial/full refund.",
    },
    {
      heading: lang === "hi" ? "समय सीमा" : "Timeline",
      text:
        lang === "hi"
          ? "स्वीकृत रिफंड 7-10 कार्यदिवस में शुरू किया जाता है।"
          : "Approved refunds are initiated within 7-10 working days.",
    },
  ];

  return <LegalPage title={t("footer.refund")} sections={sections} />;
}

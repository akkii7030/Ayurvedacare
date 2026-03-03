import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Doctors from "./pages/Doctors";
import DoctorDetail from "./pages/DoctorDetail";
import Products from "./pages/Products";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";
import Testimonials from "./pages/Testimonials";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";
import Legal from "./pages/Legal";
import EmergencyInfo from "./pages/EmergencyInfo";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { useI18n } from "./i18n/I18nProvider";

const queryClient = new QueryClient();

const App = () => {
  const { lang, t } = useI18n();
  const privacySections = [
    { heading: lang === "hi" ? "डेटा संग्रह" : "Data Collection", text: lang === "hi" ? "हम प्रोफाइल, बुकिंग और भुगतान से जुड़ा डेटा सेवा देने हेतु संग्रह करते हैं।" : "We collect profile, booking, payment and consultation details needed to deliver healthcare services." },
    { heading: lang === "hi" ? "भुगतान हैंडलिंग" : "Payment Handling", text: lang === "hi" ? "भुगतान Razorpay के माध्यम से सुरक्षित सत्यापन के साथ प्रोसेस किया जाता है।" : "Payments are processed through Razorpay with verification signatures and audit logging." },
    { heading: "Cookies", text: lang === "hi" ? "सेशन और लॉगिन के लिए कूकीज़/लोकल स्टोरेज का उपयोग होता है।" : "Cookies and local storage are used for authentication and session continuity." },
  ];
  const termsSections = [
    { heading: lang === "hi" ? "टेलीमेडिसिन सहमति" : "Telemedicine Consent", text: lang === "hi" ? "ऑनलाइन बुकिंग से आप डिजिटल परामर्श के लिए सहमति देते हैं।" : "By booking online, you consent to remote consultation and digital communication." },
    { heading: lang === "hi" ? "अपॉइंटमेंट नीति" : "Appointment Policy", text: lang === "hi" ? "स्लॉट डॉक्टर उपलब्धता के अनुसार रहेंगे।" : "Slots are subject to doctor availability and may be rescheduled by the clinic if needed." },
  ];
  const refundSections = [
    { heading: lang === "hi" ? "रद्द करने की अवधि" : "Cancellation Window", text: lang === "hi" ? "समय सीमा के भीतर रद्द करने पर रिफंड पात्रता लागू होगी।" : "Appointments cancelled within the allowed window are eligible for partial/full refund." },
    { heading: lang === "hi" ? "समय सीमा" : "Timeline", text: lang === "hi" ? "स्वीकृत रिफंड 7-10 कार्यदिवस में शुरू किया जाता है।" : "Approved refunds are initiated within 7-10 working days." },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorDetail />} />
            <Route path="/products" element={<Products />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Legal title={t("footer.privacy")} sections={privacySections} />} />
            <Route path="/terms" element={<Legal title={t("footer.terms")} sections={termsSections} />} />
            <Route path="/refund-policy" element={<Legal title={t("footer.refund")} sections={refundSections} />} />
            <Route path="/emergency-info" element={<EmergencyInfo />} />
            <Route path="/dashboard/patient" element={<PatientDashboard />} />
            <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

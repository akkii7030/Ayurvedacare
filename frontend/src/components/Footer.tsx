import { Link } from "react-router-dom";
import { Phone, MessageCircle, MapPin, Mail } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-white text-primary-dark border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="w-14 h-14 rounded-lg overflow-hidden border border-primary/20 bg-white mb-3">
              <img
                src="/logo.png"
                alt="Sharavat Pali Clinic Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
            <h3 className="font-heading font-bold text-xl mb-3">{t("brand.name")}</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              {t("footer.aboutText")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-3">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2 text-sm text-primary/80">
              <li><Link to="/about" className="hover:opacity-100 transition-opacity">{t("footer.aboutUs")}</Link></li>
              <li><Link to="/services" className="hover:opacity-100 transition-opacity">{t("footer.services")}</Link></li>
              <li><Link to="/products" className="hover:opacity-100 transition-opacity">{t("footer.dawaiStore")}</Link></li>
              <li><Link to="/booking" className="hover:opacity-100 transition-opacity">{t("cta.bookAppointment")}</Link></li>
              <li><Link to="/testimonials" className="hover:opacity-100 transition-opacity">{t("footer.testimonials")}</Link></li>
              <li><Link to="/blog" className="hover:opacity-100 transition-opacity">{t("nav.blog")}</Link></li>
              <li><Link to="/contact" className="hover:opacity-100 transition-opacity">{t("nav.contact")}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold mb-3">{t("footer.services")}</h4>
            <ul className="space-y-2 text-sm text-primary/80">
              <li>Emergency & ICU</li>
              <li>Cataract Surgery</li>
              <li>Ayurvedic Treatment</li>
              <li>TeleCare Consultation</li>
              <li>Ambulance Service</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-3">{t("footer.contactUs")}</h4>
            <ul className="space-y-3 text-sm text-primary/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                Kushaha Road, Singra Mau, Jaunpur, UP
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                +91-XXXXXXXXXX
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 shrink-0" />
                WhatsApp: +91-XXXXXXXXXX
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                info@sharavatclinic.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-primary/70">
          <p>&copy; {new Date().getFullYear()} {t("brand.name")}. {t("footer.rights")}</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:opacity-100">{t("footer.privacy")}</Link>
            <Link to="/terms" className="hover:opacity-100">{t("footer.terms")}</Link>
            <Link to="/refund-policy" className="hover:opacity-100">{t("footer.refund")}</Link>
            <Link to="/emergency-info" className="hover:opacity-100">{t("footer.emergencyInfo")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

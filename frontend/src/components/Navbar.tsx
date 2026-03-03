import { Link, useLocation } from "react-router-dom";
import { Phone, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";

const navLinks = [
  { to: "/", key: "nav.home" },
  { to: "/about", key: "nav.about" },
  { to: "/services", key: "nav.services" },
  { to: "/doctors", key: "nav.doctors" },
  { to: "/products", key: "nav.products" },
  { to: "/blog", key: "nav.blog" },
  { to: "/contact", key: "nav.contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { t, lang, toggleLang } = useI18n();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md shadow-card border-b border-border">
      <nav className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-border bg-white flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Sharavat Pali Clinic Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>
          <div className="hidden sm:block">
            <p className="font-heading font-bold text-foreground text-sm leading-tight">{t("brand.name")}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{t("brand.tagline")}</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === l.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {t(l.key)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            to="/booking"
            className="hidden sm:inline-flex items-center gap-1.5 bg-hero-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-heading font-semibold hover:opacity-90 transition-opacity"
          >
            {t("cta.bookAppointment")}
          </Link>
          <button onClick={toggleLang} className="px-2.5 py-2 rounded-lg border border-input text-xs font-semibold" aria-label="toggle-language">
            {lang === "en" ? t("lang.hi") : t("lang.en")}
          </button>
          <a
            href="tel:+919999999999"
            className="inline-flex items-center gap-1.5 bg-emergency text-emergency-foreground px-3 py-2 rounded-lg text-sm font-semibold animate-pulse-emergency"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">{t("common.emergency")}</span>
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-card border-t border-border"
          >
            <ul className="flex flex-col p-4 gap-1">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === l.to
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t(l.key)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/booking"
                  onClick={() => setOpen(false)}
                  className="block mt-2 text-center bg-hero-gradient text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-heading font-semibold"
                >
                  {t("cta.bookAppointment")}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

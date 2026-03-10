"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, PhoneCall, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClinicBranding } from "@/components/branding/ClinicBranding";
import { Badge } from "@/components/ui/badge";
import { authStore } from "@/lib/api";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/doctors", label: "Doctors" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Insights" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    setUser(authStore.getUser());
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="absolute inset-0 border-b border-slate-200/50 pointer-events-none"></div>
      
      <nav className="container mx-auto flex items-center justify-between px-4 relative z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <ClinicBranding showTagline={false} />
        </Link>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center gap-1 rounded-full bg-white/50 border border-slate-200/50 backdrop-blur-md p-1.5 shadow-sm">
          {navLinks.map((l) => {
            const isActive = pathname === l.to;
            return (
              <li key={l.to}>
                <Link
                  href={l.to}
                  className={`relative px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    isActive
                      ? "text-primary-dark bg-primary/10"
                      : "text-slate-600 hover:text-primary hover:bg-slate-50"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <Badge
            variant="outline"
            className="hidden xl:flex items-center gap-1.5 rounded-full border-emergency/20 bg-emergency/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-emergency"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emergency opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emergency shadow-emergency"></span>
            </span>
            24/7 ER
          </Badge>

          {user ? (
            <Link
              href={
                ["admin", "receptionist", "accountant"].includes(user.role)
                  ? "/dashboard/admin"
                  : user.role === "doctor"
                  ? "/dashboard/doctor"
                  : "/dashboard/patient"
              }
              className="flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary-dark border border-primary/20 hover:bg-primary/20 transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all"
            >
              Login
            </Link>
          )}
          
          <Link
            href="/booking"
            className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5 group"
          >
            <PhoneCall className="h-4 w-4" />
            Book TeleCare
            <ArrowRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="rounded-full bg-white border border-slate-200 p-2.5 text-slate-800 shadow-sm transition-transform active:scale-95"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-slate-100 bg-white shadow-xl absolute top-full left-0 w-full"
          >
            <div className="p-4 flex flex-col gap-2">
              {navLinks.map((l) => {
                 const isActive = pathname === l.to;
                 return (
                  <Link
                    key={l.to}
                    href={l.to}
                    onClick={() => setOpen(false)}
                    className={`block px-5 py-4 rounded-xl text-base font-bold transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary-dark"
                        : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                    }`}
                  >
                    {l.label}
                  </Link>
                )
              })}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                <Link
                  href="/booking"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white px-5 py-4 rounded-xl font-bold shadow-md active:scale-95 transition-transform"
                >
                  <PhoneCall className="h-5 w-5" />
                  Book TeleCare
                </Link>
                <a
                  href="tel:+916386192882"
                  className="flex items-center justify-center gap-2 w-full bg-emergency/10 text-emergency px-5 py-4 rounded-xl font-bold active:scale-95 transition-transform"
                >
                  Call Emergency (24/7)
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

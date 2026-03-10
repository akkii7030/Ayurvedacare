"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, HeartPulse } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
      {/* Premium ambient glow */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          <div className="lg:pr-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl shadow-lg group-hover:shadow-primary/20 transition-all">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary transition-all">
                Sharavat <span className="font-light">Clinic</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Providing premium paramedical services, 24/7 emergency care, and holistic Ayurvedic treatments with deep compassion and clinical excellence.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:border-primary flex items-center justify-center transition-all group">
                <Facebook className="w-4 h-4 text-slate-300 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:border-primary flex items-center justify-center transition-all group">
                <Twitter className="w-4 h-4 text-slate-300 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:border-primary flex items-center justify-center transition-all group">
                <Instagram className="w-4 h-4 text-slate-300 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:border-primary flex items-center justify-center transition-all group">
                <Linkedin className="w-4 h-4 text-slate-300 group-hover:text-white" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-lg mb-6 text-white">Quick Links</h4>
            <ul className="space-y-4 text-sm text-slate-400 font-medium">
              <li><Link href="/about" className="hover:text-primary transition-colors flex items-center gap-2">&rarr; About Us</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors flex items-center gap-2">&rarr; Our Services</Link></li>
              <li><Link href="/doctors" className="hover:text-primary transition-colors flex items-center gap-2">&rarr; Meet Our Doctors</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors flex items-center gap-2">&rarr; Health Insights</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-2">&rarr; Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-lg mb-6 text-white">Departments</h4>
            <ul className="space-y-4 text-sm text-slate-400 font-medium">
              <li><Link href="/services" className="hover:text-primary transition-colors flex items-center gap-2">&rarr; 24/7 Emergency Care</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors flex items-center gap-2">&rarr; Intensive Care Unit</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors flex items-center gap-2">&rarr; Ayurvedic Treatments</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors flex items-center gap-2">&rarr; Advanced Lab Tests</Link></li>
              <li><Link href="/booking" className="hover:text-primary transition-colors flex items-center gap-2">&rarr; TeleCare Consultations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-lg mb-6 text-white">Contact Info</h4>
            <ul className="space-y-5 text-sm text-slate-400 font-medium">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="mt-1">Kushaha Road, Singra Mau, <br/>Jaunpur, UP 222136</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span className="flex flex-col mt-1">
                  <a href="tel:+916386192882" className="hover:text-white transition-colors">+91 63861 92882</a>
                  <a href="tel:+919554530504" className="hover:text-white transition-colors">+91 95545 30504</a>
                </span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <a href="mailto:info@sharavatclinic.com" className="hover:text-white transition-colors">info@sharavatclinic.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-medium w-full">
          <p>&copy; {new Date().getFullYear()} Sharavat Pali Clinic. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

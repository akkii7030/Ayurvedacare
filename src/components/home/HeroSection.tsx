import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, CheckCircle, ShieldCheck, Clock, Award, Users } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import HeroMedia from "@/components/HeroMedia";

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50 pt-24 pb-16 md:pt-32 md:pb-20">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glassmorphism text-primary-dark font-semibold text-sm mb-6"
            >
              <Award className="w-4 h-4 text-primary" />
              <span>#1 Paramedical Portal in the Region</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl leading-tight mb-6 text-foreground tracking-tight"
            >
              Experience <br/>Premium{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Healthcare.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed"
            >
              State-of-the-art paramedical services, expert consultations, and 24/7 emergency care tailored for your well-being.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <Link
                href="/booking"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-primary/30 hover:shadow-primary/50 shadow-xl hover:-translate-y-1"
              >
                Book Appointment
              </Link>
              <a
                href="tel:+916386192882"
                className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary/5 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:-translate-y-1"
              >
                <Phone className="w-5 h-5" />
                Emergency Call
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4 md:gap-8 items-center"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>Verified Professionals</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="w-5 h-5 text-success" />
                <span>ISO Certified</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Clock className="w-5 h-5 text-success" />
                <span>24/7 Support</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:ml-auto"
          >
            {/* Main Image with floating elements */}
            <div className="relative z-10 w-full max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-3xl transform rotate-3 scale-105 opacity-20 blur-2xl"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <HeroMedia
                  src="/hero-home.png"
                  alt="Modern Healthcare Facility"
                  className="w-full h-auto object-cover aspect-[4/5]"
                />
              </div>

              {/* Floating Badge 1 */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-6 lg:-left-12 top-1/4 glassmorphism p-4 rounded-2xl flex items-center gap-4 hidden sm:flex"
              >
                <div className="bg-success/20 p-3 rounded-full text-success">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">10k+</p>
                  <p className="text-xs text-muted-foreground font-semibold">Happy Patients</p>
                </div>
              </motion.div>

              {/* Floating Badge 2 */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-6 lg:-right-12 bottom-1/4 glassmorphism p-4 rounded-2xl flex items-center gap-4 hidden sm:flex"
              >
                <div className="bg-primary/20 p-3 rounded-full text-primary">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">Top 1%</p>
                  <p className="text-xs text-muted-foreground font-semibold">Care Providers</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default HeroSection;

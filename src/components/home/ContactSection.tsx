import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const ContactSection = () => {
  return (
    <section className="py-24 bg-slate-900 text-white relative flex flex-col items-center overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[100px] pointer-events-none transform -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-[100px] pointer-events-none transform translate-y-1/2 -translate-x-1/4"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              variant="outline"
              className="mb-6 rounded-full border-primary/30 bg-primary/10 px-5 py-1.5 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-sm inline-block"
            >
              Get In Touch
            </Badge>

            <h2 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight">
              We're Here For You 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary block mt-2">24/7.</span>
            </h2>
            <p className="text-slate-300 text-lg mb-10 leading-relaxed max-w-lg">
              Whether you need urgent emergency care or wish to schedule a routine consultation, our dedicated team is always ready to assist you.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:bg-primary transition-colors">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Our Location</h3>
                  <p className="text-slate-400">Kushaha Road, Singra Mau, <br/>Jaunpur, UP 222136</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Emergency Lines</h3>
                  <p className="text-slate-400 mb-1">+91 63861 92882</p>
                  <a href="tel:+916386192882" className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                    Call Now <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Working Hours</h3>
                  <p className="text-slate-400">24/7 Emergency Service Available</p>
                  <p className="text-slate-500 text-sm mt-1">Regular OPD: 9 AM - 7 PM</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full relative"
          >
            {/* Glassmorphism backing behind map */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] transform rotate-3 scale-105 border border-white/10 z-0"></div>
            
            <div className="bg-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 border-4 border-slate-700/50 aspect-square md:aspect-auto md:h-[600px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.8!2d82.7!3d25.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDQyJzAwLjAiTiA4MsKwNDInMDAuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full grayscale-[20%] contrast-125 opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              />
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white mb-1">Need Directions?</h4>
                    <p className="text-sm text-slate-400">Open in Google Maps for live traffic.</p>
                  </div>
                  <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors shadow-lg">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

import { motion } from "framer-motion";
import { useState } from "react";
import { Calendar, UserCircle, Stethoscope, ArrowRight, ShieldCheck } from "lucide-react";

const CTASection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    department: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <section className="py-24 relative overflow-hidden bg-slate-900">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-0 w-full h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none transform -translate-y-1/2"></div>
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-secondary/10 rounded-full blur-[100px] pointer-events-none transform -translate-y-1/2 translate-x-1/3"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm mb-6 backdrop-blur-md">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Book Your Visit Today</span>
            </div>

            <h2 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight">
              Take the first step towards <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">better health.</span>
            </h2>
            <p className="text-slate-300 text-lg mb-10 leading-relaxed max-w-lg">
              Schedule a consultation with our expert paramedical team. Experience priority routing, minimal wait times, and comprehensive personalized care.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <UserCircle className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white mb-1">Expert Specialists</h3>
                  <p className="text-slate-400">Consult with highly qualified MBBS and BAMS doctors with decades of experience.</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <ShieldCheck className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white mb-1">Secure & Confidential</h3>
                  <p className="text-slate-400">Your medical data and consultation records are handled with strict privacy protocols.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl transform rotate-3 scale-[1.03] blur-xl opacity-50 z-0"></div>
            
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 relative z-10 border border-slate-100">
              <div className="mb-8">
                <h3 className="font-heading font-extrabold text-3xl text-slate-900 mb-2">Request Appointment</h3>
                <p className="text-slate-500 font-medium">We will confirm your appointment via email/SMS.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium placeholder:font-normal"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium placeholder:font-normal"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Preferred Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium appearance-none"
                      required
                    >
                      <option value="" disabled>Select Service</option>
                      <option value="general">General Consultation</option>
                      <option value="ayurveda">Ayurveda</option>
                      <option value="eye">Eye Care</option>
                      <option value="physio">Physiotherapy</option>
                      <option value="lab">Lab Tests</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Your Message (Optional)</label>
                  <textarea
                    placeholder="Briefly describe your symptoms or reason for visit..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={3}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-slate-900 font-medium placeholder:font-normal"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-primary text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 mt-4"
                >
                  <Stethoscope className="w-5 h-5" />
                  Confirm Booking
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

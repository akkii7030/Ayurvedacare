/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Stethoscope, Clock, ShieldCheck, HeartPulse, Lock, CheckCircle2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import PageShell from "@/components/PageShell";
import { api, authStore } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nProvider";
import HeroMedia from "@/components/HeroMedia";

const Booking = () => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState<Date>();
  const [slots, setSlots] = useState<string[]>([]);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [teleConsent, setTeleConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const isoDate = useMemo(() => (date ? format(date, "yyyy-MM-dd") : ""), [date]);
  const selectedDoctor = useMemo(() => doctors.find((d) => d._id === doctorId), [doctors, doctorId]);

  useEffect(() => {
    api.getDoctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    if (!doctorId || !isoDate) return;
    api.getDoctorSlots(doctorId, isoDate).then((d) => setSlots(d.available)).catch(() => setSlots([]));
  }, [doctorId, isoDate]);

  const ensureAuth = async () => {
    const token = authStore.getToken();
    if (token) return token;
    const defaultPassword = "Telecare@123";
    try {
      const loginRes = await api.login({ phone, password: defaultPassword });
      authStore.setToken(loginRes.token);
      authStore.setUser(loginRes.user);
      return loginRes.token as string;
    } catch (_e) {
      const regRes = await api.register({ name, phone, email, password: defaultPassword, role: "patient" });
      authStore.setToken(regRes.token);
      authStore.setUser(regRes.user);
      return regRes.token as string;
    }
  };

  const openRazorpayCheckout = (order: any, patientToken: string) =>
    new Promise<void>((resolve, reject) => {
      const RazorpayConstructor = (window as any).Razorpay;
      if (!RazorpayConstructor) {
        reject(new Error("Razorpay SDK not loaded"));
        return;
      }

      const options = {
        key: order.razorpayKey,
        amount: order.amount,
        currency: "INR",
        name: "Sharavat Pali Clinic",
        description: `Consultation with ${order.doctorName}`,
        order_id: order.orderId,
        prefill: {
          name,
          contact: phone,
          email,
        },
        theme: { color: "#1E88E5" },
        handler: async (response: any) => {
          try {
            await api.verifyPayment(patientToken, {
              appointmentId: order.appointmentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
      };

      const rzp = new RazorpayConstructor(options);
      rzp.on("payment.failed", (response: any) => {
        reject(new Error(response?.error?.description || "Payment failed"));
      });
      rzp.open();
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !date || !time || !name.trim() || !phone.trim() || !email.trim()) {
      toast({ title: t("common.fillAllFields"), variant: "destructive" });
      return;
    }
    if (!teleConsent) {
      toast({ title: t("booking.consent"), variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const token = await ensureAuth();
      const order = await api.createAppointmentOrder(token, {
        doctorId,
        date: isoDate,
        time,
        telemedicineConsent: teleConsent,
        patientName: name,
        patientPhone: phone,
        patientEmail: email,
      });
      if (!order.razorpayKey) {
        throw new Error("Razorpay key missing on server");
      }
      await openRazorpayCheckout(order, token);

      toast({
        title: t("booking.confirm"),
        description: `Confirmed for ${isoDate} at ${time}. WhatsApp/email notifications queued.`,
      });
      setTime("");
    } catch (error: any) {
      toast({ title: t("booking.failed"), description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2000&auto=format&fit=crop" 
            alt="Booking Consultation" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none transform -translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm mb-6 backdrop-blur-md">
            <Clock className="w-4 h-4 text-primary" />
            <span>Fast & Secure Booking</span>
          </div>
          <h1 className="font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl text-white mb-6 tracking-tight">
            Book your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Consultation</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Choose your preferred specialist and time slot. We ensure a seamless experience from booking to treatment.
          </p>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-24 bg-slate-50 relative -mt-10 rounded-t-[3rem] z-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Features Sidebar */}
            <div className="lg:col-span-4 order-2 lg:order-1">
              <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-card border border-slate-100 flex flex-col gap-8 sticky top-32">
                <div>
                  <h3 className="font-heading font-extrabold text-2xl text-slate-900 mb-2">Why Choose Us?</h3>
                  <p className="text-slate-500">Premium care starting from your first interaction.</p>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Expert Specialists</h4>
                    <p className="text-sm text-slate-500 mt-1">Consult with highly qualified MBBS and BAMS doctors.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <HeartPulse className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Comprehensive Care</h4>
                    <p className="text-sm text-slate-500 mt-1">Holistic approach combining modern medicine and Ayurveda.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Secure Payments</h4>
                    <p className="text-sm text-slate-500 mt-1">Your data and transactions are 100% secure.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Main Area */}
            <div className="lg:col-span-8 order-1 lg:order-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-card border border-slate-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br from-primary/5 to-secondary/5 blur-[50px] -z-10 rounded-full mix-blend-multiply"></div>
                
                <div className="p-8 md:p-12">
                  <h3 className="font-heading font-extrabold text-3xl text-slate-900 mb-8 border-b border-slate-100 pb-6">Patient Details</h3>
                  
                  <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{t("booking.name")}</label>
                      <input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="John Doe"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium placeholder:font-normal" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{t("booking.phone")}</label>
                      <input 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="+91 98765 43210"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium placeholder:font-normal" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-10">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{t("booking.email")}</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="john@example.com"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium placeholder:font-normal" 
                    />
                  </div>

                  <h3 className="font-heading font-extrabold text-3xl text-slate-900 mt-12 mb-8 border-b border-slate-100 pb-6">Appointment Details</h3>
                  
                  <div className="space-y-8">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 block mb-3">{t("booking.selectDoctor")}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {doctors.map((d) => (
                          <button
                            key={d._id}
                            type="button"
                            onClick={() => setDoctorId(d._id)}
                            className={cn(
                              "text-left border-2 rounded-2xl p-5 transition-all text-slate-900 shadow-sm",
                              doctorId === d._id 
                                ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                                : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            <p className="font-bold text-lg leading-tight">{d.name}</p>
                            <p className="text-sm text-primary font-medium mt-1">{d.specialization}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 block mb-3">{t("booking.selectDate")}</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                "w-full px-5 py-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-medium text-left flex items-center justify-between transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-slate-300",
                                !date && "text-slate-400 font-normal"
                              )}
                            >
                              <span>{date ? format(date, "PPP") : t("booking.pickDate")}</span>
                              <CalendarIcon className="w-5 h-5 text-slate-400" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-2xl border-slate-100 shadow-xl" align="start">
                            <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} initialFocus className="p-4" />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 block mb-3">{t("booking.availableSlots")}</label>
                        <div className="grid grid-cols-3 gap-3">
                          {slots.length > 0 ? slots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setTime(slot)}
                              className={cn(
                                "px-3 py-3 rounded-xl border-2 text-sm font-bold transition-all shadow-sm",
                                time === slot 
                                  ? "bg-slate-900 text-white border-slate-900" 
                                  : "border-slate-100 bg-white text-slate-700 hover:border-primary hover:text-primary"
                              )}
                            >
                              {slot}
                            </button>
                          )) : (
                            <div className="col-span-3 text-sm text-slate-500 italic px-2">Select a date to view available time slots</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedDoctor && (
                    <div className="mt-10 rounded-2xl border-2 border-slate-100 bg-slate-50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Consultation Fee</p>
                        <p className="font-heading font-extrabold text-2xl text-slate-900">INR {selectedDoctor.fees || 500}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                        <Lock className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-bold text-slate-700">Secure Razorpay Checkout</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-10 pt-8 border-t border-slate-100 space-y-6">
                    <label className="flex gap-4 items-start cursor-pointer group">
                      <div className="relative flex items-start mt-1">
                        <input 
                          type="checkbox" 
                          className="peer sr-only" 
                          checked={teleConsent} 
                          onChange={(e) => setTeleConsent(e.target.checked)} 
                        />
                        <div className="w-6 h-6 rounded-md border-2 border-slate-300 bg-white peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                        {t("booking.consent")}
                      </span>
                    </label>

                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full bg-slate-900 hover:bg-primary text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 focus:ring-4 focus:ring-primary/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          {t("booking.processing")}
                        </>
                      ) : (
                        <>
                          <Stethoscope className="w-5 h-5" />
                          Proceed to Payment & Confirm
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Booking;

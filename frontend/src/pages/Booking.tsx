/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import PageShell from "@/components/PageShell";
import { api, authStore } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nProvider";

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
      <section className="bg-hero-gradient text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-3">{t("booking.title")}</h1>
          <p className="opacity-90">{t("booking.subtitle")}</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-lg">
          <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 shadow-card space-y-5">
            <div>
              <label className="text-sm font-medium block mb-1">{t("booking.name")}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">{t("booking.phone")}</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">{t("booking.email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">{t("booking.selectDoctor")}</label>
              <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm">
                <option value="">{t("booking.chooseDoctor")}</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} - {d.specialization}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">{t("booking.selectDate")}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm text-left flex items-center gap-2",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    {date ? format(date, "PPP") : t("booking.pickDate")}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">{t("booking.availableSlots")}</label>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={cn(
                      "px-2 py-2 rounded-lg border text-xs font-medium transition-colors",
                      time === slot ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-muted"
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex gap-2 items-start text-sm">
              <input type="checkbox" checked={teleConsent} onChange={(e) => setTeleConsent(e.target.checked)} />
              {t("booking.consent")}
            </label>
            <button type="submit" disabled={loading} className="w-full bg-hero-gradient text-primary-foreground py-3 rounded-lg font-heading font-semibold text-base disabled:opacity-70">
              {loading ? t("booking.processing") : t("booking.confirm")}
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
};

export default Booking;

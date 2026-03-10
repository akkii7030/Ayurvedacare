"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Phone, ArrowRight, HeartPulse, Building } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { api, authStore } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import PageShell from "@/components/PageShell";

const Login = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast({ title: t("common.fillAllFields"), variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const res = await api.login({ phone, password });
      authStore.setToken(res.token);
      authStore.setUser(res.user);
      
      toast({ title: "Welcome back!", description: `Logged in as ${res.user.name}` });
      
      // Redirect based on role
      if (["admin", "receptionist", "accountant"].includes(res.user.role)) {
        router.push("/dashboard/admin");
      } else if (res.user.role === "doctor") {
        router.push("/dashboard/doctor");
      } else {
        router.push("/dashboard/patient");
      }
    } catch (err: any) {
      toast({ title: t("auth.failed"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="min-h-screen relative flex items-center justify-center py-20 px-4 overflow-hidden bg-slate-900">
        {/* Abstract background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2000&auto=format&fit=crop" 
            alt="Medical background" 
            className="w-full h-full object-cover opacity-10 absolute inset-0"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-6 shadow-lg">
                <HeartPulse className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-heading font-extrabold text-white mb-2 tracking-tight">
                {t("auth.login")}
              </h1>
              <p className="text-slate-400 text-sm">
                Access your secure portal
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t("auth.phone")}</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                    <Phone className="w-5 h-5" />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9000000001"
                    className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t("auth.password")}</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold text-lg hover:bg-primary hover:text-white transition-all shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-white disabled:hover:text-slate-900"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                    {t("auth.signingIn")}
                  </>
                ) : (
                  <>
                    {t("auth.login")}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/10 text-center">
              <p className="text-xs text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                {t("auth.noAccount")}
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center gap-8 text-white/50">
             <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
               <Building className="w-4 h-4" />
               <span>Veritas Portal 2.0</span>
             </div>
          </div>
        </motion.div>
      </section>
    </PageShell>
  );
};

export default Login;

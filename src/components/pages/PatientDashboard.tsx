/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import { api, authStore } from "@/lib/api";
import { useI18n } from "@/i18n/I18nProvider";
import { LogOut } from "lucide-react";

const PatientDashboard = () => {
  const { t } = useI18n();
  const router = useRouter();
  const token = authStore.getToken();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const user = useMemo(() => authStore.getUser(), []);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    api.getMyAppointments(token).then(setAppointments).catch(() => setAppointments([]));
    api.getMyPrescriptions(token).then(setPrescriptions).catch(() => setPrescriptions([]));
  }, [token, router]);

  if (!token) return null;

  return (
    <PageShell>
      <section className="py-14 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading font-bold text-3xl">{t("dashboard.patient")}</h1>
            <p className="text-muted-foreground mt-2">Welcome {user?.name || "Patient"}</p>
          </div>
          <button 
            onClick={() => {
              authStore.clear();
              router.push("/login");
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-card rounded-xl p-5 shadow-card">
            <h2 className="font-semibold">Upcoming & Past Appointments</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {appointments.map((a) => (
                <li key={a._id}>{a.date} {a.time} | {a.doctorId?.name} | {a.status}</li>
              ))}
            </ul>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card">
            <h2 className="font-semibold">Prescriptions</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {prescriptions.map((p) => (
                <li key={p._id}>
                  {p.createdAt?.slice(0, 10)} | {p.doctorId?.name} {p.pdfUrl ? <a className="text-primary ml-2" href={p.pdfUrl}>PDF</a> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default PatientDashboard;

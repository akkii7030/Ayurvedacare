/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { api, authStore } from "@/lib/api";
import { useI18n } from "@/i18n/I18nProvider";

const DoctorDashboard = () => {
  const { t } = useI18n();
  const token = authStore.getToken();
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    api.getDoctorAppointments(token).then(setAppointments).catch(() => setAppointments([]));
  }, [token]);

  return (
    <PageShell>
      <section className="py-14 container mx-auto px-4">
        <h1 className="font-heading font-bold text-3xl">{t("dashboard.doctor")}</h1>
        <div className="bg-card rounded-xl p-5 shadow-card mt-8">
          <h2 className="font-semibold">Appointments</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {appointments.map((a) => (
              <li key={a._id}>{a.date} {a.time} | {a.userId?.name} | {a.status}</li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
};

export default DoctorDashboard;

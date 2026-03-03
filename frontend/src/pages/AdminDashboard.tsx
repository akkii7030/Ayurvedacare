/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import { api, authStore } from "@/lib/api";
import { useI18n } from "@/i18n/I18nProvider";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const sections = [
  { key: "dashboard", label: "Dashboard" },
  { key: "patients", label: "Users" },
  { key: "doctors", label: "Doctors" },
  { key: "appointments", label: "Appointments" },
  { key: "payments", label: "Accounts" },
  { key: "analytics", label: "Statistics" },
  { key: "prescriptions", label: "Prescriptions" },
  { key: "products", label: "Products" },
  { key: "content", label: "Content" },
  { key: "security", label: "Settings" },
] as const;

const DEFAULT_PERMISSION_MATRIX: Record<string, { view: boolean; edit: boolean; delete: boolean; refund: boolean }> = {
  admin: { view: true, edit: true, delete: true, refund: true },
  receptionist: { view: true, edit: true, delete: false, refund: false },
  accountant: { view: true, edit: false, delete: false, refund: false },
  doctor: { view: true, edit: true, delete: false, refund: false },
  patient: { view: false, edit: false, delete: false, refund: false },
};

const money = (value: number) => `INR ${Number(value || 0).toLocaleString("en-IN")}`;
const apiOrigin = String(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const resolveFileUrl = (url?: string) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${apiOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
};
const serviceLabel = (type?: string) => {
  const key = String(type || "").toLowerCase();
  if (key === "physical") return "Consultation";
  if (key === "emergency") return "Emergency";
  return "Telecare";
};
const statusColor = (status: string) => {
  const key = String(status || "").toLowerCase();
  if (key === "confirmed") return { backgroundColor: "#16a34a", borderColor: "#15803d" };
  if (key === "cancelled") return { backgroundColor: "#dc2626", borderColor: "#b91c1c" };
  if (key === "pending") return { backgroundColor: "#f59e0b", borderColor: "#d97706" };
  return { backgroundColor: "#3b82f6", borderColor: "#2563eb" };
};
const toDateTimeLocal = (date: string, time: string) => `${date}T${time}:00`;
const formatLocalDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const formatLocalTime = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

const AdminDashboard = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const token = authStore.getToken();
  const user = authStore.getUser();
  const currentRole = user?.role || "patient";
  const isAdmin = currentRole === "admin";
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]["key"]>("dashboard");
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState("all");
  const [permissionMatrix, setPermissionMatrix] = useState<Record<string, { view: boolean; edit: boolean; delete: boolean; refund: boolean }>>(DEFAULT_PERMISSION_MATRIX);

  const [dashboard, setDashboard] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorRevenue, setDoctorRevenue] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [security, setSecurity] = useState<any>(null);
  const [inventoryAlerts, setInventoryAlerts] = useState<any>({ totals: { medicines: 0, stockCount: 0 }, lowStock: [], expirySoon: [] });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [backupFiles, setBackupFiles] = useState<any[]>([]);
  const [backupConfig, setBackupConfig] = useState({ autoBackupEnabled: false, scheduleCron: "0 2 * * *", cloudProvider: "", cloudPath: "" });

  const [patientForm, setPatientForm] = useState({ name: "", phone: "", email: "", age: "", gender: "male", medicalHistory: "" });
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientDetail, setPatientDetail] = useState<any | null>(null);
  const [patientDetailLoading, setPatientDetailLoading] = useState(false);
  const [allergiesText, setAllergiesText] = useState("");
  const [chronicDiseasesText, setChronicDiseasesText] = useState("");
  const [reportForm, setReportForm] = useState({ label: "", url: "" });
  const [reportUploadFile, setReportUploadFile] = useState<File | null>(null);
  const [reportCommentDrafts, setReportCommentDrafts] = useState<Record<number, string>>({});
  const [purchaseForm, setPurchaseForm] = useState({ productId: "", quantity: "", costPerUnit: "", supplier: "", batchNo: "", expiryDate: "" });
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    specialization: "",
    fees: "",
    email: "",
    registrationNumber: "",
    specializationTags: "",
  });
  const [leaveForm, setLeaveForm] = useState({
    doctorId: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [productForm, setProductForm] = useState({ name: "", price: "", stock: "", category: "Ayurveda" });
  const [blogForm, setBlogForm] = useState({ title: "", slug: "", content: "", category: "Health Tips" });
  const [prescriptionForm, setPrescriptionForm] = useState({
    appointmentId: "",
    diagnosis: "",
    ayurvedicSuggestions: "",
    dietPlan: "",
    medicinesText: "",
    signedBy: "",
  });

  const recentPayments = useMemo(() => payments.slice(0, 2), [payments]);
  const txRows = useMemo(() => payments.slice(0, 8), [payments]);
  const visitTimeline = useMemo(
    () =>
      (patientDetail?.appointments || [])
        .slice()
        .sort((a: any, b: any) => new Date(`${b.date}T${b.time || "00:00"}`).getTime() - new Date(`${a.date}T${a.time || "00:00"}`).getTime()),
    [patientDetail]
  );
  const pastPrescriptions = useMemo(() => (patientDetail?.prescriptions || []).slice(0, 10), [patientDetail]);
  const filteredAppointments = useMemo(
    () =>
      selectedDoctorFilter === "all"
        ? appointments
        : appointments.filter((a) => String(a.doctorId?._id || "") === selectedDoctorFilter),
    [appointments, selectedDoctorFilter]
  );
  const calendarEvents = useMemo(
    () =>
      filteredAppointments.map((a) => {
        const start = new Date(toDateTimeLocal(a.date, a.time));
        const end = new Date(start.getTime() + 30 * 60 * 1000);
        const colors = statusColor(a.status);
        return {
          id: a._id,
          title: `${a.userId?.name || "Patient"} • ${a.doctorId?.name || "Doctor"}`,
          start,
          end,
          ...colors,
          extendedProps: { raw: a },
        };
      }),
    [filteredAppointments]
  );
  const rolePermissions = permissionMatrix[currentRole] || DEFAULT_PERMISSION_MATRIX[currentRole] || DEFAULT_PERMISSION_MATRIX.patient;
  const openTransactionDetails = (row: any) => {
    setSelectedTransaction(row);
    setDetailsOpen(true);
  };
  const hasPermission = (key: "view" | "edit" | "delete" | "refund") => Boolean(rolePermissions?.[key]);
  const updateMatrixCell = (role: string, key: "view" | "edit" | "delete" | "refund", value: boolean) => {
    setPermissionMatrix((prev) => ({
      ...prev,
      [role]: {
        ...(prev[role] || DEFAULT_PERMISSION_MATRIX[role] || DEFAULT_PERMISSION_MATRIX.patient),
        [key]: value,
      },
    }));
  };
  const handleCalendarDrop = async (dropInfo: any) => {
    const raw = dropInfo?.event?.extendedProps?.raw;
    const startDate = dropInfo?.event?.start;
    if (!raw || !startDate) return;
    if (!hasPermission("edit")) {
      dropInfo.revert();
      toast({ title: "Permission denied", description: "You cannot reschedule appointments.", variant: "destructive" });
      return;
    }
    try {
      const date = formatLocalDate(startDate);
      const time = formatLocalTime(startDate);
      await api.updateAdminAppointment(token, raw._id, { date, time });
      toast({
        title: "Appointment rescheduled",
        description: `${raw.userId?.name || "Patient"} moved to ${date} ${time}.`,
      });
      await loadAll();
    } catch (err: any) {
      dropInfo.revert();
      toast({ title: "Reschedule failed", description: err?.message || "Unable to update appointment", variant: "destructive" });
    }
  };

  const runAction = async (key: string, action: () => Promise<void>, okTitle: string, okDesc: string) => {
    try {
      setActionBusy(key);
      await action();
      toast({ title: okTitle, description: okDesc });
    } catch (err: any) {
      toast({ title: "Action failed", description: err?.message || "Request failed", variant: "destructive" });
    } finally {
      setActionBusy("");
    }
  };

  const loadPatientDetail = async (patientId: string) => {
    if (!token || !patientId) return;
    setPatientDetailLoading(true);
    try {
      const detail = await api.getAdminPatientDetail(token, patientId);
      setPatientDetail(detail);
      setAllergiesText((detail?.patient?.allergies || []).join(", "));
      setChronicDiseasesText((detail?.patient?.chronicDiseases || []).join(", "));
    } catch (err: any) {
      toast({ title: "Patient detail load failed", description: err?.message || "Unable to fetch patient detail", variant: "destructive" });
    } finally {
      setPatientDetailLoading(false);
    }
  };

  const loadAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [d, p, doc, docRev, a, pr, pay, prod, b, te, an, se, inv, logs, loginLogs, backups] = await Promise.all([
        api.getAdminDashboard(token),
        api.getAdminPatients(token),
        api.getAdminDoctors(token),
        api.getAdminDoctorRevenue(token),
        api.getAdminAppointments(token),
        api.getAdminPrescriptions(token),
        api.getAdminPayments(token),
        api.getAdminProducts(token),
        api.getAdminBlogs(token),
        api.getAdminTestimonials(token),
        api.getAdminAnalytics(token),
        api.getAdminSecurityStatus(token),
        api.getAdminInventoryAlerts(token),
        api.getAdminAuditLogs(token),
        api.getAdminLoginHistory(token),
        api.getAdminBackupList(token),
      ]);
      setDashboard(d);
      setPatients(p);
      setDoctors(doc);
      setDoctorRevenue(docRev);
      setAppointments(a);
      setPrescriptions(pr);
      setPayments(pay);
      setProducts(prod);
      setBlogs(b);
      setTestimonials(te);
      setAnalytics(an);
      setSecurity(se);
      setInventoryAlerts(inv || { totals: { medicines: 0, stockCount: 0 }, lowStock: [], expirySoon: [] });
      setAuditLogs(Array.isArray(logs) ? logs : []);
      setLoginHistory(Array.isArray(loginLogs) ? loginLogs : []);
      setBackupFiles(Array.isArray(backups?.files) ? backups.files : []);
      if (isAdmin) {
        const permissionRes = await api.getAdminPermissions(token);
        if (permissionRes?.matrix) setPermissionMatrix(permissionRes.matrix);
      }
    } catch (err: any) {
      toast({ title: "Dashboard sync failed", description: err?.message || "Unable to fetch data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!selectedPatientId) {
      setPatientDetail(null);
      return;
    }
    loadPatientDetail(selectedPatientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatientId, token]);

  if (!token) {
    return (
      <PageShell>
        <section className="py-14 container mx-auto px-4">
          <h1 className="font-heading font-bold text-3xl">{t("dashboard.admin")}</h1>
          <p className="text-muted-foreground mt-4">Login as admin to view the panel.</p>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="min-h-screen bg-[#f5f5f7]">
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:h-screen lg:flex-row">
          <aside className="w-full shrink-0 border-b border-gray-200 bg-white p-4 lg:w-[220px] lg:border-b-0 lg:border-r lg:p-5">
            <div className="mb-8 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 text-white font-bold">V</div>
              <p className="text-lg font-bold text-gray-900">Veritas</p>
            </div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Main Menu</p>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1 lg:space-y-1">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeSection === section.key ? "bg-gray-900 text-white shadow-md" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="text-base">{section.key === "dashboard" ? "■" : section.key === "patients" ? "👥" : section.key === "appointments" ? "📋" : section.key === "payments" ? "💳" : "📊"}</span>
                  {section.label}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-1 border-t border-gray-100 pt-3 lg:mt-auto">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Teams</p>
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600">
                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                Marketing
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                Development
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <button className="w-full rounded-lg px-3 py-1.5 text-left text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 flex items-center gap-2">
                <span>⚙️</span> Settings
              </button>
              <button className="w-full rounded-lg px-3 py-1.5 text-left text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 flex items-center gap-2">
                <span>🚪</span> Log Out
              </button>
            </div>
          </aside>

          <main className="flex-1 overflow-auto bg-[#f5f5f7] p-3 sm:p-4 lg:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="rounded-full bg-white border border-gray-200 p-0.5 shadow-sm">
                  <button className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">Full Statistics</button>
                  <button className="rounded-full px-3 py-1 text-xs font-medium text-gray-500">Results Summary</button>
                </div>
                <button onClick={loadAll} className="h-9 w-9 rounded-xl bg-white border border-gray-200 text-lg font-semibold shadow-sm hover:bg-gray-50 disabled:opacity-60" disabled={loading}>+</button>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 font-bold text-white shadow-sm text-sm">A</div>
              </div>
            </div>

            {activeSection === "dashboard" && (
              <>
                <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-900">Team<br/>Patients</p>
                      <span className="text-lg">👤</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex -space-x-2">
                        <div className="h-6 w-6 rounded-full bg-blue-400 border-2 border-white"></div>
                        <div className="h-6 w-6 rounded-full bg-orange-400 border-2 border-white"></div>
                        <div className="h-6 w-6 rounded-full bg-teal-400 border-2 border-white"></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">25+</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">📅 07 Dec approval</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">💰</span>
                      <p className="text-sm font-semibold text-gray-900">Savings</p>
                    </div>
                    <div className="h-12 mb-2">
                      <svg className="w-full h-full" viewBox="0 0 120 40" preserveAspectRatio="none">
                        <path d="M0,20 Q20,15 40,18 T80,12 T120,15" fill="none" stroke="#10b981" strokeWidth="2" />
                        <path d="M0,20 Q20,15 40,18 T80,12 T120,15 L120,40 L0,40 Z" fill="url(#gradient)" opacity="0.2" />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#10b98100" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{money(dashboard?.kpis?.totalRevenue || 0)}</p>
                    <p className="text-xs text-red-500 mt-1">↓ -11% last week</p>
                  </div>
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Income statistics</p>
                    <p className="text-xs text-green-600 font-medium mb-3">+8%</p>
                    <div className="flex items-end justify-between gap-2 h-20">
                      <div className="flex flex-col items-center gap-1 flex-1">
                        <div className="w-full bg-teal-200 rounded-t" style={{height: '40%'}}></div>
                        <span className="text-[10px] text-gray-500">15%</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 flex-1">
                        <div className="w-full bg-purple-200 rounded-t" style={{height: '60%'}}></div>
                        <span className="text-[10px] text-gray-500">21%</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 flex-1">
                        <div className="w-full bg-orange-400 rounded-t" style={{height: '85%'}}></div>
                        <span className="text-[10px] text-gray-500">34%</span>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-white shadow-sm">
                    <div className="bg-gradient-to-br from-teal-400 to-cyan-500 p-5 text-white relative">
                      <p className="text-2xl font-bold mb-1">{money(dashboard?.kpis?.totalRevenue || 0)}</p>
                      <p className="text-xs opacity-90 mb-4">Per Month</p>
                      <p className="text-base font-semibold leading-tight">Choose Best Plan<br/>For You!</p>
                      <div className="absolute top-3 right-3 text-xl">✨</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white">
                      <span className="text-xs text-gray-600">Details</span>
                      <button className="rounded-full bg-gray-900 px-4 py-1 text-xs font-medium text-white hover:bg-gray-800">Upgrade</button>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="mb-3 text-lg font-bold text-gray-900">Recently Payments</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {recentPayments.map((row) => (
                      <div key={row.appointmentId} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                          <div>
                            <p className="font-semibold text-gray-900">{row.patient?.name || "Unknown"}</p>
                            <p className="text-xs text-gray-500">{row.date || "-"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-gray-900">{money(row.amount)}</p>
                          <span className={`rounded-lg px-3 py-1 text-xs font-medium ${row.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
                            {row.paymentStatus === "paid" ? "Done" : "Pending"}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">⋯</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4 lg:p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-lg font-bold text-gray-900">Transactions</p>
                    <div className="relative">
                      <input className="rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" placeholder="Search" />
                      <span className="absolute left-3 top-2 text-gray-400 text-sm">🔍</span>
                    </div>
                  </div>
                  <div className="overflow-auto">
                    <table className="w-full min-w-[920px] text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-left text-gray-500">
                          <th className="pb-2 font-medium text-xs"><input type="checkbox" className="rounded" /></th>
                          <th className="pb-2 font-medium text-xs">Receiver</th>
                          <th className="pb-2 font-medium text-xs">Type</th>
                          <th className="pb-2 font-medium text-xs">Status</th>
                          <th className="pb-2 font-medium text-xs">Date</th>
                          <th className="pb-2 font-medium text-xs text-right">Amount</th>
                          <th className="pb-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {txRows.map((row) => (
                          <tr key={row.appointmentId} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3"><input type="checkbox" className="rounded" /></td>
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                                <span className="font-semibold text-gray-900">{row.patient?.name || "-"}</span>
                              </div>
                            </td>
                            <td className="py-3 text-gray-600">{serviceLabel(row.type)}</td>
                            <td className="py-3">
                              <span className={`rounded-lg px-3 py-1 text-xs font-medium ${row.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>{row.paymentStatus === "paid" ? "Done" : "Pending"}</span>
                            </td>
                            <td className="py-3 text-gray-600">{row.date || "-"}</td>
                            <td className="py-3 text-right font-semibold text-gray-900">{money(row.amount)}</td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openTransactionDetails(row)}
                                  className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium hover:bg-gray-50"
                                >
                                  Details
                                </button>
                                <button
                                  disabled={actionBusy === `invoice-${row.appointmentId}` || row.paymentStatus !== "paid"}
                                  onClick={() =>
                                    runAction(
                                      `invoice-${row.appointmentId}`,
                                      async () => {
                                        await api.generateAdminInvoice(token, row.appointmentId, {
                                          consultation: row?.billing?.consultation ?? row.amount,
                                          lab: row?.billing?.lab ?? 0,
                                          medicine: row?.billing?.medicine ?? 0,
                                          gstPercent: row?.invoice?.gstPercent ?? row?.billing?.gstPercent ?? 0,
                                        });
                                        await loadAll();
                                      },
                                      row?.invoice?.invoiceNumber ? "Invoice regenerated" : "Invoice generated",
                                      "Downloadable PDF invoice is ready."
                                    )
                                  }
                                  className="rounded-lg border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                                >
                                  {row?.invoice?.invoiceNumber ? "Regenerate Invoice" : "Generate Invoice"}
                                </button>
                                <a
                                  href={row?.invoice?.pdfUrl ? resolveFileUrl(row.invoice.pdfUrl) : "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                                    row?.invoice?.pdfUrl ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "pointer-events-none border-gray-200 text-gray-400"
                                  }`}
                                >
                                  Download PDF
                                </a>
                                <button
                                  disabled={!hasPermission("refund") || actionBusy === `refund-${row.appointmentId}` || row.paymentStatus === "refunded"}
                                  onClick={() =>
                                    hasPermission("refund")
                                      ? runAction(
                                          `refund-${row.appointmentId}`,
                                          async () => {
                                            await api.refundAdminAppointment(token, row.appointmentId, { cancelAppointment: false, notes: "Refund processed by admin" });
                                            await loadAll();
                                          },
                                          "Refund processed",
                                          "Payment status updated to refunded."
                                        )
                                      : toast({ title: "Permission denied", description: "Refund access is restricted for your role.", variant: "destructive" })
                                  }
                                  className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                                >
                                  Refund
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeSection !== "dashboard" && (
              <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4 lg:p-5">
                {activeSection === "patients" && (
                  <div className="space-y-4">
                    <p className="text-xl font-bold">Patient Management</p>
                    <div className="grid gap-3 md:grid-cols-4">
                      <input className="rounded-lg border px-3 py-2" placeholder="Name" value={patientForm.name} onChange={(e) => setPatientForm((s) => ({ ...s, name: e.target.value }))} />
                      <input className="rounded-lg border px-3 py-2" placeholder="Phone" value={patientForm.phone} onChange={(e) => setPatientForm((s) => ({ ...s, phone: e.target.value }))} />
                      <input className="rounded-lg border px-3 py-2" placeholder="Medical History" value={patientForm.medicalHistory} onChange={(e) => setPatientForm((s) => ({ ...s, medicalHistory: e.target.value }))} />
                      <button
                        disabled={actionBusy === "create-patient"}
                        onClick={() =>
                          hasPermission("edit")
                            ? runAction(
                                "create-patient",
                                async () => {
                                  await api.createAdminPatient(token, { ...patientForm, age: patientForm.age ? Number(patientForm.age) : undefined });
                                  setPatientForm({ name: "", phone: "", email: "", age: "", gender: "male", medicalHistory: "" });
                                  await loadAll();
                                },
                                "Patient created",
                                "New profile has been added."
                              )
                            : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                        }
                        className="rounded-lg bg-black px-3 py-2 text-white disabled:opacity-60"
                      >
                        Add Patient
                      </button>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
                      <div className="rounded-lg border">
                        <div className="border-b px-3 py-2 text-sm font-semibold">Patient Directory</div>
                        <div className="max-h-[540px] space-y-1 overflow-auto p-2">
                          {patients.slice(0, 200).map((p) => (
                            <button
                              key={p._id}
                              onClick={() => setSelectedPatientId(p._id)}
                              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                                selectedPatientId === p._id ? "border-slate-900 bg-slate-900 text-white" : "border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <p className="font-semibold">{p.name}</p>
                              <p className={`text-xs ${selectedPatientId === p._id ? "text-slate-200" : "text-gray-500"}`}>{p.phone}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {!selectedPatientId && <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500">Select a patient to view medical timeline and records.</div>}
                        {selectedPatientId && patientDetailLoading && <div className="rounded-lg border p-6 text-sm text-gray-500">Loading patient detail...</div>}

                        {selectedPatientId && patientDetail?.patient && (
                          <>
                            <div className="rounded-lg border p-4">
                              <div className="mb-3 flex items-center justify-between">
                                <div>
                                  <p className="text-lg font-bold">{patientDetail.patient.name}</p>
                                  <p className="text-xs text-gray-500">{patientDetail.patient.phone} | {patientDetail.patient.gender || "-"} | Age {patientDetail.patient.age || "-"}</p>
                                </div>
                                <button
                                  className="rounded border px-3 py-1 text-xs"
                                  onClick={() => loadPatientDetail(selectedPatientId)}
                                >
                                  Refresh
                                </button>
                              </div>
                              <label className="mb-1 block text-xs font-semibold text-gray-600">Medical History</label>
                              <textarea
                                className="min-h-[88px] w-full rounded-lg border px-3 py-2 text-sm"
                                value={patientDetail.patient.medicalHistory || ""}
                                onChange={(e) =>
                                  setPatientDetail((prev: any) =>
                                    prev ? { ...prev, patient: { ...prev.patient, medicalHistory: e.target.value } } : prev
                                  )
                                }
                              />
                              <div className="mt-2">
                                <button
                                  className="rounded bg-black px-3 py-1.5 text-xs text-white"
                                  onClick={() =>
                                    hasPermission("edit")
                                      ? runAction(
                                          `save-history-${selectedPatientId}`,
                                          async () => {
                                            await api.updateAdminPatient(token, selectedPatientId, { medicalHistory: patientDetail.patient.medicalHistory || "" });
                                            await loadPatientDetail(selectedPatientId);
                                            await loadAll();
                                          },
                                          "Medical history saved",
                                          "Patient profile updated."
                                        )
                                      : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                                  }
                                >
                                  Save Medical History
                                </button>
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="rounded-lg border p-4">
                                <p className="mb-2 font-semibold">Allergy Tracking</p>
                                <input
                                  className="w-full rounded-lg border px-3 py-2 text-sm"
                                  placeholder="e.g. Penicillin, Dust"
                                  value={allergiesText}
                                  onChange={(e) => setAllergiesText(e.target.value)}
                                />
                              </div>
                              <div className="rounded-lg border p-4">
                                <p className="mb-2 font-semibold">Chronic Disease Tags</p>
                                <input
                                  className="w-full rounded-lg border px-3 py-2 text-sm"
                                  placeholder="e.g. Diabetes, Hypertension"
                                  value={chronicDiseasesText}
                                  onChange={(e) => setChronicDiseasesText(e.target.value)}
                                />
                              </div>
                            </div>
                            <div>
                              <button
                                className="rounded bg-slate-900 px-3 py-1.5 text-xs text-white"
                                onClick={() =>
                                  hasPermission("edit")
                                    ? runAction(
                                        `save-tags-${selectedPatientId}`,
                                        async () => {
                                          await api.updateAdminPatient(token, selectedPatientId, {
                                            allergies: allergiesText,
                                            chronicDiseases: chronicDiseasesText,
                                          });
                                          await loadPatientDetail(selectedPatientId);
                                          await loadAll();
                                        },
                                        "Risk profile updated",
                                        "Allergy and chronic disease tags saved."
                                      )
                                    : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                                }
                              >
                                Save Risk Tags
                              </button>
                            </div>

                            <div className="rounded-lg border p-4">
                              <p className="mb-3 font-semibold">Lab Reports Upload</p>
                              <div className="grid gap-2 md:grid-cols-[1fr,1fr,auto]">
                                <input
                                  className="rounded-lg border px-3 py-2 text-sm"
                                  placeholder="Report label"
                                  value={reportForm.label}
                                  onChange={(e) => setReportForm((s) => ({ ...s, label: e.target.value }))}
                                />
                                <input
                                  className="rounded-lg border px-3 py-2 text-sm"
                                  placeholder="Report URL"
                                  value={reportForm.url}
                                  onChange={(e) => setReportForm((s) => ({ ...s, url: e.target.value }))}
                                />
                                <button
                                  className="rounded bg-black px-3 py-2 text-xs text-white"
                                  onClick={() =>
                                    hasPermission("edit")
                                      ? runAction(
                                          `add-report-${selectedPatientId}`,
                                          async () => {
                                            if (!reportForm.url.trim()) throw new Error("Report URL is required");
                                            const existingReports = Array.isArray(patientDetail.patient.reports) ? patientDetail.patient.reports : [];
                                            await api.updateAdminPatient(token, selectedPatientId, {
                                              reports: [
                                                ...existingReports,
                                                {
                                                  label: reportForm.label.trim() || `Report ${existingReports.length + 1}`,
                                                  url: reportForm.url.trim(),
                                                  uploadedAt: new Date().toISOString(),
                                                },
                                              ],
                                            });
                                            setReportForm({ label: "", url: "" });
                                            await loadPatientDetail(selectedPatientId);
                                            await loadAll();
                                          },
                                          "Report added",
                                          "Lab report linked to patient profile."
                                        )
                                      : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                                  }
                                >
                                  Add Report
                                </button>
                              </div>
                              <div className="mt-2 grid gap-2 md:grid-cols-[1fr,auto]">
                                <input
                                  type="file"
                                  accept="application/pdf"
                                  className="rounded-lg border px-3 py-2 text-sm"
                                  onChange={(e) => setReportUploadFile(e.target.files?.[0] || null)}
                                />
                                <button
                                  className="rounded bg-slate-900 px-3 py-2 text-xs text-white"
                                  onClick={() =>
                                    hasPermission("edit")
                                      ? runAction(
                                          `upload-report-${selectedPatientId}`,
                                          async () => {
                                            if (!reportUploadFile) throw new Error("Select a PDF file");
                                            await api.uploadAdminPatientReport(token, selectedPatientId, reportUploadFile, {
                                              label: reportForm.label.trim(),
                                              doctorComment: "",
                                            });
                                            setReportUploadFile(null);
                                            await loadPatientDetail(selectedPatientId);
                                            await loadAll();
                                          },
                                          "PDF uploaded",
                                          "Lab report file attached to patient."
                                        )
                                      : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                                  }
                                >
                                  Upload PDF
                                </button>
                              </div>
                              <div className="mt-3 space-y-2 text-sm">
                                {(patientDetail.patient.reports || []).length === 0 && <p className="text-xs text-gray-500">No lab reports added yet.</p>}
                                {(patientDetail.patient.reports || []).map((r: any, idx: number) => (
                                  <div key={`${r.url}-${idx}`} className="rounded border px-3 py-2">
                                    <div>
                                      <p className="font-medium">{r.label || "Lab Report"}</p>
                                      <p className="text-xs text-gray-500">{r.uploadedAt ? new Date(r.uploadedAt).toLocaleString() : "-"}</p>
                                    </div>
                                    <div className="mt-2 grid gap-2 md:grid-cols-[1fr,auto,auto,auto]">
                                      <input
                                        className="rounded border px-2 py-1 text-xs"
                                        placeholder="Doctor comment"
                                        value={reportCommentDrafts[idx] ?? r.doctorComment ?? ""}
                                        onChange={(e) => setReportCommentDrafts((prev) => ({ ...prev, [idx]: e.target.value }))}
                                      />
                                      <button
                                        className="rounded border px-2 py-1 text-xs"
                                        onClick={() =>
                                          hasPermission("edit")
                                            ? runAction(
                                                `comment-report-${selectedPatientId}-${idx}`,
                                                async () => {
                                                  const comment = String(reportCommentDrafts[idx] ?? r.doctorComment ?? "");
                                                  await api.commentAdminPatientReport(token, selectedPatientId, idx, comment);
                                                  await loadPatientDetail(selectedPatientId);
                                                  await loadAll();
                                                },
                                                "Comment saved",
                                                "Doctor comment added to lab report."
                                              )
                                            : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                                        }
                                      >
                                        Save Comment
                                      </button>
                                      <button
                                        className="rounded border px-2 py-1 text-xs"
                                        onClick={() =>
                                          hasPermission("edit")
                                            ? runAction(
                                                `email-report-${selectedPatientId}-${idx}`,
                                                async () => {
                                                  await api.emailAdminPatientReport(token, selectedPatientId, idx);
                                                  await loadPatientDetail(selectedPatientId);
                                                  await loadAll();
                                                },
                                                "Report emailed",
                                                "Lab report sent to patient email."
                                              )
                                            : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                                        }
                                      >
                                        Email Patient
                                      </button>
                                      <a className="rounded border px-2 py-1 text-xs text-blue-700" href={resolveFileUrl(r.url)} target="_blank" rel="noreferrer">Open PDF</a>
                                    </div>
                                    {r.doctorComment ? <p className="mt-1 text-xs text-gray-600">Comment: {r.doctorComment}</p> : null}
                                    {r.emailedAt ? <p className="mt-1 text-xs text-emerald-700">Emailed: {new Date(r.emailedAt).toLocaleString()}</p> : null}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                              <div className="rounded-lg border p-4">
                                <p className="mb-3 font-semibold">Visit Timeline</p>
                                <div className="space-y-2 text-sm">
                                  {visitTimeline.length === 0 && <p className="text-xs text-gray-500">No visits found.</p>}
                                  {visitTimeline.slice(0, 20).map((visit: any) => (
                                    <div key={visit._id} className="rounded border border-gray-200 px-3 py-2">
                                      <p className="font-medium">{visit.date} {visit.time} - {visit.doctorId?.name || "Doctor"}</p>
                                      <p className="text-xs text-gray-500">Status: {visit.status} | Payment: {visit.paymentStatus} | {money(visit.amount || 0)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="rounded-lg border p-4">
                                <p className="mb-3 font-semibold">Past Prescriptions</p>
                                <div className="space-y-2 text-sm">
                                  {pastPrescriptions.length === 0 && <p className="text-xs text-gray-500">No prescriptions found.</p>}
                                  {pastPrescriptions.map((rx: any) => (
                                    <div key={rx._id} className="rounded border border-gray-200 px-3 py-2">
                                      <p className="font-medium">{rx.diagnosis || "General consultation"}</p>
                                      <p className="text-xs text-gray-500">Doctor: {rx.doctorId?.name || "-"} | {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : "-"}</p>
                                      {rx.pdfUrl ? <a className="text-xs text-blue-700 underline" href={resolveFileUrl(rx.pdfUrl)} target="_blank" rel="noreferrer">Download PDF</a> : null}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "doctors" && (
                  <div className="space-y-4">
                    <p className="text-xl font-bold">Doctor Management</p>
                    <div className="grid gap-3 md:grid-cols-3">
                      <input className="rounded-lg border px-3 py-2" placeholder="Doctor Name" value={doctorForm.name} onChange={(e) => setDoctorForm((s) => ({ ...s, name: e.target.value }))} />
                      <input className="rounded-lg border px-3 py-2" placeholder="Specialization" value={doctorForm.specialization} onChange={(e) => setDoctorForm((s) => ({ ...s, specialization: e.target.value }))} />
                      <input className="rounded-lg border px-3 py-2" placeholder="Fees" value={doctorForm.fees} onChange={(e) => setDoctorForm((s) => ({ ...s, fees: e.target.value }))} />
                      <input className="rounded-lg border px-3 py-2" placeholder="Email" value={doctorForm.email} onChange={(e) => setDoctorForm((s) => ({ ...s, email: e.target.value }))} />
                      <input className="rounded-lg border px-3 py-2" placeholder="Registration Number" value={doctorForm.registrationNumber} onChange={(e) => setDoctorForm((s) => ({ ...s, registrationNumber: e.target.value }))} />
                      <input className="rounded-lg border px-3 py-2" placeholder="Specialization Tags (comma separated)" value={doctorForm.specializationTags} onChange={(e) => setDoctorForm((s) => ({ ...s, specializationTags: e.target.value }))} />
                    </div>
                    <button
                      className="rounded-lg bg-black px-3 py-2 text-white"
                      onClick={() =>
                        hasPermission("edit")
                          ? runAction(
                              "create-doctor",
                              async () => {
                                await api.createAdminDoctor(token, {
                                  ...doctorForm,
                                  fees: Number(doctorForm.fees || 0),
                                  specializationTags: doctorForm.specializationTags,
                                });
                                setDoctorForm({ name: "", specialization: "", fees: "", email: "", registrationNumber: "", specializationTags: "" });
                                await loadAll();
                              },
                              "Doctor created",
                              "Doctor profile and specialization data saved."
                            )
                          : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                      }
                    >
                      Add Doctor
                    </button>

                    <div className="rounded-lg border p-3">
                      <p className="mb-2 font-semibold">Doctor-wise Revenue Tracking</p>
                      <div className="space-y-2 text-sm">
                        {doctorRevenue.map((r) => (
                          <div key={r.doctorId} className="flex items-center justify-between rounded border px-3 py-2">
                            <div>
                              <p className="font-semibold">{r.doctorName}</p>
                              <p className="text-xs text-gray-500">{r.specialization || "-"}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{money(r.revenue)}</p>
                              <p className="text-xs text-gray-500">{r.appointments} paid appointments</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border p-3">
                      <p className="mb-2 font-semibold">Leave Management</p>
                      <div className="grid gap-3 md:grid-cols-4">
                        <select className="rounded-lg border px-3 py-2" value={leaveForm.doctorId} onChange={(e) => setLeaveForm((s) => ({ ...s, doctorId: e.target.value }))}>
                          <option value="">Select Doctor</option>
                          {doctors.map((d) => (
                            <option key={d._id} value={d._id}>{d.name}</option>
                          ))}
                        </select>
                        <input type="date" className="rounded-lg border px-3 py-2" value={leaveForm.fromDate} onChange={(e) => setLeaveForm((s) => ({ ...s, fromDate: e.target.value }))} />
                        <input type="date" className="rounded-lg border px-3 py-2" value={leaveForm.toDate} onChange={(e) => setLeaveForm((s) => ({ ...s, toDate: e.target.value }))} />
                        <input className="rounded-lg border px-3 py-2" placeholder="Reason" value={leaveForm.reason} onChange={(e) => setLeaveForm((s) => ({ ...s, reason: e.target.value }))} />
                      </div>
                      <button
                        className="mt-3 rounded-lg bg-black px-3 py-2 text-white"
                        onClick={() =>
                          hasPermission("edit")
                            ? runAction(
                                "add-doctor-leave",
                                async () => {
                                  if (!leaveForm.doctorId) throw new Error("Select doctor first");
                                  await api.addAdminDoctorLeave(token, leaveForm.doctorId, {
                                    fromDate: leaveForm.fromDate,
                                    toDate: leaveForm.toDate,
                                    reason: leaveForm.reason,
                                    status: "approved",
                                  });
                                  setLeaveForm({ doctorId: "", fromDate: "", toDate: "", reason: "" });
                                  await loadAll();
                                },
                                "Leave updated",
                                "Doctor leave schedule saved."
                              )
                            : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                        }
                      >
                        Save Leave
                      </button>

                      <div className="mt-3 space-y-2 text-sm">
                        {doctors.slice(0, 8).map((d) => (
                          <div key={d._id} className="rounded border px-3 py-2">
                            <p className="font-semibold">{d.name} - {d.specialization}</p>
                            <p className="text-xs text-gray-500">Tags: {(d.specializationTags || []).join(", ") || "-"}</p>
                            <p className="text-xs text-gray-500">Fee: {money(d.fees || 0)} | Active: {d.isActive ? "Yes" : "No"}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <button
                                className="rounded border px-2 py-0.5 text-xs"
                                onClick={() =>
                                  hasPermission("edit")
                                    ? runAction(
                                        `doctor-edit-${d._id}`,
                                        async () => {
                                          await api.updateAdminDoctor(token, d._id, {
                                            fees: Number(d.fees || 0) + 100,
                                          });
                                          await loadAll();
                                        },
                                        "Doctor updated",
                                        "Doctor profile has been updated."
                                      )
                                    : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                                }
                              >
                                +100 Fee
                              </button>
                              <button
                                className="rounded border border-rose-200 px-2 py-0.5 text-xs text-rose-700"
                                onClick={() =>
                                  hasPermission("delete")
                                    ? runAction(
                                        `doctor-delete-${d._id}`,
                                        async () => {
                                          await api.deactivateAdminDoctor(token, d._id);
                                          await loadAll();
                                        },
                                        "Doctor deactivated",
                                        "Doctor is now inactive."
                                      )
                                    : toast({ title: "Permission denied", description: "Delete access is restricted for your role.", variant: "destructive" })
                                }
                              >
                                Deactivate
                              </button>
                            </div>
                            <div className="mt-1 space-y-1">
                              {(d.leaves || []).slice(0, 3).map((l: any) => (
                                <div key={l._id} className="flex items-center justify-between rounded bg-gray-50 px-2 py-1">
                                  <span>{l.fromDate} to {l.toDate} ({l.status})</span>
                                  <button
                                    className="rounded border px-2 py-0.5 text-xs"
                                    onClick={() =>
                                      hasPermission("edit")
                                        ? runAction(
                                            `leave-${d._id}-${l._id}`,
                                            async () => {
                                              await api.updateAdminDoctorLeave(token, d._id, l._id, { status: l.status === "approved" ? "rejected" : "approved" });
                                              await loadAll();
                                            },
                                            "Leave status updated",
                                            "Doctor leave approval state changed."
                                          )
                                        : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                                    }
                                  >
                                    Toggle Status
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "appointments" && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xl font-bold">Appointment Calendar</p>
                      <div className="flex items-center gap-2">
                        <select
                          className="rounded-lg border px-3 py-2 text-sm"
                          value={selectedDoctorFilter}
                          onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                        >
                          <option value="all">All Doctors</option>
                          {doctors.map((d) => (
                            <option key={d._id} value={d._id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-green-600"></span>Confirmed</span>
                      <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-600"></span>Cancelled</span>
                      <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>Pending</span>
                    </div>

                    <div className="rounded-xl border bg-white p-2">
                      <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                          left: "prev,next today",
                          center: "title",
                          right: "dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        editable={hasPermission("edit")}
                        eventDrop={handleCalendarDrop}
                        events={calendarEvents}
                        height="auto"
                        eventClick={(clickInfo) => {
                          const raw = clickInfo.event.extendedProps?.raw;
                          if (!raw) return;
                          const action = raw.status === "cancelled" ? "confirmed" : "cancelled";
                          runAction(
                            `toggle-status-${raw._id}`,
                            async () => {
                              await api.updateAdminAppointment(token, raw._id, { status: action });
                              await loadAll();
                            },
                            action === "confirmed" ? "Appointment confirmed" : "Appointment cancelled",
                            `${raw.userId?.name || "Patient"} appointment marked ${action}.`
                          );
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      {filteredAppointments.slice(0, 8).map((a) => (
                        <div key={a._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                          <p className="font-semibold">{a.userId?.name || "-"} • {a.doctorId?.name || "-"} • {a.date} {a.time}</p>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs ${a.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : a.status === "cancelled" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                              {a.status}
                            </span>
                            <button className="rounded border px-2 py-1 text-xs" onClick={() => openTransactionDetails({ ...a, appointmentId: a._id, paymentId: a.paymentId || "" })}>Details</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "payments" && (
                  <div className="space-y-3">
                    <p className="text-xl font-bold">Billing & Invoice Center</p>
                    <p className="text-sm text-[#5f6172]">Auto invoice, GST support, PDF download and service-wise billing breakdown.</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {payments.slice(0, 12).map((row) => (
                        <div key={row.appointmentId} className="rounded-lg border p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="font-semibold">{row.patient?.name || "Patient"}</p>
                            <span className={`rounded-full px-2 py-0.5 text-xs ${row.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {row.paymentStatus}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <p>{row.date} {row.time} - {serviceLabel(row.type)}</p>
                            <p>Consultation: {money(row?.billing?.consultation || 0)} | Lab: {money(row?.billing?.lab || 0)} | Medicine: {money(row?.billing?.medicine || 0)}</p>
                            <p>GST: {Number(row?.invoice?.gstPercent ?? row?.billing?.gstPercent ?? 0).toFixed(2)}% ({money(row?.invoice?.gstAmount ?? row?.billing?.gstAmount ?? 0)})</p>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              disabled={actionBusy === `invoice-${row.appointmentId}` || row.paymentStatus !== "paid"}
                              onClick={() =>
                                runAction(
                                  `invoice-${row.appointmentId}`,
                                  async () => {
                                    await api.generateAdminInvoice(token, row.appointmentId, {
                                      consultation: row?.billing?.consultation ?? row.amount,
                                      lab: row?.billing?.lab ?? 0,
                                      medicine: row?.billing?.medicine ?? 0,
                                      gstPercent: row?.invoice?.gstPercent ?? row?.billing?.gstPercent ?? 0,
                                    });
                                    await loadAll();
                                  },
                                  row?.invoice?.invoiceNumber ? "Invoice regenerated" : "Invoice generated",
                                  "Billing PDF is ready."
                                )
                              }
                              className="rounded border border-blue-200 px-2 py-1 text-xs text-blue-700 disabled:opacity-50"
                            >
                              {row?.invoice?.invoiceNumber ? "Regenerate" : "Generate"}
                            </button>
                            <a
                              href={row?.invoice?.pdfUrl ? resolveFileUrl(row.invoice.pdfUrl) : "#"}
                              target="_blank"
                              rel="noreferrer"
                              className={`rounded border px-2 py-1 text-xs ${row?.invoice?.pdfUrl ? "border-emerald-200 text-emerald-700" : "pointer-events-none border-gray-200 text-gray-400"}`}
                            >
                              Download PDF
                            </a>
                            <button className="rounded border px-2 py-1 text-xs" onClick={() => openTransactionDetails(row)}>Details</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "analytics" && (
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-gray-500">Conversion Rate</p>
                        <p className="text-2xl font-bold">{analytics?.conversionRate || 0}%</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-gray-500">No-show %</p>
                        <p className="text-2xl font-bold">{analytics?.noShowPercentage || 0}%</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-gray-500">Refund Ratio</p>
                        <p className="text-2xl font-bold">{analytics?.refundRatio || 0}%</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-gray-500">Repeat Patients</p>
                        <p className="text-2xl font-bold">{analytics?.repeatPatientsPercent || 0}%</p>
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="rounded-lg border p-3">
                        <p className="mb-2 font-semibold">Monthly Revenue Chart</p>
                        <div className="space-y-2 text-xs">
                          {(analytics?.monthlyRevenue || []).slice(-12).map((row: any) => (
                            <div key={row.month} className="flex items-center gap-2">
                              <span className="w-16 text-gray-500">{row.month}</span>
                              <div className="h-2 flex-1 rounded bg-slate-100">
                                <div className="h-2 rounded bg-slate-900" style={{ width: `${Math.min(100, Number(row.revenue || 0) / Math.max(1, Number(analytics?.monthlyRevenue?.[analytics?.monthlyRevenue?.length - 1]?.revenue || 1)) * 100)}%` }}></div>
                              </div>
                              <span>{money(row.revenue || 0)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="mb-2 font-semibold">Top Diseases (Pie Data)</p>
                        <div className="space-y-2 text-sm">
                          {(analytics?.topDiseases || analytics?.mostCommonDisease || []).map((x: any) => (
                            <div key={x.name} className="flex items-center justify-between rounded border px-2 py-1">
                              <span>{x.name}</span>
                              <span>{x.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="rounded-lg border p-3">
                        <p className="mb-2 font-semibold">Doctor Performance</p>
                        <div className="space-y-2 text-sm">
                          {(analytics?.doctorPerformance || []).map((d: any) => (
                            <div key={d.doctorId} className="rounded border px-2 py-1">
                              <p className="font-medium">{d.doctorName}</p>
                              <p className="text-xs text-gray-500">Appointments: {d.appointments} | Revenue: {money(d.revenue)} | Conversion: {d.conversionRate}%</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="mb-2 font-semibold">Peak Booking Hours</p>
                        <div className="space-y-2 text-sm">
                          {(analytics?.peakBookingHours || []).map((slot: any) => (
                            <div key={slot.hour} className="flex items-center justify-between rounded border px-2 py-1">
                              <span>{slot.hour}</span>
                              <span>{slot.count} bookings</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "prescriptions" && (
                  <div className="space-y-3">
                    <p className="text-xl font-bold">Digital Prescriptions</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input className="rounded-lg border px-3 py-2" placeholder="Appointment ID" value={prescriptionForm.appointmentId} onChange={(e) => setPrescriptionForm((s) => ({ ...s, appointmentId: e.target.value }))} />
                      <button
                        className="rounded-lg bg-black px-3 py-2 text-white"
                        onClick={() =>
                          runAction(
                            "create-rx",
                            async () => {
                              const medicines = prescriptionForm.medicinesText
                                .split("\n")
                                .map((line) => line.trim())
                                .filter(Boolean)
                                .map((line) => ({ name: line, dosage: "As advised", duration: "", notes: "" }));
                              await api.createPrescription(token, { ...prescriptionForm, medicines });
                              await loadAll();
                            },
                            "Prescription created",
                            "PDF is ready for patient download."
                          )
                        }
                      >
                        Save Prescription
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      {prescriptions.slice(0, 10).map((p) => (
                        <div key={p._id} className="rounded-lg border px-3 py-2">
                          {p.userId?.name} - {p.diagnosis || "No diagnosis"}{" "}
                          {p.pdfUrl ? <a className="text-blue-700 underline" href={resolveFileUrl(p.pdfUrl)} target="_blank" rel="noreferrer">PDF</a> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "products" && (
                  <div className="space-y-3">
                    <p className="text-xl font-bold">Product Management</p>
                    <div className="grid gap-3 md:grid-cols-4">
                      <input className="rounded-lg border px-3 py-2" placeholder="Name" value={productForm.name} onChange={(e) => setProductForm((s) => ({ ...s, name: e.target.value }))} />
                      <input className="rounded-lg border px-3 py-2" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm((s) => ({ ...s, price: e.target.value }))} />
                      <input className="rounded-lg border px-3 py-2" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm((s) => ({ ...s, stock: e.target.value }))} />
                      <button className="rounded-lg bg-black px-3 py-2 text-white" onClick={() => hasPermission("edit") ? runAction("create-product", async () => { await api.createAdminProduct(token, { ...productForm, price: Number(productForm.price || 0), stock: Number(productForm.stock || 0), active: true }); await loadAll(); }, "Product added", "Catalog has been updated.") : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })}>Add</button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-gray-500">Medicine Stock Count</p>
                        <p className="text-2xl font-bold">{inventoryAlerts?.totals?.stockCount || 0}</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-gray-500">Low Stock Alerts</p>
                        <p className="text-2xl font-bold">{(inventoryAlerts?.lowStock || []).length}</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-gray-500">Expiry Alerts (30d)</p>
                        <p className="text-2xl font-bold">{(inventoryAlerts?.expirySoon || []).length}</p>
                      </div>
                    </div>

                    <div className="rounded-lg border p-3">
                      <p className="mb-2 font-semibold">Purchase Entry</p>
                      <div className="grid gap-2 md:grid-cols-6">
                        <select className="rounded border px-2 py-1 text-sm" value={purchaseForm.productId} onChange={(e) => setPurchaseForm((s) => ({ ...s, productId: e.target.value }))}>
                          <option value="">Select medicine</option>
                          {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                        <input className="rounded border px-2 py-1 text-sm" placeholder="Qty" value={purchaseForm.quantity} onChange={(e) => setPurchaseForm((s) => ({ ...s, quantity: e.target.value }))} />
                        <input className="rounded border px-2 py-1 text-sm" placeholder="Cost/unit" value={purchaseForm.costPerUnit} onChange={(e) => setPurchaseForm((s) => ({ ...s, costPerUnit: e.target.value }))} />
                        <input className="rounded border px-2 py-1 text-sm" placeholder="Supplier" value={purchaseForm.supplier} onChange={(e) => setPurchaseForm((s) => ({ ...s, supplier: e.target.value }))} />
                        <input className="rounded border px-2 py-1 text-sm" placeholder="Batch no" value={purchaseForm.batchNo} onChange={(e) => setPurchaseForm((s) => ({ ...s, batchNo: e.target.value }))} />
                        <input type="date" className="rounded border px-2 py-1 text-sm" value={purchaseForm.expiryDate} onChange={(e) => setPurchaseForm((s) => ({ ...s, expiryDate: e.target.value }))} />
                      </div>
                      <button
                        className="mt-2 rounded bg-slate-900 px-3 py-1 text-xs text-white"
                        onClick={() =>
                          hasPermission("edit")
                            ? runAction(
                                "purchase-entry",
                                async () => {
                                  if (!purchaseForm.productId) throw new Error("Select medicine first");
                                  await api.createAdminProductPurchaseEntry(token, purchaseForm.productId, {
                                    quantity: Number(purchaseForm.quantity || 0),
                                    costPerUnit: Number(purchaseForm.costPerUnit || 0),
                                    supplier: purchaseForm.supplier,
                                    batchNo: purchaseForm.batchNo,
                                    expiryDate: purchaseForm.expiryDate,
                                  });
                                  setPurchaseForm({ productId: "", quantity: "", costPerUnit: "", supplier: "", batchNo: "", expiryDate: "" });
                                  await loadAll();
                                },
                                "Purchase recorded",
                                "Stock count and purchase ledger updated."
                              )
                            : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                        }
                      >
                        Save Purchase Entry
                      </button>
                    </div>

                    {products.slice(0, 10).map((p) => (
                      <div key={p._id} className="rounded-lg border px-3 py-2 text-sm">
                        {p.name} - {money(p.price)} (Stock: {p.stock}, Reorder: {p.reorderLevel || 10}, Expiry: {p.expiryDate || "-"})
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "content" && (
                  <div className="space-y-3">
                    <p className="text-xl font-bold">Content Studio</p>
                    <div className="grid gap-3 md:grid-cols-3">
                      <input className="rounded-lg border px-3 py-2" placeholder="Title" value={blogForm.title} onChange={(e) => setBlogForm((s) => ({ ...s, title: e.target.value }))} />
                      <input className="rounded-lg border px-3 py-2" placeholder="Slug" value={blogForm.slug} onChange={(e) => setBlogForm((s) => ({ ...s, slug: e.target.value }))} />
                      <button className="rounded-lg bg-black px-3 py-2 text-white" onClick={() => hasPermission("edit") ? runAction("create-blog", async () => { await api.createAdminBlog(token, { ...blogForm, excerpt: blogForm.content.slice(0, 120), published: true }); await loadAll(); }, "Blog published", "Your content is now live.") : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })}>Publish</button>
                    </div>
                    <div className="space-y-2 text-sm">
                      {blogs.slice(0, 8).map((b) => <div key={b._id} className="rounded-lg border px-3 py-2">{b.title}</div>)}
                      {testimonials.slice(0, 6).map((x) => (
                        <div key={x._id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                          <span>{x.name} ({x.rating}/5)</span>
                          <button className="rounded bg-slate-800 px-2 py-1 text-xs text-white" onClick={() => runAction(`approve-${x._id}`, async () => { await api.approveAdminTestimonial(token, x._id, !x.approved); await loadAll(); }, "Testimonial updated", "Moderation state changed.")}>{x.approved ? "Approved" : "Approve"}</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "security" && (
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border p-3">OTP: {security?.otpEnabled ? "Enabled" : "Pending"}</div>
                      <div className="rounded-lg border p-3">Backup: {security?.backupConfigured ? "Configured" : "Pending"}</div>
                      <div className="rounded-lg border p-3">SSL: {security?.sslEnabled ? "Enabled" : "Pending"}</div>
                      <div className="rounded-lg border p-3">RBAC: {security?.roleBasedAccess ? "Enabled" : "Pending"}</div>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-semibold">Backup & Restore</p>
                        <button
                          className="rounded bg-black px-3 py-1 text-xs text-white"
                          onClick={() =>
                            runAction(
                              "manual-backup",
                              async () => {
                                await api.createAdminManualBackup(token);
                                await loadAll();
                              },
                              "Backup created",
                              "Manual JSON backup is ready to download."
                            )
                          }
                        >
                          Manual DB Backup
                        </button>
                      </div>
                      <div className="grid gap-2 md:grid-cols-4">
                        <select
                          className="rounded border px-2 py-1 text-sm"
                          value={backupConfig.autoBackupEnabled ? "enabled" : "disabled"}
                          onChange={(e) => setBackupConfig((s) => ({ ...s, autoBackupEnabled: e.target.value === "enabled" }))}
                        >
                          <option value="enabled">Auto Backup Enabled</option>
                          <option value="disabled">Auto Backup Disabled</option>
                        </select>
                        <input className="rounded border px-2 py-1 text-sm" placeholder="CRON (e.g. 0 2 * * *)" value={backupConfig.scheduleCron} onChange={(e) => setBackupConfig((s) => ({ ...s, scheduleCron: e.target.value }))} />
                        <input className="rounded border px-2 py-1 text-sm" placeholder="Cloud provider" value={backupConfig.cloudProvider} onChange={(e) => setBackupConfig((s) => ({ ...s, cloudProvider: e.target.value }))} />
                        <input className="rounded border px-2 py-1 text-sm" placeholder="Cloud path / bucket" value={backupConfig.cloudPath} onChange={(e) => setBackupConfig((s) => ({ ...s, cloudPath: e.target.value }))} />
                      </div>
                      <button
                        className="mt-2 rounded border px-3 py-1 text-xs"
                        onClick={() =>
                          runAction(
                            "backup-config",
                            async () => {
                              await api.updateAdminBackupConfig(token, backupConfig);
                            },
                            "Backup config saved",
                            "Auto schedule and cloud backup options updated."
                          )
                        }
                      >
                        Save Backup Config
                      </button>
                      <div className="mt-3 space-y-1 text-xs">
                        {backupFiles.slice(0, 10).map((f) => (
                          <div key={f.fileName} className="flex items-center justify-between rounded border px-2 py-1">
                            <span>{f.fileName}</span>
                            <a href={resolveFileUrl(f.downloadUrl)} target="_blank" rel="noreferrer" className="text-blue-700 underline">Download JSON</a>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="rounded-lg border p-3">
                        <p className="mb-2 font-semibold">Audit Logs</p>
                        <div className="max-h-56 space-y-1 overflow-auto text-xs">
                          {auditLogs.slice(0, 100).map((log) => (
                            <div key={log._id} className="rounded border px-2 py-1">
                              <p className="font-semibold">{log.action}</p>
                              <p className="text-gray-500">{new Date(log.createdAt).toLocaleString()} | {log.payload?.ip || "-"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="mb-2 font-semibold">Login History & IP Tracking</p>
                        <div className="max-h-56 space-y-1 overflow-auto text-xs">
                          {loginHistory.slice(0, 100).map((log) => (
                            <div key={log._id} className="rounded border px-2 py-1">
                              <p className="font-semibold">{log.actorId ? "User Login" : "Unknown Login"}</p>
                              <p className="text-gray-500">{new Date(log.createdAt).toLocaleString()} | IP: {log.payload?.ip || "-"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="rounded-lg border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-semibold">Permission Matrix (Admin Managed)</p>
                          <button
                            className="rounded bg-black px-3 py-1 text-xs text-white disabled:opacity-60"
                            disabled={actionBusy === "save-permissions"}
                            onClick={() =>
                              runAction(
                                "save-permissions",
                                async () => {
                                  await api.updateAdminPermissions(token, { matrix: permissionMatrix });
                                  await loadAll();
                                },
                                "Permissions updated",
                                "Role access matrix has been saved."
                              )
                            }
                          >
                            Save Matrix
                          </button>
                        </div>
                        <div className="overflow-auto">
                          <table className="w-full min-w-[560px] text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="py-2 text-left">Role</th>
                                <th className="py-2 text-left">View</th>
                                <th className="py-2 text-left">Edit</th>
                                <th className="py-2 text-left">Delete</th>
                                <th className="py-2 text-left">Refund</th>
                              </tr>
                            </thead>
                            <tbody>
                              {["admin", "doctor", "receptionist", "accountant"].map((role) => (
                                <tr key={role} className="border-b">
                                  <td className="py-2 capitalize">{role}</td>
                                  {(["view", "edit", "delete", "refund"] as const).map((perm) => (
                                    <td key={perm} className="py-2">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(permissionMatrix?.[role]?.[perm])}
                                        onChange={(e) => updateMatrixCell(role, perm, e.target.checked)}
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Only Admin can view and manage this matrix.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>Complete payment and appointment context for this entry.</DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="font-semibold text-gray-500">Patient</div>
                <div>{selectedTransaction.patient?.name || "-"}</div>
                <div className="font-semibold text-gray-500">Phone</div>
                <div>{selectedTransaction.patient?.phone || "-"}</div>
                <div className="font-semibold text-gray-500">Doctor</div>
                <div>{selectedTransaction.doctor?.name || "-"}</div>
                <div className="font-semibold text-gray-500">Date</div>
                <div>{selectedTransaction.date || "-"}</div>
                <div className="font-semibold text-gray-500">Time</div>
                <div>{selectedTransaction.time || "-"}</div>
                <div className="font-semibold text-gray-500">Amount</div>
                <div>{money(selectedTransaction.amount)}</div>
                <div className="font-semibold text-gray-500">Payment Status</div>
                <div>{selectedTransaction.paymentStatus || "-"}</div>
                <div className="font-semibold text-gray-500">Invoice Number</div>
                <div>{selectedTransaction.invoice?.invoiceNumber || "-"}</div>
                <div className="font-semibold text-gray-500">Consultation</div>
                <div>{money(selectedTransaction.billing?.consultation || 0)}</div>
                <div className="font-semibold text-gray-500">Lab</div>
                <div>{money(selectedTransaction.billing?.lab || 0)}</div>
                <div className="font-semibold text-gray-500">Medicine</div>
                <div>{money(selectedTransaction.billing?.medicine || 0)}</div>
                <div className="font-semibold text-gray-500">GST</div>
                <div>{Number(selectedTransaction.invoice?.gstPercent ?? selectedTransaction.billing?.gstPercent ?? 0).toFixed(2)}%</div>
                <div className="font-semibold text-gray-500">GST Amount</div>
                <div>{money(selectedTransaction.invoice?.gstAmount ?? selectedTransaction.billing?.gstAmount ?? 0)}</div>
                <div className="font-semibold text-gray-500">Grand Total</div>
                <div>{money(selectedTransaction.invoice?.total ?? selectedTransaction.billing?.total ?? selectedTransaction.amount)}</div>
                <div className="font-semibold text-gray-500">Appointment Status</div>
                <div>{selectedTransaction.status || "-"}</div>
                <div className="font-semibold text-gray-500">Payment ID</div>
                <div className="break-all">{selectedTransaction.paymentId || "-"}</div>
                <div className="font-semibold text-gray-500">Appointment ID</div>
                <div className="break-all">{selectedTransaction.appointmentId || "-"}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </section>
    </PageShell>
  );
};

export default AdminDashboard;

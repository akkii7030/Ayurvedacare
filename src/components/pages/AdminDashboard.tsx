"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import { api, authStore } from "@/lib/api";
import { useI18n } from "@/i18n/I18nProvider";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { HeartPulse } from "lucide-react";
import {
  Lock,
  LayoutDashboard,
  Users,
  UserRound,
  ClipboardList,
  CreditCard,
  BarChart3,
  FileText,
  Package,
  Newspaper,
  Settings,
  LogOut,
  Plus,
  Search,
  Bell,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Calendar as CalendarIcon,
  RefreshCw,
  MoreHorizontal,
  Download,
  Mail,
  ExternalLink,
  History,
  ShieldCheck,
  Database,
  Stethoscope,
  IndianRupee,
  Fingerprint,
  Hash,
  PlusCircle,
  ShoppingCart,
  Zap,
  PenTool,
  Send,
  MessageSquare,
  ShieldAlert,
  Timer,
  Cloud,
  Package2,
  ListFilter,
  UserPlus,
  ShieldOff,
  CalendarDays,
  Calendar,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const sections = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "patients", label: "Patients", icon: Users },
  { key: "doctors", label: "Doctors", icon: UserRound },
  { key: "appointments", label: "Appointments", icon: ClipboardList },
  { key: "payments", label: "Financials", icon: CreditCard },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "prescriptions", label: "Prescriptions", icon: FileText },
  { key: "products", label: "Inventory", icon: Package },
  { key: "content", label: "Content", icon: Newspaper },
  { key: "security", label: "System", icon: Settings },
] as const;

const ADMIN_PANEL_ROLES = new Set(["admin", "receptionist", "accountant"]);

const DEFAULT_PERMISSION_MATRIX: Record<string, { view: boolean; edit: boolean; delete: boolean; refund: boolean }> = {
  admin: { view: true, edit: true, delete: true, refund: true },
  receptionist: { view: true, edit: true, delete: false, refund: false },
  accountant: { view: true, edit: false, delete: false, refund: false },
  doctor: { view: true, edit: true, delete: false, refund: false },
  patient: { view: false, edit: false, delete: false, refund: false },
};

const money = (value: number) => `INR ${Number(value || 0).toLocaleString("en-IN")}`;
const apiOrigin = "";
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
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const currentRole = user?.role || "patient";
  const isAdmin = currentRole === "admin";
  const canAccessAdminPanel = ADMIN_PANEL_ROLES.has(currentRole);
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
    if (!token || !canAccessAdminPanel) return;
    setLoading(true);
    try {
      const baseRequests = await Promise.allSettled([
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
      ]);
      const getValue = <T,>(index: number, fallback: T): T =>
        baseRequests[index]?.status === "fulfilled" ? (baseRequests[index].value as T) : fallback;

      setDashboard(getValue(0, null));
      setPatients(getValue(1, []));
      setDoctors(getValue(2, []));
      setDoctorRevenue(getValue(3, []));
      setAppointments(getValue(4, []));
      setPrescriptions(getValue(5, []));
      setPayments(getValue(6, []));
      setProducts(getValue(7, []));
      setBlogs(getValue(8, []));
      setTestimonials(getValue(9, []));
      setAnalytics(getValue(10, null));
      setSecurity(getValue(11, null));
      setInventoryAlerts(getValue(12, { totals: { medicines: 0, stockCount: 0 }, lowStock: [], expirySoon: [] }));
      setAuditLogs(getValue(13, []));

      if (isAdmin) {
        const adminRequests = await Promise.allSettled([
          api.getAdminLoginHistory(token),
          api.getAdminBackupList(token),
          api.getAdminPermissions(token),
        ]);
        const loginLogs = adminRequests[0]?.status === "fulfilled" ? adminRequests[0].value : [];
        const backups = adminRequests[1]?.status === "fulfilled" ? adminRequests[1].value : null;
        const permissionRes = adminRequests[2]?.status === "fulfilled" ? adminRequests[2].value : null;
        setLoginHistory(Array.isArray(loginLogs) ? loginLogs : []);
        setBackupFiles(Array.isArray(backups?.files) ? backups.files : []);
        if (permissionRes?.matrix) setPermissionMatrix(permissionRes.matrix);
      } else {
        setLoginHistory([]);
        setBackupFiles([]);
      }
    } catch (err: any) {
      toast({ title: "Dashboard sync failed", description: err?.message || "Unable to fetch data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setToken(authStore.getToken());
    setUser(authStore.getUser());
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!canAccessAdminPanel) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, token, canAccessAdminPanel]);

  useEffect(() => {
    if (!authReady) return;
    if (!selectedPatientId) {
      setPatientDetail(null);
      return;
    }
    loadPatientDetail(selectedPatientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, selectedPatientId, token]);

  if (!authReady) {
    return (
      <PageShell showNavbar={false} showFooter={false} showMobileBar={false}>
        <section className="py-14 container mx-auto px-4">
          <h1 className="font-heading font-bold text-3xl">{t("dashboard.admin")}</h1>
          <p className="text-muted-foreground mt-4">Loading admin panel...</p>
        </section>
      </PageShell>
    );
  }

  if (!token || !canAccessAdminPanel) {
    return (
      <PageShell showNavbar={false} showFooter={false} showMobileBar={false}>
        <section className="min-h-screen relative flex items-center justify-center py-20 px-4 overflow-hidden bg-slate-900 text-center">
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[120px]"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 max-w-lg w-full bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-[2.5rem] shadow-2xl"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-heading font-extrabold text-4xl text-white mb-4 tracking-tight">Access Restricted</h1>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              {!token
                ? "This panel requires administrative authentication to proceed."
                : "Your account does not have the necessary permissions to access this clinical dashboard."}
            </p>

            <div className="flex flex-col gap-4">
              {!token && (
                <button
                  onClick={() => router.push("/login")}
                  className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold text-lg hover:bg-primary hover:text-white transition-all shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                >
                  <Lock className="w-5 h-5" />
                  Continue to Secure Login
                </button>
              )}

              <button
                onClick={() => router.push("/")}
                className="w-full bg-white/5 text-white py-4 rounded-2xl font-bold text-lg hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-3"
              >
                Return to Homepage
              </button>
            </div>
          </motion.div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell showNavbar={false} showFooter={false} showMobileBar={false}>
      <section className="min-h-screen bg-[#f5f5f7]">
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:h-screen lg:flex-row">
          <aside className="w-full shrink-0 border-b border-slate-200 bg-white p-4 lg:w-[260px] lg:border-b-0 lg:border-r lg:p-6 lg:h-screen flex flex-col">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white font-bold shadow-lg shadow-primary/20">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">Veritas</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Clinical OS 2.0</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-3">Administration</p>
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.key;
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={cn(
                      "w-full group rounded-xl px-4 py-3 text-left text-sm font-bold transition-all duration-300 flex items-center gap-3",
                      isActive
                        ? "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                      isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-900"
                    )} />
                    {section.label}
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 space-y-4 pt-6 border-t border-slate-100">
              <div className="px-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">System Logs</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                    Live Telecare
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                    Inventory AI
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    authStore.clear();
                    router.push("/login");
                    toast({ title: "Logged out", description: "You have been securely logged out." });
                  }}
                  className="w-full group rounded-xl px-4 py-3 text-left text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all duration-300 flex items-center gap-3"
                >
                  <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  Logout Securely
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 mt-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-900">Encrypted Session</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Your activity is being audited for clinical compliance.</p>
              </div>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-10 custom-scrollbar">
            <header className="mb-10 flex flex-wrap items-center justify-between gap-6">
              <div>
                <motion.h1
                  key={activeSection}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight"
                >
                  {sections.find(s => s.key === activeSection)?.label || "Overview"}
                </motion.h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {activeSection === "dashboard" ? "Real-time Clinical Insights" : `Management / ${activeSection}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="relative group hidden md:block">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    className="h-11 w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                    placeholder="Search anything..."
                  />
                </div>

                <button
                  onClick={loadAll}
                  disabled={loading}
                  className="h-11 w-11 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-primary disabled:opacity-50 transition-all active:scale-95 group"
                >
                  <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                </button>

                <div className="h-11 px-4 flex items-center gap-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-md">
                    {user?.name?.[0] || "A"}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || "Administrator"}</p>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-tighter mt-1">{user?.role || "Admin"}</p>
                  </div>
                </div>
              </div>
            </header>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === "dashboard" && (
                  <>
                    <div className="mb-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                      {/* Total Patients Card */}
                      <div className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                          <Users className="w-24 h-24 text-slate-900" />
                        </div>
                        <div className="relative z-10">
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <Users className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Patients</p>
                          <h3 className="text-3xl font-heading font-extrabold text-slate-900">{patients.length}+</h3>
                          <div className="mt-4 flex items-center gap-2">
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              +12%
                            </Badge>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">vs last month</span>
                          </div>
                        </div>
                      </div>

                      {/* Revenue Card */}
                      <div className="group relative overflow-hidden rounded-[2rem] bg-slate-900 p-6 shadow-xl shadow-slate-200 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                          <DollarSign className="w-24 h-24 text-white" />
                        </div>
                        <div className="relative z-10">
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-primary backdrop-blur-md">
                            <DollarSign className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                          <h3 className="text-3xl font-heading font-extrabold text-white">{money(dashboard?.kpis?.totalRevenue || 0)}</h3>
                          <div className="mt-4 flex items-center gap-2">
                            <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/10">
                              <Activity className="w-3 h-3 mr-1" />
                              Live Tracking
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Appointments Card */}
                      <div className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                          <ClipboardList className="w-24 h-24 text-slate-900" />
                        </div>
                        <div className="relative z-10">
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                            <ClipboardList className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Appointments</p>
                          <h3 className="text-3xl font-heading font-extrabold text-slate-900">{appointments.length}</h3>
                          <div className="mt-4 flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                                </div>
                              ))}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">8 scheduled today</span>
                          </div>
                        </div>
                      </div>

                      {/* Inventory Card */}
                      <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-secondary p-6 shadow-xl shadow-primary/20 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                          <Package className="w-24 h-24 text-white" />
                        </div>
                        <div className="relative z-10 text-white">
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md">
                            <Package className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Inventory Alert</p>
                          <h3 className="text-3xl font-heading font-extrabold">{(inventoryAlerts?.lowStock || []).length} Low</h3>
                          <div className="mt-4 flex items-center gap-2">
                            <button className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors">
                              Refill Stock
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 mb-10">
                      <div className="lg:col-span-2 space-y-8">
                        {/* Transactions Table Section */}
                        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-100">
                          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <h2 className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">Financial Ledger</h2>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Transaction History</p>
                            </div>
                            <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                              <Download className="w-4 h-4" />
                              Export CSV
                            </button>
                          </div>

                          <div className="overflow-x-auto -mx-2">
                            <table className="w-full min-w-[800px] border-separate border-spacing-y-2">
                              <thead>
                                <tr className="text-left">
                                  <th className="px-4 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Patient</th>
                                  <th className="px-4 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Type</th>
                                  <th className="px-4 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</th>
                                  <th className="px-4 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Date</th>
                                  <th className="px-4 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Amount</th>
                                  <th className="px-4 pb-4" />
                                </tr>
                              </thead>
                              <tbody>
                                {txRows.map((row) => (
                                  <tr key={row.appointmentId} className="group">
                                    <td className="bg-slate-50/50 group-hover:bg-slate-50 rounded-l-2xl px-4 py-4 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-slate-400 border border-slate-100">
                                          {row.patient?.name?.[0] || "?"}
                                        </div>
                                        <div>
                                          <p className="font-bold text-slate-900">{row.patient?.name || "-"}</p>
                                          <p className="text-[10px] font-medium text-slate-400">#{row.appointmentId.slice(-6)}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="bg-slate-50/50 group-hover:bg-slate-50 px-4 py-4 transition-colors">
                                      <Badge variant="outline" className="border-slate-200 bg-white text-slate-500 font-bold uppercase tracking-tighter text-[10px]">
                                        {serviceLabel(row.type)}
                                      </Badge>
                                    </td>
                                    <td className="bg-slate-50/50 group-hover:bg-slate-50 px-4 py-4 transition-colors">
                                      <span className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                        row.paymentStatus === "paid"
                                          ? "bg-emerald-50 text-emerald-600"
                                          : "bg-amber-50 text-amber-600"
                                      )}>
                                        <span className={cn("h-1.5 w-1.5 rounded-full", row.paymentStatus === "paid" ? "bg-emerald-500" : "bg-amber-500")} />
                                        {row.paymentStatus === "paid" ? "Confirmed" : "Pending"}
                                      </span>
                                    </td>
                                    <td className="bg-slate-50/50 group-hover:bg-slate-50 px-4 py-4 transition-colors text-xs font-bold text-slate-500">
                                      {row.date || "-"}
                                    </td>
                                    <td className="bg-slate-50/50 group-hover:bg-slate-50 px-4 py-4 transition-colors text-right">
                                      <p className="font-heading font-extrabold text-slate-900">{money(row.amount)}</p>
                                    </td>
                                    <td className="bg-slate-50/50 group-hover:bg-slate-50 rounded-r-2xl px-4 py-4 transition-colors text-right">
                                      <button
                                        onClick={() => openTransactionDetails(row)}
                                        className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-primary transition-all active:scale-95"
                                      >
                                        <ChevronRight className="w-5 h-5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      <aside className="space-y-8">
                        {/* Insights Card */}
                        <div className="rounded-[2.5rem] bg-indigo-600 p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                          <div className="relative z-10">
                            <TrendingUp className="w-8 h-8 text-indigo-200 mb-4" />
                            <h3 className="text-2xl font-heading font-extrabold mb-2">Growth Metric</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed mb-6">Patient intake has increased by 15% this weekend compared to last.</p>
                            <button className="w-full bg-white text-indigo-700 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/20 hover:bg-slate-50 active:scale-95 transition-all">
                              View Analysis
                            </button>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-100">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Clinic Status</h3>
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                  <Activity className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold text-slate-900">Health Index</span>
                              </div>
                              <span className="text-sm font-extrabold text-slate-900">92%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                  <CalendarIcon className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold text-slate-900">Capacity</span>
                              </div>
                              <span className="text-sm font-extrabold text-slate-900">65%</span>
                            </div>
                          </div>
                        </div>
                      </aside>
                    </div>
                  </>
                )}

                {activeSection !== "dashboard" && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4 lg:p-5">
                    {activeSection === "patients" && (
                      <div className="space-y-8">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                          <div>
                            <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Patient Registry</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage and Audit Clinical Records</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                              <Users className="w-4 h-4" />
                              Export Registry
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-4">
                          <div className="md:col-span-3 grid gap-4 md:grid-cols-3">
                            <div className="relative group">
                              <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                              <input
                                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                                placeholder="Patient Full Name"
                                value={patientForm.name}
                                onChange={(e) => setPatientForm((s) => ({ ...s, name: e.target.value }))}
                              />
                            </div>
                            <div className="relative group">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                              <input
                                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                                placeholder="Phone Number"
                                value={patientForm.phone}
                                onChange={(e) => setPatientForm((s) => ({ ...s, phone: e.target.value }))}
                              />
                            </div>
                            <div className="relative group">
                              <History className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                              <input
                                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                                placeholder="Key Medical History"
                                value={patientForm.medicalHistory}
                                onChange={(e) => setPatientForm((s) => ({ ...s, medicalHistory: e.target.value }))}
                              />
                            </div>
                          </div>
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
                                  "Patient Registered",
                                  "New clinical profile has been activated."
                                )
                                : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                            }
                            className="h-12 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <Plus className="w-5 h-5" />
                            Quick Onboarding
                          </button>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-[360px,1fr]">
                          <div className="rounded-[2.5rem] bg-white p-6 shadow-sm border border-slate-100 flex flex-col h-[700px]">
                            <div className="mb-6 flex items-center justify-between px-2">
                              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Members</h3>
                              <Badge variant="outline" className="text-[10px] font-bold">{patients.length}</Badge>
                            </div>

                            <div className="relative group mb-6 px-2">
                              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-primary" />
                              <input
                                className="h-10 w-full rounded-xl bg-slate-50 border-none pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Search directory..."
                              />
                            </div>

                            <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                              {patients.slice(0, 200).map((p) => (
                                <button
                                  key={p._id}
                                  onClick={() => setSelectedPatientId(p._id)}
                                  className={cn(
                                    "relative w-full rounded-2xl px-4 py-4 text-left transition-all group overflow-hidden",
                                    selectedPatientId === p._id
                                      ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                                      : "bg-white hover:bg-slate-50 border border-slate-50"
                                  )}
                                >
                                  <div className="relative z-10 flex items-center gap-4">
                                    <div className={cn(
                                      "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors",
                                      selectedPatientId === p._id ? "bg-white/10 text-white" : "bg-slate-100 text-slate-400"
                                    )}>
                                      {p.name?.[0] || "?"}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold leading-none">{p.name || "Untitled Profile"}</p>
                                      <p className={cn(
                                        "text-[10px] font-bold uppercase tracking-tighter mt-1.5",
                                        selectedPatientId === p._id ? "text-slate-400" : "text-slate-400"
                                      )}>{p.phone || "No Connection"}</p>
                                    </div>
                                    {selectedPatientId === p._id && (
                                      <motion.div layoutId="patient-active" className="ml-auto">
                                        <ChevronRight className="w-4 h-4 text-primary" />
                                      </motion.div>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-8">
                            {!selectedPatientId && (
                              <div className="h-[700px] flex flex-col items-center justify-center rounded-[2.5rem] bg-white border border-dashed border-slate-200 p-12 text-center group">
                                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                  <Users className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-heading font-extrabold text-slate-900 mb-2">Patient Intelligence</h3>
                                <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                                  Select a profile from the directory to access medical history, visit timelines, and laboratory insights.
                                </p>
                              </div>
                            )}

                            {selectedPatientId && patientDetailLoading && (
                              <div className="h-[700px] flex items-center justify-center rounded-[2.5rem] bg-white border border-slate-100">
                                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                              </div>
                            )}

                            {selectedPatientId && patientDetail?.patient && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-10"
                              >
                                <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                                    <UserRound className="w-48 h-48" />
                                  </div>
                                  <div className="relative z-10">
                                    <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
                                      <div className="flex items-center gap-6">
                                        <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-indigo-100">
                                          {patientDetail.patient.name?.[0]}
                                        </div>
                                        <div>
                                          <h3 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">{patientDetail.patient.name}</h3>
                                          <div className="flex items-center gap-3 mt-2">
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 font-bold">{patientDetail.patient.gender || "Active"}</Badge>
                                            <span className="text-slate-300">•</span>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{patientDetail.patient.phone} | AGE {patientDetail.patient.age || "-"}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        className="h-11 px-6 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                                        onClick={() => loadPatientDetail(selectedPatientId)}
                                      >
                                        <RefreshCw className="w-4 h-4" />
                                        Synchronize Records
                                      </button>
                                    </div>

                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Clinical Background</label>
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Confidential Record</span>
                                      </div>
                                      <textarea
                                        className="min-h-[140px] w-full rounded-[2rem] border border-slate-100 bg-slate-50/50 p-6 text-sm font-medium leading-relaxed focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                                        placeholder="Enter exhaustive medical history, previous procedures, and known conditions..."
                                        value={patientDetail.patient.medicalHistory || ""}
                                        onChange={(e) =>
                                          setPatientDetail((prev: any) =>
                                            prev ? { ...prev, patient: { ...prev.patient, medicalHistory: e.target.value } } : prev
                                          )
                                        }
                                      />
                                      <div className="flex justify-end pt-2">
                                        <button
                                          className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                                          onClick={() =>
                                            hasPermission("edit")
                                              ? runAction(
                                                `save-history-${selectedPatientId}`,
                                                async () => {
                                                  await api.updateAdminPatient(token, selectedPatientId, { medicalHistory: patientDetail.patient.medicalHistory || "" });
                                                  await loadPatientDetail(selectedPatientId);
                                                  await loadAll();
                                                },
                                                "Profile Augmented",
                                                "Clinical history has been secured."
                                              )
                                              : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                                          }
                                        >
                                          Commit Changes
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid gap-8 md:grid-cols-2">
                                  <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-100 group">
                                    <div className="mb-6 flex items-center gap-3">
                                      <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
                                        <Activity className="w-5 h-5" />
                                      </div>
                                      <p className="text-sm font-bold text-slate-900">Allergy Surveillance</p>
                                    </div>
                                    <input
                                      className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all"
                                      placeholder="e.g. Penicillin, Lactose, Dust"
                                      value={allergiesText}
                                      onChange={(e) => setAllergiesText(e.target.value)}
                                    />
                                    <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Critical alerts will be shown in prescriptions</p>
                                  </div>

                                  <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-100 group">
                                    <div className="mb-6 flex items-center gap-3">
                                      <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                                        <ClipboardList className="w-5 h-5" />
                                      </div>
                                      <p className="text-sm font-bold text-slate-900">Chronic Management</p>
                                    </div>
                                    <input
                                      className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all"
                                      placeholder="e.g. Type II Diabetes, Hypertension"
                                      value={chronicDiseasesText}
                                      onChange={(e) => setChronicDiseasesText(e.target.value)}
                                    />
                                    <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tags help categorized patient risk Factor</p>
                                  </div>
                                </div>

                                <div className="flex justify-center -mt-4">
                                  <button
                                    className="bg-white border border-slate-200 text-slate-900 px-10 py-4 rounded-[2rem] font-bold text-sm shadow-xl shadow-slate-100 hover:bg-slate-50 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
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
                                          "Biometric Metadata Updated",
                                          "Risk profile sync complete."
                                        )
                                        : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                                    }
                                  >
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    Synchronize Risk Metadata
                                  </button>
                                </div>

                                <div className="rounded-[2.5rem] bg-slate-50 border border-slate-100 p-8">
                                  <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
                                    <div>
                                      <h4 className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">Clinical Documents</h4>
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Lab Reports & Diagnostics</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="relative group overflow-hidden">
                                        <input
                                          type="file"
                                          accept="application/pdf"
                                          className="absolute inset-0 opacity-0 cursor-pointer"
                                          onChange={(e) => setReportUploadFile(e.target.files?.[0] || null)}
                                        />
                                        <button className="h-11 px-6 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                                          <Plus className="w-4 h-4" />
                                          {reportUploadFile ? reportUploadFile.name.slice(0, 12) + "..." : "Select PDF Document"}
                                        </button>
                                      </div>
                                      <button
                                        disabled={!reportUploadFile}
                                        className="h-11 px-6 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                                        onClick={() =>
                                          hasPermission("edit")
                                            ? runAction(
                                              `upload-report-${selectedPatientId}`,
                                              async () => {
                                                if (!reportUploadFile) throw new Error("Select a PDF file");
                                                await api.uploadAdminPatientReport(token, selectedPatientId, reportUploadFile, {
                                                  label: reportForm.label.trim() || "Clinical Report",
                                                  doctorComment: "",
                                                });
                                                setReportUploadFile(null);
                                                await loadPatientDetail(selectedPatientId);
                                                await loadAll();
                                              },
                                              "Archive Augmented",
                                              "Laboratory report has been permanently stored."
                                            )
                                            : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                                        }
                                      >
                                        Initiate Clinical Sync
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid gap-6">
                                    {(patientDetail.patient.reports || []).length === 0 && (
                                      <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                                        <FileText className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Documents Found</p>
                                      </div>
                                    )}
                                    {(patientDetail.patient.reports || []).map((r: any, idx: number) => (
                                      <div key={`${r.url}-${idx}`} className="group flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                        <div className="flex items-center gap-4">
                                          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <FileText className="w-6 h-6" />
                                          </div>
                                          <div>
                                            <p className="text-sm font-extrabold text-slate-900">{r.label || "Diagnostic Report"}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                              {r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : "Clinical History"}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <a
                                            href={resolveFileUrl(r.url)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                                          >
                                            <ExternalLink className="w-4 h-4" />
                                          </a>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="grid gap-8 lg:grid-cols-2">
                                  <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-100">
                                    <div className="mb-8 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                          <CalendarDays className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">Visit Timeline</p>
                                      </div>
                                      <Badge variant="secondary" className="bg-slate-50 text-[10px] font-bold">{visitTimeline.length}</Badge>
                                    </div>
                                    <div className="space-y-4">
                                      {visitTimeline.length === 0 && (
                                        <div className="py-12 text-center">
                                          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No Interaction History</p>
                                        </div>
                                      )}
                                      {visitTimeline.slice(0, 20).map((visit: any) => (
                                        <div key={visit._id} className="group relative flex items-start gap-4 pb-6 last:pb-0">
                                          <div className="absolute left-[19px] top-8 bottom-0 w-px bg-slate-100 group-last:hidden"></div>
                                          <div className="h-10 w-10 flex-shrink-0 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center relative z-10">
                                            <div className={cn(
                                              "w-2.5 h-2.5 rounded-full",
                                              visit.status === "completed" ? "bg-emerald-500" : "bg-orange-500"
                                            )}></div>
                                          </div>
                                          <div className="flex-1 bg-slate-50/50 rounded-2xl p-4 border border-slate-50 group-hover:bg-white group-hover:shadow-lg transition-all">
                                            <div className="flex items-center justify-between mb-1">
                                              <p className="text-xs font-bold text-slate-900">{visit.date}</p>
                                              <p className="text-[10px] font-extrabold text-primary uppercase">{visit.time}</p>
                                            </div>
                                            <p className="text-sm font-extrabold text-slate-900">{visit.doctorId?.name || "General Admissions"}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: {visit.status} • {money(visit.amount || 0)}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-100">
                                    <div className="mb-8 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                                          <Stethoscope className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">Clinical Rx History</p>
                                      </div>
                                    </div>
                                    <div className="grid gap-4">
                                      {pastPrescriptions.length === 0 && (
                                        <div className="py-12 text-center text-slate-300 font-bold text-[10px] uppercase tracking-widest">No Prescribed Medication</div>
                                      )}
                                      {pastPrescriptions.map((rx: any) => (
                                        <div key={rx._id} className="p-5 bg-slate-50/50 rounded-3xl border border-slate-50 hover:bg-white hover:shadow-xl transition-all group">
                                          <div className="flex items-start justify-between mb-3">
                                            <div>
                                              <p className="text-sm font-extrabold text-slate-900 capitalize">{rx.diagnosis || "Clinical Review"}</p>
                                              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{new Date(rx.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[10px]">CERTIFIED</Badge>
                                          </div>
                                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">{rx.doctorId?.name || "Clinic Staff"}</p>
                                            {rx.pdfUrl && (
                                              <a
                                                href={resolveFileUrl(rx.pdfUrl)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="h-8 w-8 flex items-center justify-center rounded-lg bg-white text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                              >
                                                <Download className="w-4 h-4" />
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "doctors" && (
                      <div className="space-y-10">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                          <div>
                            <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Practitioner Network</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Provider Onboarding & Resource Management</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-3 overflow-hidden">
                              {doctors.slice(0, 5).map((d, i) => (
                                <div key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                  {d.name?.[0]}
                                </div>
                              ))}
                              {doctors.length > 5 && (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-4 ring-white">
                                  +{doctors.length - 5}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                          <div className="md:col-span-2 grid gap-4 grid-cols-2">
                            <div className="relative group">
                              <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                              <input className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all shadow-sm" placeholder="Doctor Full Name" value={doctorForm.name} onChange={(e) => setDoctorForm((s) => ({ ...s, name: e.target.value }))} />
                            </div>
                            <div className="relative group">
                              <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                              <input className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all shadow-sm" placeholder="Clinical Specialization" value={doctorForm.specialization} onChange={(e) => setDoctorForm((s) => ({ ...s, specialization: e.target.value }))} />
                            </div>
                          </div>
                          <div className="relative group">
                            <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all shadow-sm" placeholder="Consultation Fees" value={doctorForm.fees} onChange={(e) => setDoctorForm((s) => ({ ...s, fees: e.target.value }))} />
                          </div>
                          <div className="relative group">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all shadow-sm" placeholder="Verified Email" value={doctorForm.email} onChange={(e) => setDoctorForm((s) => ({ ...s, email: e.target.value }))} />
                          </div>
                          <div className="relative group">
                            <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all shadow-sm" placeholder="Reg. No (e.g. MCI-123)" value={doctorForm.registrationNumber} onChange={(e) => setDoctorForm((s) => ({ ...s, registrationNumber: e.target.value }))} />
                          </div>
                          <button
                            className="h-12 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
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
                                  "Provider Credentials Verified",
                                  "Doctor profile has been added to the registry."
                                )
                                : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                            }
                          >
                            <UserPlus className="w-5 h-4" />
                            Onboard Practitioner
                          </button>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-3">
                          <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Active Duty Board</h3>
                            <div className="grid gap-6 sm:grid-cols-2">
                              {doctors.map((d) => (
                                <div key={d._id} className="relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden">
                                  <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform">
                                    <Stethoscope className="w-24 h-24" />
                                  </div>
                                  <div className="relative z-10">
                                    <div className="flex items-center gap-5 mb-6">
                                      <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                                        {d.name?.[0]}
                                      </div>
                                      <div>
                                        <p className="text-lg font-extrabold text-slate-900 leading-none">{d.name}</p>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2">{d.specialization}</p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-4 mb-8">
                                      <div className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-50 flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Consult Fee</span>
                                        <span className="text-sm font-extrabold text-slate-900 mt-0.5">{money(d.fees || 0)}</span>
                                      </div>
                                      <div className="flex-1 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-50 flex flex-col">
                                        <span className="text-[10px] font-bold text-emerald-600/60 uppercase">Load</span>
                                        <span className="text-sm font-extrabold text-emerald-600 mt-0.5">{d.appointmentsCount || "0"} Patients</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <button
                                        className="flex-1 h-11 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
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
                                              "Fee Structure Revised",
                                              "Standard consultation fee adjusted."
                                            )
                                            : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                                        }
                                      >
                                        Adjust Fee (+100)
                                      </button>
                                      <button
                                        className="h-11 w-11 flex items-center justify-center rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                        onClick={() =>
                                          hasPermission("delete")
                                            ? runAction(
                                              `doctor-delete-${d._id}`,
                                              async () => {
                                                await api.deactivateAdminDoctor(token, d._id);
                                                await loadAll();
                                              },
                                              "Access Terminated",
                                              "Doctor profile has been restricted."
                                            )
                                            : toast({ title: "Permission denied", description: "Delete access is restricted for your role.", variant: "destructive" })
                                        }
                                      >
                                        <ShieldOff className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-8">
                            <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-12 opacity-10">
                                <TrendingUp className="w-32 h-32" />
                              </div>
                              <div className="relative z-10">
                                <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Revenue Yield per Practitioner</h4>
                                <div className="space-y-6">
                                  {doctorRevenue.map((r) => (
                                    <div key={r.doctorId} className="group">
                                      <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{r.doctorName}</p>
                                        <p className="text-xs font-extrabold text-primary">{money(r.revenue)}</p>
                                      </div>
                                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          whileInView={{ width: "65%" }}
                                          className="h-full bg-primary"
                                        />
                                      </div>
                                      <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">{r.appointments} Successful Rounds</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="rounded-[2.5rem] bg-white p-8 border border-slate-100 shadow-sm">
                              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Sabbatical Sync</h4>
                              <div className="space-y-4">
                                <select className="h-12 w-full rounded-xl bg-slate-50 border-none px-4 text-xs font-bold focus:ring-2 focus:ring-primary/20" value={leaveForm.doctorId} onChange={(e) => setLeaveForm((s) => ({ ...s, doctorId: e.target.value }))}>
                                  <option value="">Select Practitioner</option>
                                  {doctors.map((d) => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                  ))}
                                </select>
                                <div className="grid grid-cols-2 gap-3">
                                  <input type="date" className="h-12 w-full rounded-xl bg-slate-50 border-none px-4 text-xs font-bold" value={leaveForm.fromDate} onChange={(e) => setLeaveForm((s) => ({ ...s, fromDate: e.target.value }))} />
                                  <input type="date" className="h-12 w-full rounded-xl bg-slate-50 border-none px-4 text-xs font-bold" value={leaveForm.toDate} onChange={(e) => setLeaveForm((s) => ({ ...s, toDate: e.target.value }))} />
                                </div>
                                <input className="h-12 w-full rounded-xl bg-slate-50 border-none px-4 text-xs font-bold" placeholder="Clinical Justification" value={leaveForm.reason} onChange={(e) => setLeaveForm((s) => ({ ...s, reason: e.target.value }))} />

                                <button
                                  className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4"
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
                                        "Leave Schedule Secured",
                                        "Doctor availability has been updated in the calendar."
                                      )
                                      : toast({ title: "Permission denied", description: "You have view-only access for this action.", variant: "destructive" })
                                  }
                                >
                                  <Calendar className="w-5 h-5" />
                                  Approve Sabbatical
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "appointments" && (
                      <div className="space-y-8">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                          <div>
                            <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Clinical Dispatch</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Live Appointment Orchestration</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <select
                                className="h-11 w-48 rounded-xl bg-white border border-slate-200 pl-10 pr-4 text-xs font-bold focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer appearance-none"
                                value={selectedDoctorFilter}
                                onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                              >
                                <option value="all">Consolidated View</option>
                                {doctors.map((d) => (
                                  <option key={d._id} value={d._id}>DR. {d.name.toUpperCase()}</option>
                                ))}
                              </select>
                            </div>
                            <button className="h-11 w-11 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
                              <RefreshCw className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 px-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Confirmations</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-200"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cancelled Rounds</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-200"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Awaiting Verification</span>
                          </div>
                        </div>

                        <div className="rounded-[2.5rem] bg-white border border-slate-100 p-8 shadow-sm">
                          <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="timeGridWeek"
                            headerToolbar={{
                              left: "prev,next today",
                              center: "title",
                              right: "dayGridMonth,timeGridWeek,timeGridDay",
                            }}
                            themeSystem="standard"
                            dayMaxEvents={true}
                            expandRows={true}
                            slotMinTime="08:00:00"
                            slotMaxTime="20:00:00"
                            allDaySlot={false}
                            slotLabelFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short', omitZeroMinute: false }}
                            editable={hasPermission("edit")}
                            eventDrop={handleCalendarDrop}
                            events={calendarEvents}
                            height="700px"
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
                                action === "confirmed" ? "Session Confirmed" : "Session Cancelled",
                                `Appointment logic sync complete for ${raw.userId?.name || "Patient"}.`
                              );
                            }}
                          />
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Live Stream Queue</h3>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {filteredAppointments.slice(0, 8).map((a) => (
                              <div key={a._id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{a.time}</p>
                                  <Badge className={cn(
                                    "text-[10px] font-bold border-none",
                                    a.status === "confirmed" ? "bg-emerald-50 text-emerald-600" : a.status === "cancelled" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                                  )}>
                                    {a.status.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-sm font-extrabold text-slate-900 group-hover:text-primary transition-colors">{a.userId?.name || "Private Profile"}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Attendant: {a.doctorId?.name || "Staff"}</p>
                                <div className="mt-6 flex items-center justify-between">
                                  <p className="text-xs font-bold text-slate-900 tracking-tight">{a.date}</p>
                                  <button
                                    className="h-9 px-4 rounded-xl bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100"
                                    onClick={() => openTransactionDetails({ ...a, appointmentId: a._id, paymentId: a.paymentId || "" })}
                                  >
                                    DETAILS
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "payments" && (
                      <div className="space-y-8">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                          <div>
                            <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Billing & Ledger</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Automated Invoice & Service-wise Revenue</p>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                          {payments.slice(0, 12).map((row) => (
                            <div key={row.appointmentId} className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden">
                              <div className="mb-6 flex items-center justify-between">
                                <Badge className={cn(
                                  "text-[10px] font-bold border-none",
                                  row.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                )}>
                                  {row.paymentStatus.toUpperCase()}
                                </Badge>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.date}</p>
                              </div>

                              <div className="mb-8">
                                <p className="text-lg font-extrabold text-slate-900 group-hover:text-primary transition-colors">{row.patient?.name || "Patient Profile"}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{serviceLabel(row.type)} • {row.time}</p>
                              </div>

                              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-50 space-y-3 mb-8">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-slate-400 uppercase tracking-tighter">Consultation</span>
                                  <span className="text-slate-900">{money(row?.billing?.consultation || 0)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-slate-400 uppercase tracking-tighter">Diagnostics/Rx</span>
                                  <span className="text-slate-900">{money((row?.billing?.lab || 0) + (row?.billing?.medicine || 0))}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold">
                                  <span className="text-slate-900">Aggregate</span>
                                  <span className="text-primary">{money(row.amount)}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
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
                                      row?.invoice?.invoiceNumber ? "Audit Log Updated" : "Financial Record Secured",
                                      "Clinical invoice has been committed to ledger."
                                    )
                                  }
                                  className="flex-1 h-11 rounded-xl bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 transition-all disabled:opacity-30"
                                >
                                  {row?.invoice?.invoiceNumber ? "SYNCHRONIZE" : "GENERATE INVOICE"}
                                </button>
                                <div className="flex gap-2">
                                  {row?.invoice?.pdfUrl && (
                                    <a
                                      href={resolveFileUrl(row.invoice.pdfUrl)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="h-11 w-11 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>
                                  )}
                                  <button
                                    className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                                    onClick={() => openTransactionDetails(row)}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeSection === "analytics" && (
                      <div className="space-y-10">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                          <div>
                            <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Intelligence Hub</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Predictive Insights & Conversational Analytics</p>
                          </div>
                          <div className="h-11 px-4 flex items-center gap-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold text-slate-900 uppercase">Last 30 Dynamic Periods</span>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-4">
                          {[
                            { label: "Conversion Yield", val: `${analytics?.conversionRate || 0}%`, icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
                            { label: "Patient Retention", val: `${analytics?.repeatPatientsPercent || 0}%`, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
                            { label: "Attrition Risk", val: `${analytics?.noShowPercentage || 0}%`, icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50" },
                            { label: "Net Profitability", val: `${analytics?.refundRatio || 0}%`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                          ].map((kpi, i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                              <div className={cn("inline-flex p-3 rounded-2xl mb-4", kpi.bg, kpi.color)}>
                                <kpi.icon className="w-5 h-5" />
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                              <h4 className="text-2xl font-extrabold text-slate-900 mt-2">{kpi.val}</h4>
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-10 lg:grid-cols-2">
                          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-10">Revenue Trajectory</h4>
                            <div className="space-y-6">
                              {(analytics?.monthlyRevenue || []).slice(-12).map((row: any, i: number) => (
                                <div key={row.month} className="group relative">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors uppercase">{row.month}</span>
                                    <span className="text-xs font-extrabold text-slate-900">{money(row.revenue || 0)}</span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min(100, Number(row.revenue || 0) / Math.max(1, Number(analytics?.monthlyRevenue?.sort((a: any, b: any) => b.revenue - a.revenue)[0]?.revenue || 1)) * 100)}%` }}
                                      className="h-full bg-slate-900 rounded-full"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-10">
                            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
                                <Activity className="w-48 h-48" />
                              </div>
                              <div className="relative z-10">
                                <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Clinical Load Analysis</h4>
                                <div className="space-y-6">
                                  {(analytics?.topDiseases || analytics?.mostCommonDisease || []).slice(0, 5).map((x: any) => (
                                    <div key={x.name} className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <span className="text-xs font-bold text-slate-300 uppercase">{x.name}</span>
                                      </div>
                                      <span className="text-xs font-extrabold text-white">{x.count} Active Cases</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Service Peak Metrics</h4>
                              <div className="grid grid-cols-2 gap-8">
                                {(analytics?.peakBookingHours || []).slice(0, 6).map((slot: any) => (
                                  <div key={slot.hour} className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                      {slot.hour.split(':')[0]}h
                                    </div>
                                    <div>
                                      <p className="text-xs font-extrabold text-slate-900">{slot.count}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Dispatches</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "prescriptions" && (
                      <div className="space-y-10">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                          <div>
                            <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Prescription Studio</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Digital Rx Generation & Clinical Archive</p>
                          </div>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-3">
                          <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Appointment Reference</label>
                                  <div className="relative group">
                                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all"
                                      placeholder="Enter ID (e.g. 64f...)"
                                      value={prescriptionForm.appointmentId}
                                      onChange={(e) => setPrescriptionForm((s) => ({ ...s, appointmentId: e.target.value }))}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Initial Diagnosis</label>
                                  <div className="relative group">
                                    <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all"
                                      placeholder="Clinical Observation"
                                      value={prescriptionForm.diagnosis}
                                      onChange={(e) => setPrescriptionForm((s) => ({ ...s, diagnosis: e.target.value }))}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Medication Regimen (One per line)</label>
                                <textarea
                                  className="w-full h-48 rounded-[2rem] border border-slate-200 bg-slate-50/50 p-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                                  placeholder="Dolo 650mg - 1-0-1&#10;Amoxicillin 500mg - after meals"
                                  value={prescriptionForm.medicinesText}
                                  onChange={(e) => setPrescriptionForm((s) => ({ ...s, medicinesText: e.target.value }))}
                                />
                              </div>

                              <button
                                className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
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
                                      setPrescriptionForm({ appointmentId: "", diagnosis: "", ayurvedicSuggestions: "", dietPlan: "", medicinesText: "", signedBy: "" });
                                      await loadAll();
                                    },
                                    "Clinical Rx Authenticated",
                                    "Prescription has been encrypted and shared with patient."
                                  )
                                }
                              >
                                <FileText className="w-5 h-5" />
                                COMMIT DIGITAL PRESCRIPTION
                              </button>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Recent Dispatches</h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                              {prescriptions.slice(0, 10).map((p) => (
                                <div key={p._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-xs font-bold text-white uppercase">
                                      {p.userId?.name?.[0] || "P"}
                                    </div>
                                    {p.pdfUrl && (
                                      <a
                                        href={resolveFileUrl(p.pdfUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary transition-colors group"
                                      >
                                        <Download className="w-4 h-4" />
                                      </a>
                                    )}
                                  </div>
                                  <p className="text-sm font-extrabold text-slate-900 mb-1">{p.userId?.name || "Anonymous Patient"}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter line-clamp-1">{p.diagnosis || "Consultation Routine"}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "products" && (
                      <div className="space-y-10">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                          <div>
                            <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Supply Chain & Inventory</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pharmaceutical Stock & Resource Procurement</p>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                          {[
                            { label: "Aggregate Stock", val: inventoryAlerts?.totals?.stockCount || 0, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
                            { label: "Critical Stock", val: (inventoryAlerts?.lowStock || []).length, icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50" },
                            { label: "Impending Expiry", val: (inventoryAlerts?.expirySoon || []).length, icon: Timer, color: "text-amber-600", bg: "bg-amber-50" },
                          ].map((stat, i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-6", stat.bg, stat.color)}>
                                <stat.icon className="w-6 h-6" />
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                              <h4 className="text-3xl font-extrabold text-slate-900 mt-2">{stat.val}</h4>
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-8 lg:grid-cols-3">
                          <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                              <h3 className="text-sm font-bold text-slate-900 mb-8 flex items-center gap-2">
                                <PlusCircle className="w-5 h-5 text-primary" />
                                Procurement Registry
                              </h3>
                              <div className="grid gap-4 md:grid-cols-3 mb-6">
                                <input className="h-12 rounded-xl bg-slate-50 border-none px-4 text-xs font-bold focus:ring-2 focus:ring-primary/20" placeholder="Product Name" value={productForm.name} onChange={(e) => setProductForm((s) => ({ ...s, name: e.target.value }))} />
                                <input className="h-12 rounded-xl bg-slate-50 border-none px-4 text-xs font-bold focus:ring-2 focus:ring-primary/20" placeholder="Unit Price" value={productForm.price} onChange={(e) => setProductForm((s) => ({ ...s, price: e.target.value }))} />
                                <input className="h-12 rounded-xl bg-slate-50 border-none px-4 text-xs font-bold focus:ring-2 focus:ring-primary/20" placeholder="Initial Stock" value={productForm.stock} onChange={(e) => setProductForm((s) => ({ ...s, stock: e.target.value }))} />
                              </div>
                              <button
                                className="h-12 px-8 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                                onClick={() => hasPermission("edit") ? runAction("create-product", async () => { await api.createAdminProduct(token, { ...productForm, price: Number(productForm.price || 0), stock: Number(productForm.stock || 0), active: true }); setProductForm({ name: "", price: "", stock: "", category: "Ayurveda" }); await loadAll(); }, "SKU Onboarded", "Product catalog has been updated.") : toast({ title: "Permission denied", description: "You have view-only access.", variant: "destructive" })}
                              >
                                Register Medicine SKU
                              </button>
                            </div>

                            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
                                <ShoppingCart className="w-48 h-48" />
                              </div>
                              <div className="relative z-10">
                                <h3 className="text-sm font-bold text-white mb-8 flex items-center gap-2">
                                  <Zap className="w-5 h-5 text-primary" />
                                  Rapid Replenishment
                                </h3>
                                <div className="grid gap-4 md:grid-cols-3 mb-4">
                                  <select className="h-12 rounded-xl bg-white/10 border-none px-4 text-xs font-bold text-white" value={purchaseForm.productId} onChange={(e) => setPurchaseForm((s) => ({ ...s, productId: e.target.value }))}>
                                    <option value="">Select SKU</option>
                                    {products.map((p) => <option key={p._id} value={p._id} className="text-black">{p.name}</option>)}
                                  </select>
                                  <input className="h-12 rounded-xl bg-white/10 border-none px-4 text-xs font-bold text-white placeholder:text-white/40" placeholder="Qty" value={purchaseForm.quantity} onChange={(e) => setPurchaseForm((s) => ({ ...s, quantity: e.target.value }))} />
                                  <input className="h-12 rounded-xl bg-white/10 border-none px-4 text-xs font-bold text-white placeholder:text-white/40" placeholder="Batch No" value={purchaseForm.batchNo} onChange={(e) => setPurchaseForm((s) => ({ ...s, batchNo: e.target.value }))} />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 mb-8">
                                  <input className="h-12 rounded-xl bg-white/10 border-none px-4 text-xs font-bold text-white placeholder:text-white/40" placeholder="Supplier Vendor" value={purchaseForm.supplier} onChange={(e) => setPurchaseForm((s) => ({ ...s, supplier: e.target.value }))} />
                                  <input type="date" className="h-12 rounded-xl bg-white/10 border-none px-4 text-xs font-bold text-white" value={purchaseForm.expiryDate} onChange={(e) => setPurchaseForm((s) => ({ ...s, expiryDate: e.target.value }))} />
                                </div>
                                <button
                                  className="h-12 px-8 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-all shadow-xl shadow-primary/20"
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
                                        "Manifest Processed",
                                        "Stock levels and fiscal procurement records updated."
                                      )
                                      : toast({ title: "Permission denied", description: "You have view-only access.", variant: "destructive" })
                                  }
                                >
                                  Commit Procurement Entry
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">SKU Performance</h3>
                            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                              {products.map((p) => (
                                <div key={p._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                  <div className="flex items-center justify-between mb-4">
                                    <Badge className={cn("text-[9px] font-bold", p.stock < (p.reorderLevel || 10) ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500")}>
                                      STOCK: {p.stock}
                                    </Badge>
                                    <p className="text-xs font-extrabold text-slate-900">{money(p.price)}</p>
                                  </div>
                                  <p className="text-sm font-extrabold text-slate-900 mb-1">{p.name}</p>
                                  <div className="flex items-center justify-between mt-4">
                                    <div className="flex -space-x-1">
                                      {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-6 w-6 rounded-full bg-slate-50 border border-white flex items-center justify-center text-[8px] text-slate-400 font-bold">
                                          {i + 1}
                                        </div>
                                      ))}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Exp: {p.expiryDate || "N/A"}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "content" && (
                      <div className="space-y-10">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                          <div>
                            <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Content Studio</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Clinical Blogs & Patient Testimonials</p>
                          </div>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-2">
                          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 mb-8 flex items-center gap-2">
                              <PenTool className="w-5 h-5 text-primary" />
                              Creative Dispatch
                            </h3>
                            <div className="space-y-6">
                              <div className="grid gap-4 md:grid-cols-2">
                                <input className="h-12 rounded-xl bg-slate-50 border-none px-4 text-xs font-bold" placeholder="Article Title" value={blogForm.title} onChange={(e) => setBlogForm((s) => ({ ...s, title: e.target.value }))} />
                                <input className="h-12 rounded-xl bg-slate-50 border-none px-4 text-xs font-bold" placeholder="URL Slug" value={blogForm.slug} onChange={(e) => setBlogForm((s) => ({ ...s, slug: e.target.value }))} />
                              </div>
                              <textarea
                                className="w-full h-48 rounded-[2rem] bg-slate-50 border-none p-6 text-xs font-bold resize-none"
                                placeholder="Draft your medical insights here..."
                                value={blogForm.content}
                                onChange={(e) => setBlogForm((s) => ({ ...s, content: e.target.value }))}
                              />
                              <button
                                className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                onClick={() => hasPermission("edit") ? runAction("create-blog", async () => { await api.createAdminBlog(token, { ...blogForm, excerpt: blogForm.content.slice(0, 120), published: true }); setBlogForm({ title: "", slug: "", content: "", category: "Health Tips" }); await loadAll(); }, "Content Published", "Article is now live on the public portal.") : toast({ title: "Permission denied", description: "You have view-only access.", variant: "destructive" })}
                              >
                                <Send className="w-4 h-4" />
                                RELEASE TO PUBLIC
                              </button>
                            </div>
                          </div>

                          <div className="space-y-8">
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                              <h3 className="text-sm font-bold text-slate-900 mb-8 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-emerald-500" />
                                Testimonial Moderation
                              </h3>
                              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {testimonials.map((x) => (
                                  <div key={x._id} className="p-5 rounded-3xl bg-slate-50 border border-slate-50 flex items-center justify-between group">
                                    <div>
                                      <p className="text-xs font-extrabold text-slate-900">{x.name}</p>
                                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Rating: {x.rating}/5</p>
                                    </div>
                                    <button
                                      className={cn(
                                        "h-9 px-4 rounded-xl text-[10px] font-bold transition-all",
                                        x.approved ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-900 text-white"
                                      )}
                                      onClick={() => runAction(`approve-${x._id}`, async () => { await api.approveAdminTestimonial(token, x._id, !x.approved); await loadAll(); }, "Moderation Sync", "Testimonial visibility updated.")}
                                    >
                                      {x.approved ? "APPROVED" : "APPROVE"}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "security" && (
                      <div className="space-y-10">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                          <div>
                            <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Terminal Security</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Infrastructure Guard & Access Control</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">System Fortified</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-4">
                          {[
                            { label: "2FA Verification", status: security?.otpEnabled, icon: Fingerprint, color: "text-indigo-600", bg: "bg-indigo-50" },
                            { label: "Cloud Backups", status: security?.backupConfigured, icon: Cloud, color: "text-blue-600", bg: "bg-blue-50" },
                            { label: "SSL Shielding", status: security?.sslEnabled, icon: Lock, color: "text-emerald-600", bg: "bg-emerald-50" },
                            { label: "RBAC Matrix", status: security?.roleBasedAccess, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
                          ].map((node, i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0", node.bg, node.color)}>
                                <node.icon className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{node.label}</p>
                                <p className={cn("text-xs font-extrabold uppercase mt-1", node.status ? "text-slate-900" : "text-amber-500")}>
                                  {node.status ? "ACTIVE" : "PENDING"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-8 lg:grid-cols-3">
                          <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                              <div className="mb-10 flex items-center justify-between">
                                <div>
                                  <h3 className="text-sm font-extrabold text-slate-900">Infrastructure Resilience</h3>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Auto-Backup & Disaster Recovery</p>
                                </div>
                                <button
                                  className="h-11 px-6 rounded-xl bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                                  onClick={() => runAction("manual-backup", async () => { await api.createAdminManualBackup(token); await loadAll(); }, "Archive Generated", "Snapshot has been stored in secure cloud.")}
                                >
                                  TRIGGER MANUAL SNAPSHOT
                                </button>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2 mb-8">
                                <div className="space-y-4">
                                  <select className="h-12 w-full rounded-xl bg-slate-50 border-none px-4 text-xs font-bold" value={backupConfig.autoBackupEnabled ? "enabled" : "disabled"} onChange={(e) => setBackupConfig((s) => ({ ...s, autoBackupEnabled: e.target.value === "enabled" }))}>
                                    <option value="enabled">Continuous Sync: ENABLED</option>
                                    <option value="disabled">Continuous Sync: DISABLED</option>
                                  </select>
                                  <input className="h-12 w-full rounded-xl bg-slate-50 border-none px-4 text-xs font-bold" placeholder="CRON SCHEDULE" value={backupConfig.scheduleCron} onChange={(e) => setBackupConfig((s) => ({ ...s, scheduleCron: e.target.value }))} />
                                </div>
                                <div className="space-y-4">
                                  <input className="h-12 w-full rounded-xl bg-slate-50 border-none px-4 text-xs font-bold" placeholder="CLOUD ENDPOINT" value={backupConfig.cloudProvider} onChange={(e) => setBackupConfig((s) => ({ ...s, cloudProvider: e.target.value }))} />
                                  <input className="h-12 w-full rounded-xl bg-slate-50 border-none px-4 text-xs font-bold" placeholder="VAULT PATH" value={backupConfig.cloudPath} onChange={(e) => setBackupConfig((s) => ({ ...s, cloudPath: e.target.value }))} />
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <div className="flex -space-x-2">
                                  {backupFiles.slice(0, 5).map((f, i) => (
                                    <div key={i} className="h-8 w-8 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-400 uppercase">
                                      JSON
                                    </div>
                                  ))}
                                </div>
                                <button
                                  className="h-10 px-6 rounded-xl border border-slate-200 text-[10px] font-extrabold hover:bg-slate-50 transition-all"
                                  onClick={() => runAction("backup-config", async () => { await api.updateAdminBackupConfig(token, backupConfig); }, "Config Committed", "Clinical persistence layer updated.")}
                                >
                                  UPDATE POLICY
                                </button>
                              </div>
                            </div>

                            {isAdmin && (
                              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
                                  <Users className="w-48 h-48" />
                                </div>
                                <div className="relative z-10">
                                  <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Authority Matrix</h3>
                                    <button
                                      className="h-10 px-6 rounded-xl bg-primary text-white text-[10px] font-bold hover:opacity-90 transition-all shadow-xl shadow-primary/20"
                                      onClick={() => runAction("save-permissions", async () => { await api.updateAdminPermissions(token, { matrix: permissionMatrix }); await loadAll(); }, "Matrix Synced", "Authority levels reconfigured.")}
                                    >
                                      SYNCHRONIZE ROLES
                                    </button>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                      <thead>
                                        <tr className="border-b border-white/10">
                                          <th className="py-4 font-bold text-slate-500 uppercase">Clinical Role</th>
                                          {["VIEW", "EDIT", "DELETE", "REFUND"].map(p => <th key={p} className="py-4 font-bold text-slate-500">{p}</th>)}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {["admin", "doctor", "receptionist", "accountant"].map((role) => (
                                          <tr key={role} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                                            <td className="py-4 font-extrabold uppercase text-slate-300">{role}</td>
                                            {(["view", "edit", "delete", "refund"] as const).map((perm) => (
                                              <td key={perm} className="py-4">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                  <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={Boolean(permissionMatrix?.[role]?.[perm])}
                                                    onChange={(e) => updateMatrixCell(role, perm, e.target.checked)}
                                                  />
                                                  <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary" />
                                                </label>
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-8">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Live Sentinel Feed</h3>
                            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                              {auditLogs.slice(0, 50).map((log) => (
                                <div key={log._id} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-extrabold text-primary uppercase tracking-widest">{log.action}</span>
                                    <span className="text-[8px] font-bold text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                  </div>
                                  <p className="text-[10px] font-bold text-slate-900 uppercase">Actor: {log.payload?.ip || "SYSTEM"}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
            {selectedTransaction && (
              <div className="bg-white">
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Transaction Details</p>
                    <h2 className="text-3xl font-heading font-extrabold tracking-tight mb-2">
                      {money(selectedTransaction.amount)}
                    </h2>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-white/10 text-white border-white/20">
                        {selectedTransaction.paymentStatus?.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-medium text-slate-400">
                        ID: {selectedTransaction.appointmentId?.slice(-8)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Patient</p>
                      <p className="font-bold text-slate-900">{selectedTransaction.patient?.name || "N/A"}</p>
                      <p className="text-xs text-slate-500 mt-1">{selectedTransaction.patient?.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Provider</p>
                      <p className="font-bold text-slate-900">{selectedTransaction.doctorName || selectedTransaction.doctorId?.name || "Clinic Staff"}</p>
                      <p className="text-xs text-slate-500 mt-1">{serviceLabel(selectedTransaction.type)}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Billing Breakout</p>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Consultation Fee</span>
                        <span className="text-slate-900 font-bold">{money(selectedTransaction.billing?.consultation || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Lab / Medicine</span>
                        <span className="text-slate-900 font-bold">{money((selectedTransaction.billing?.medicine || 0) + (selectedTransaction.billing?.lab || 0))}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-3 border-t border-slate-50">
                        <span className="text-slate-900 font-extrabold">Net Total</span>
                        <span className="text-primary font-extrabold text-lg">{money(selectedTransaction.amount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setDetailsOpen(false)}
                      className="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                      Close Portal
                    </button>
                    {selectedTransaction.invoice?.pdfUrl && (
                      <a
                        href={resolveFileUrl(selectedTransaction.invoice.pdfUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </section>
    </PageShell>
  );
};

export default AdminDashboard;

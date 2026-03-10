/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = "/api";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "API request failed");
  }
  return res.json();
}

async function uploadFile<T>(path: string, file: File, fields: Record<string, string> = {}, token?: string | null): Promise<T> {
  const form = new FormData();
  form.append("report", file);
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Upload failed");
  }
  return res.json();
}

export const api = {
  request,
  getDoctors: () => request<any[]>("/doctors"),
  getDoctorSlots: (doctorId: string, date: string) => request<{ date: string; available: string[] }>(`/doctors/${doctorId}/slots?date=${date}`),
  getProducts: () => request<any[]>("/products"),
  createInquiry: (productId: string, payload: unknown) => request(`/products/${productId}/inquiry`, { method: "POST", body: payload }),
  createContact: (payload: unknown) => request("/contacts", { method: "POST", body: payload }),
  getTestimonials: () => request<any[]>("/testimonials"),
  getBlogs: () => request<any[]>("/blogs"),
  getBlogBySlug: (slug: string) => request<any>(`/blogs/${slug}`),
  register: (payload: unknown) => request<any>("/auth/register", { method: "POST", body: payload }),
  login: (payload: unknown) => request<any>("/auth/login", { method: "POST", body: payload }),
  createAppointmentOrder: (token: string, payload: unknown) => request<any>("/appointments/create-order", { method: "POST", body: payload, token }),
  verifyPayment: (token: string, payload: unknown) => request<any>("/appointments/verify-payment", { method: "POST", body: payload, token }),
  getMyAppointments: (token: string) => request<any[]>("/appointments/me", { token }),
  getDoctorAppointments: (token: string) => request<any[]>("/appointments/doctor/me", { token }),
  getMyPrescriptions: (token: string) => request<any[]>("/prescriptions/me", { token }),
  getAdminDashboard: (token: string) => request<any>("/admin/dashboard", { token }),
  getAdminPatients: (token: string, search = "") => request<any[]>(`/admin/patients${search ? `?search=${encodeURIComponent(search)}` : ""}`, { token }),
  getAdminPatientDetail: (token: string, patientId: string) => request<any>(`/admin/patients/${patientId}`, { token }),
  createAdminPatient: (token: string, payload: unknown) => request<any>("/admin/patients", { method: "POST", body: payload, token }),
  updateAdminPatient: (token: string, patientId: string, payload: unknown) =>
    request<any>(`/admin/patients/${patientId}`, { method: "PATCH", body: payload, token }),
  uploadAdminPatientReport: (token: string, patientId: string, file: File, fields: Record<string, string> = {}) =>
    uploadFile<any>(`/admin/patients/${patientId}/reports/upload`, file, fields, token),
  commentAdminPatientReport: (token: string, patientId: string, index: number, comment: string) =>
    request<any>(`/admin/patients/${patientId}/reports/${index}/comment`, { method: "PATCH", body: { comment }, token }),
  emailAdminPatientReport: (token: string, patientId: string, index: number) =>
    request<any>(`/admin/patients/${patientId}/reports/${index}/email`, { method: "POST", token }),
  deactivateAdminPatient: (token: string, patientId: string) => request<any>(`/admin/patients/${patientId}`, { method: "DELETE", token }),
  getAdminAppointments: (token: string) => request<any[]>("/admin/appointments", { token }),
  updateAdminAppointment: (token: string, appointmentId: string, payload: unknown) =>
    request<any>(`/admin/appointments/${appointmentId}`, { method: "PATCH", body: payload, token }),
  refundAdminAppointment: (token: string, appointmentId: string, payload: unknown) =>
    request<any>(`/admin/appointments/${appointmentId}/refund`, { method: "POST", body: payload, token }),
  getAdminPrescriptions: (token: string) => request<any[]>("/admin/prescriptions", { token }),
  createPrescription: (token: string, payload: unknown) => request<any>("/prescriptions", { method: "POST", body: payload, token }),
  getAdminPayments: (token: string) => request<any[]>("/admin/payments", { token }),
  generateAdminInvoice: (token: string, appointmentId: string, payload: unknown = {}) =>
    request<any>(`/admin/payments/${appointmentId}/invoice`, { method: "POST", body: payload, token }),
  getAdminDoctors: (token: string) => request<any[]>("/admin/doctors", { token }),
  createAdminDoctor: (token: string, payload: unknown) => request<any>("/admin/doctors", { method: "POST", body: payload, token }),
  updateAdminDoctor: (token: string, doctorId: string, payload: unknown) =>
    request<any>(`/admin/doctors/${doctorId}`, { method: "PATCH", body: payload, token }),
  deactivateAdminDoctor: (token: string, doctorId: string) => request<any>(`/admin/doctors/${doctorId}`, { method: "DELETE", token }),
  getAdminDoctorRevenue: (token: string) => request<any[]>("/admin/doctors/revenue", { token }),
  addAdminDoctorLeave: (token: string, doctorId: string, payload: unknown) =>
    request<any>(`/admin/doctors/${doctorId}/leaves`, { method: "POST", body: payload, token }),
  updateAdminDoctorLeave: (token: string, doctorId: string, leaveId: string, payload: unknown) =>
    request<any>(`/admin/doctors/${doctorId}/leaves/${leaveId}`, { method: "PATCH", body: payload, token }),
  getAdminProducts: (token: string) => request<any[]>("/admin/products", { token }),
  createAdminProduct: (token: string, payload: unknown) => request<any>("/admin/products", { method: "POST", body: payload, token }),
  updateAdminProduct: (token: string, productId: string, payload: unknown) =>
    request<any>(`/admin/products/${productId}`, { method: "PATCH", body: payload, token }),
  createAdminProductPurchaseEntry: (token: string, productId: string, payload: unknown) =>
    request<any>(`/admin/products/${productId}/purchase`, { method: "POST", body: payload, token }),
  getAdminInventoryAlerts: (token: string) => request<any>("/admin/inventory/alerts", { token }),
  getAdminBlogs: (token: string) => request<any[]>("/admin/blogs", { token }),
  createAdminBlog: (token: string, payload: unknown) => request<any>("/admin/blogs", { method: "POST", body: payload, token }),
  updateAdminBlog: (token: string, blogId: string, payload: unknown) =>
    request<any>(`/admin/blogs/${blogId}`, { method: "PATCH", body: payload, token }),
  getAdminTestimonials: (token: string) => request<any[]>("/admin/testimonials", { token }),
  approveAdminTestimonial: (token: string, testimonialId: string, approved: boolean) =>
    request<any>(`/admin/testimonials/${testimonialId}/approve`, { method: "PATCH", body: { approved }, token }),
  getAdminContacts: (token: string) => request<any[]>("/admin/contacts", { token }),
  updateAdminContactStatus: (token: string, contactId: string, status: string) =>
    request<any>(`/admin/contacts/${contactId}/status`, { method: "PATCH", body: { status }, token }),
  getAdminAnalytics: (token: string) => request<any>("/admin/analytics", { token }),
  getAdminSecurityStatus: (token: string) => request<any>("/admin/security/status", { token }),
  getAdminPermissions: (token: string) => request<any>("/admin/permissions", { token }),
  updateAdminPermissions: (token: string, payload: unknown) =>
    request<any>("/admin/permissions", { method: "PATCH", body: payload, token }),
  createAdminManualBackup: (token: string) => request<any>("/admin/backup/manual", { method: "POST", token }),
  getAdminBackupList: (token: string) => request<any>("/admin/backup/list", { token }),
  updateAdminBackupConfig: (token: string, payload: unknown) => request<any>("/admin/backup/config", { method: "PATCH", body: payload, token }),
  getAdminAuditLogs: (token: string) => request<any[]>("/admin/activity", { token }),
  getAdminLoginHistory: (token: string) => request<any[]>("/admin/audit/login-history", { token }),
};

export const authStore = {
  getToken: () => (typeof window === "undefined" ? null : localStorage.getItem("spc_token")),
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("spc_token", token);
    }
  },
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("spc_token");
    }
  },
  getUser: () => {
    if (typeof window === "undefined") {
      return null;
    }
    const raw = localStorage.getItem("spc_user");
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: unknown) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("spc_user", JSON.stringify(user));
    }
  },
};

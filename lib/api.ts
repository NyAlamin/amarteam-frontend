import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove("token");
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth"))
        window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),

  // OTP
  sendOtp: (data: { identifier: string; channel: string; purpose: string }) =>
    api.post("/auth/otp/send", data),
  verifyOtp: (data: { identifier: string; code: string; purpose: string }) =>
    api.post("/auth/otp/verify", data),
  otpLogin: (data: { identifier: string; code: string }) =>
    api.post("/auth/otp/login", data),

  // Password
  resetPassword: (data: { identifier: string; code: string; newPassword: string }) =>
    api.post("/auth/password/reset", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post("/auth/password/change", data),

  // OAuth — full page redirects
  googleUrl: () => `${API_BASE}/auth/google`,
  appleUrl: () => `${API_BASE}/auth/apple`,
};

export const playersAPI = {
  getAll: (params?: Record<string, string>) => api.get("/players", { params }),
  getOne: (id: string) => api.get(`/players/${id}`),
  getMyProfile: () => api.get("/players/me/profile"),
  register: (data: any) => api.post("/players/register", data),
  create: (data: any) => api.post("/players", data),
  update: (id: string, data: any) => api.patch(`/players/${id}`, data),
  selfUpdate: (data: any) => api.patch("/players/me/profile", data),
  changeTier: (id: string, tier: string) => api.patch(`/players/${id}/tier`, { tier }),
  toggleAvailability: (id: string) => api.patch(`/players/${id}/toggle-availability`),
  delete: (id: string) => api.delete(`/players/${id}`),
  // Admin endpoints
  getAllAdmin: (params?: Record<string, string>) => api.get("/players/admin/all", { params }),
  getPending: () => api.get("/players/admin/pending"),
  approve: (id: string) => api.patch(`/players/${id}/approve`),
  reject: (id: string) => api.delete(`/players/${id}/reject`),
};

export const bookingsAPI = {
  create: (data: any) => api.post("/bookings", data),
  getMyBookings: () => api.get("/bookings/my"),
  getPlayerBookings: () => api.get("/bookings/player/my"),
  getAll: () => api.get("/bookings"),
  getOne: (id: string) => api.get(`/bookings/${id}`),
  update: (id: string, data: any) => api.patch(`/bookings/${id}`, data),
  confirm: (id: string) => api.patch(`/bookings/${id}/confirm`),
  cancel: (id: string) => api.patch(`/bookings/${id}/cancel`),
  complete: (id: string) => api.patch(`/bookings/${id}/complete`),
};

export const reviewsAPI = {
  getByPlayer: (playerId: string) => api.get(`/reviews/player/${playerId}`),
  create: (data: any) => api.post("/reviews", data),
  getAll: () => api.get("/reviews"),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

export const teamRequestsAPI = {
  create: (data: any) => api.post("/team-requests", data),
  getMyRequests: () => api.get("/team-requests/my"),
  getPlayerRequests: () => api.get("/team-requests/player/my"),
  getAll: (params?: Record<string, string>) => api.get("/team-requests", { params }),
  getOne: (id: string) => api.get(`/team-requests/${id}`),
  update: (id: string, data: any) => api.patch(`/team-requests/${id}`, data),
  suggest: (id: string, data: any) => api.patch(`/team-requests/${id}/suggest`, data),
  delete: (id: string) => api.delete(`/team-requests/${id}`),
};

export const usersAPI = {
  getMe: () => api.get("/users/me"),
  updateMe: (data: any) => api.patch("/users/me", data),
  getHirers: () => api.get("/users/hirers"),
  getAll: () => api.get("/users"),
  toggleActive: (id: string) => api.patch(`/users/${id}/toggle-active`),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const uploadAPI = {
  image: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
  publicImage: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/upload/public/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
  video: (file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post("/upload/video", fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
};

// ─── Vehicles ───
export const vehiclesAPI = {
  getAll: (params?: Record<string, string>) => api.get("/vehicles", { params }),
  getOne: (id: string) => api.get(`/vehicles/${id}`),
  getAllAdmin: (params?: Record<string, string>) => api.get("/vehicles/admin/all", { params }),
  create: (data: any) => api.post("/vehicles", data),
  update: (id: string, data: any) => api.patch(`/vehicles/${id}`, data),
  toggleAvailability: (id: string) => api.patch(`/vehicles/${id}/toggle-availability`),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
  // Bookings
  createBooking: (data: any) => api.post("/vehicles/bookings", data),
  getMyBookings: () => api.get("/vehicles/bookings/my"),
  getAllBookings: (params?: Record<string, string>) => api.get("/vehicles/bookings/all", { params }),
  getBooking: (id: string) => api.get(`/vehicles/bookings/${id}`),
  updateBooking: (id: string, data: any) => api.patch(`/vehicles/bookings/${id}`, data),
  deleteBooking: (id: string) => api.delete(`/vehicles/bookings/${id}`),
};

// ─── Shop ───
export const shopAPI = {
  // Categories
  getCategories: () => api.get("/shop/categories"),
  getCategoriesAdmin: () => api.get("/shop/categories/admin"),
  createCategory: (data: any) => api.post("/shop/categories", data),
  updateCategory: (id: string, data: any) => api.patch(`/shop/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/shop/categories/${id}`),
  // Products
  getProducts: (params?: Record<string, string>) => api.get("/shop/products", { params }),
  getProductsAdmin: (params?: Record<string, string>) => api.get("/shop/products/admin", { params }),
  getProduct: (id: string) => api.get(`/shop/products/${id}`),
  createProduct: (data: any) => api.post("/shop/products", data),
  updateProduct: (id: string, data: any) => api.patch(`/shop/products/${id}`, data),
  toggleActive: (id: string) => api.patch(`/shop/products/${id}/toggle-active`),
  toggleFeatured: (id: string) => api.patch(`/shop/products/${id}/toggle-featured`),
  deleteProduct: (id: string) => api.delete(`/shop/products/${id}`),
  // Orders
  createOrder: (data: any) => api.post("/shop/orders", data),
  getMyOrders: () => api.get("/shop/orders/my"),
  getAllOrders: (params?: Record<string, string>) => api.get("/shop/orders/all", { params }),
  getOrder: (id: string) => api.get(`/shop/orders/${id}`),
  updateOrder: (id: string, data: any) => api.patch(`/shop/orders/${id}`, data),
  deleteOrder: (id: string) => api.delete(`/shop/orders/${id}`),
  getStats: () => api.get("/shop/stats"),
};

// ─── Cameramen ───
export const cameramenAPI = {
  createBooking: (data: any) => api.post("/cameramen/bookings", data),
  getMyBookings: () => api.get("/cameramen/bookings/my"),
  getReceivedBookings: () => api.get("/cameramen/bookings/received"),
  getAllBookings: (params?: Record<string, string>) => api.get("/cameramen/bookings/all", { params }),
  getBooking: (id: string) => api.get(`/cameramen/bookings/${id}`),
  updateBooking: (id: string, data: any) => api.patch(`/cameramen/bookings/${id}`, data),
  deleteBooking: (id: string) => api.delete(`/cameramen/bookings/${id}`),
};

export const settingsAPI = {
  getAll: () => api.get("/settings"),
  set: (key: string, value: string, publicId?: string) =>
    api.post("/settings", { key, value, publicId }),
  remove: (key: string) => api.delete(`/settings/${key}`),
};

export const paymentsAPI = {
  getRates: () => api.get("/payments/rates"),
  quote: (refType: string, refId: string) => api.get(`/payments/quote/${refType}/${refId}`),
  ledger: (refType: string, refId: string) => api.get(`/payments/ledger/${refType}/${refId}`),
  totals: () => api.get("/payments/totals"),
  record: (data: any) => api.post("/payments/record", data),
  payout: (data: any) => api.post("/payments/payout", data),
  direct: (data: any) => api.post("/payments/direct", data),
  myEarnings: () => api.get("/payments/my-earnings"),
    submitClaim: (data: any) => api.post("/payments/claims", data),
  myClaims: () => api.get("/payments/claims/my"),
  listClaims: (status?: string) => api.get("/payments/claims", { params: status ? { status } : {} }),
  claimDetail: (id: string) => api.get(`/payments/claims/${id}`),
  approveClaim: (id: string, data: any) => api.post(`/payments/claims/${id}/approve`, data),
  rejectClaim: (id: string, data: any) => api.post(`/payments/claims/${id}/reject`, data),
};



export default api;
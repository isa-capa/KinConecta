(function () {
  const api = window.KCApiClient;

  if (!api) {
    console.warn("KCApiClient no esta disponible. Carga http-client.js antes de auth-api-services.js");
    return;
  }

  function normalizeRole(value) {
    const raw = String(value || "").trim().toUpperCase();
    if (raw === "GUIDE") return "GUIDE";
    if (raw === "ADMIN") return "ADMIN";
    return "TOURIST";
  }

  async function login(payload) {
    return api.post("/auth/login", {
      email: String(payload?.email || "").trim().toLowerCase(),
      password: String(payload?.password || ""),
    });
  }

  async function register(payload) {
    return api.post("/auth/register", {
      role: normalizeRole(payload?.role),
      fullName: String(payload?.fullName || "").trim(),
      dateOfBirth: payload?.dateOfBirth,
      email: String(payload?.email || "").trim().toLowerCase(),
      password: String(payload?.password || ""),
      countryCode: String(payload?.countryCode || "").trim(),
      phoneNumber: String(payload?.phoneNumber || "").replace(/\D/g, ""),
    });
  }

  async function logout() {
    return Promise.resolve({ ok: true, status: 204, data: null });
  }

  async function me() {
    return api.get("/auth/me");
  }

  window.KCAuthApi = {
    endpoints: {
      login: "/auth/login",
      register: "/auth/register",
      me: "/auth/me",
    },
    auth: {
      login,
      register,
      logout,
      me,
    },
  };
})();

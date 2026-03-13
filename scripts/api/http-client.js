(function () {
  const DEFAULT_TIMEOUT_MS = 10000;
  const NETWORK_COOLDOWN_MS = 15000;
  const AUTH_TOKEN_KEY = "kcAuthToken";
  const AUTH_FULL_NAME_KEY = "kcAuthFullName";

  const state = {
    baseUrl: resolveDefaultBaseUrl(),
    getAuthToken: () => window.localStorage.getItem(AUTH_TOKEN_KEY),
    onUnauthorized: handleUnauthorized,
    networkDownUntil: 0,
    currentUserPromise: null,
  };

  function resolveDefaultBaseUrl() {
    if (window.__KC_CONFIG__?.apiBaseUrl) {
      return String(window.__KC_CONFIG__.apiBaseUrl).replace(/\/+$/, "");
    }

    const { protocol, hostname } = window.location;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `${protocol}//${hostname}:8080/api`;
    }

    return "http://localhost:8080/api";
  }

  function handleUnauthorized() {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_FULL_NAME_KEY);
    window.localStorage.removeItem("kcAuthMode");
  }

  function readStoredSession() {
    try {
      const raw = window.localStorage.getItem("kc_temp_auth_session_v1");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (_error) {
      return null;
    }
  }

  function normalizeRole(value) {
    const raw = String(value || "").trim().toUpperCase();
    if (raw === "GUIDE") return "guide";
    if (raw === "TOURIST") return "tourist";
    if (raw === "ADMIN") return "admin";
    return "";
  }

  function normalizeNumericId(value) {
    const digits = String(value ?? "").match(/\d+/g);
    const parsed = Number(digits ? digits.join("") : value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  function unwrapAuthUser(payload) {
    if (!payload || typeof payload !== "object") return null;
    if (payload.user && typeof payload.user === "object") {
      return {
        ...payload.user,
        role: payload.user.role || payload.role,
        userId: payload.user.userId || payload.user.id || payload.userId,
      };
    }
    return payload;
  }

  function buildSnapshot(session, meUser) {
    const normalizedUser = unwrapAuthUser(meUser);
    const source = normalizedUser && typeof normalizedUser === "object" ? normalizedUser : session || {};
    const role = normalizeRole(source.role || session?.role);
    const userId = normalizeNumericId(source.userId || source.id || session?.userId);
    const storedFullName = String(window.localStorage.getItem(AUTH_FULL_NAME_KEY) || "").trim();
    const fullName = String(
      source.fullName || source.name || storedFullName || session?.fullName || session?.name || "",
    ).trim();

    return {
      raw: source,
      role,
      userId,
      fullName,
      email: String(source.email || session?.email || "").trim(),
      avatarUrl: String(source.avatarUrl || session?.avatarUrl || "").trim(),
      guideId: role === "guide" ? userId : normalizeNumericId(window.localStorage.getItem("kc_guide_id")),
      touristId: role === "tourist" ? userId : normalizeNumericId(window.localStorage.getItem("kc_tourist_id")),
      isAuthenticated: Boolean(role && userId),
    };
  }

  function cacheSnapshot(snapshot) {
    if (!snapshot?.isAuthenticated) return snapshot;
    const session = {
      mode: window.localStorage.getItem("kcAuthMode") || "backend",
      role: snapshot.role,
      userId: String(snapshot.userId),
      fullName: snapshot.fullName,
      email: snapshot.email,
      avatarUrl: snapshot.avatarUrl,
      loginAt: new Date().toISOString(),
    };

    window.localStorage.setItem("kc_temp_auth_session_v1", JSON.stringify(session));
    if (snapshot.fullName) {
      window.localStorage.setItem(AUTH_FULL_NAME_KEY, snapshot.fullName);
    }
    if (snapshot.role === "guide" && snapshot.guideId) {
      window.localStorage.setItem("kc_guide_id", String(snapshot.guideId));
    }
    if (snapshot.role === "tourist" && snapshot.touristId) {
      window.localStorage.setItem("kc_tourist_id", String(snapshot.touristId));
    }
    return snapshot;
  }

  function getSessionSnapshot() {
    return buildSnapshot(readStoredSession(), null);
  }

  async function fetchCurrentUser(options) {
    const config = options || {};
    const session = readStoredSession();
    const hasToken = Boolean(state.getAuthToken ? state.getAuthToken() : null);

    if (!hasToken) {
      return buildSnapshot(session, null);
    }

    if (!config.force && state.currentUserPromise) {
      return state.currentUserPromise;
    }

    state.currentUserPromise = get("/auth/me")
      .then((response) => cacheSnapshot(buildSnapshot(session, response?.data || null)))
      .catch((_error) => buildSnapshot(session, null))
      .finally(() => {
        state.currentUserPromise = null;
      });

    return state.currentUserPromise;
  }

  function configure(options) {
    if (!options || typeof options !== "object") return;
    if (options.baseUrl) state.baseUrl = String(options.baseUrl).replace(/\/+$/, "");
    if (typeof options.getAuthToken === "function") state.getAuthToken = options.getAuthToken;
    if (typeof options.onUnauthorized === "function") state.onUnauthorized = options.onUnauthorized;
  }

  function buildUrl(path) {
    if (/^https?:\/\//i.test(path)) return path;
    const cleanPath = String(path || "").replace(/^\/+/, "");
    return `${state.baseUrl}/${cleanPath}`;
  }

  function withTimeout(promise, timeoutMs) {
    const ms = typeof timeoutMs === "number" ? timeoutMs : DEFAULT_TIMEOUT_MS;
    let timer = null;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`API timeout after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
  }

  async function request(path, options) {
    const url = buildUrl(path);
    const config = options || {};
    const method = (config.method || "GET").toUpperCase();

    if (Date.now() < state.networkDownUntil) {
      const offlineError = new Error("API temporarily unavailable (network cooldown).");
      offlineError.isNetworkError = true;
      offlineError.isApiUnavailable = true;
      offlineError.url = url;
      offlineError.method = method;
      throw offlineError;
    }

    const headers = {
      Accept: "application/json",
      ...(config.headers || {}),
    };

    if (config.body && !headers["Content-Type"] && !(config.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const token = state.getAuthToken ? state.getAuthToken() : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    const fetchOptions = {
      method,
      headers,
      body: config.body instanceof FormData ? config.body : config.body ? JSON.stringify(config.body) : undefined,
      credentials: config.credentials || "omit",
    };

    let response = null;
    try {
      response = await withTimeout(fetch(url, fetchOptions), config.timeoutMs);
    } catch (error) {
      const networkError = new Error(`API ${method} ${url} network error`);
      networkError.isNetworkError = true;
      networkError.cause = error;
      networkError.url = url;
      networkError.method = method;
      state.networkDownUntil = Date.now() + NETWORK_COOLDOWN_MS;
      throw networkError;
    }

    const text = await response.text();
    const data = text ? safeParseJSON(text) : null;

    if (response.ok) {
      state.networkDownUntil = 0;
    }

    if (response.status === 401 && typeof state.onUnauthorized === "function") {
      state.onUnauthorized(response, data);
    }

    if (!response.ok) {
      const error = new Error(`API ${method} ${url} failed with ${response.status}`);
      error.status = response.status;
      error.payload = data;
      throw error;
    }

    return {
      ok: true,
      status: response.status,
      data,
      headers: response.headers,
    };
  }

  function safeParseJSON(raw) {
    try {
      return JSON.parse(raw);
    } catch (_error) {
      return raw;
    }
  }

  function get(path, options) {
    return request(path, { ...(options || {}), method: "GET" });
  }

  function post(path, body, options) {
    return request(path, { ...(options || {}), method: "POST", body });
  }

  function put(path, body, options) {
    return request(path, { ...(options || {}), method: "PUT", body });
  }

  function patch(path, body, options) {
    return request(path, { ...(options || {}), method: "PATCH", body });
  }

  function del(path, options) {
    return request(path, { ...(options || {}), method: "DELETE" });
  }

  window.KCApiClient = {
    configure,
    request,
    get,
    post,
    put,
    patch,
    delete: del,
  };

  window.KCAuthState = {
    getSnapshot: getSessionSnapshot,
    getCurrentUser: fetchCurrentUser,
    normalizeRole,
    normalizeNumericId,
  };
})();

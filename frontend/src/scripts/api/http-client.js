(function () {
  const DEFAULT_TIMEOUT_MS = 10000;
  const NETWORK_COOLDOWN_MS = 15000;

  const state = {
    baseUrl: "http://localhost:8080/api",
    getAuthToken: null,
    onUnauthorized: null,
    networkDownUntil: 0,
  };

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
      credentials: config.credentials || "include",
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
})();

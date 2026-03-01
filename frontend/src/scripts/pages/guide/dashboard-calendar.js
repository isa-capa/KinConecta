/* =========================================================
   Guia - Calendario
   API-first + base para Google Calendar.
   ========================================================= */

const GuideCalendarApp = (() => {
  const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
  const GOOGLE_IDENTITY_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
  const GOOGLE_SESSION_KEY = "kc_guide_google_calendar_session_v1";
  const GOOGLE_TOKEN_SKEW_MS = 45 * 1000;

  const state = {
    guideId: "guide_001", // TODO(AUTH): obtener desde JWT/sesion
    view: "month", // month | week | list
    cursorDate: new Date(),
    selectedDateISO: null,
    events: {},
    google: {
      clientId: "",
      calendarId: "primary",
      accessToken: "",
      expiresAt: 0,
      lastSyncAt: "",
      backendConnected: false,
      isConnecting: false,
      isSyncing: false,
      scriptPromise: null,
      tokenClient: null,
    },
  };

  const dom = {
    monthLabel: null,
    monthGrid: null,
    timeline: null,
    selectedDateLabel: null,
    selectedDateMeta: null,
    btnPrev: null,
    btnNext: null,
    btnSync: null,
    btnBlock: null,
    btnAddBlockTime: null,
    btnEditDay: null,
    viewButtons: [],
    googleModal: null,
    googleModalClose: null,
    googleModalBackdrop: null,
    googleSyncForm: null,
    googleCalendarId: null,
    googleConnectionStatus: null,
    googleLastSyncAt: null,
    googleFeedback: null,
    btnGoogleConnect: null,
    btnGoogleSync: null,
    btnGoogleDisconnect: null,
  };

  const pad2 = (n) => String(n).padStart(2, "0");
  const uid = () => Math.random().toString(36).slice(2, 10);
  const openUnderConstructionModal = () => {
    if (window.KCUnderConstruction?.open) {
      window.KCUnderConstruction.open();
      return;
    }
    window.alert("Aun estamos trabajando en esto.");
  };

  const loadingMarkup = (label, extraClass = "") => {
    const className = ["guide-loading", "guide-loading--compact", extraClass]
      .filter(Boolean)
      .join(" ");
    return `
      <div class="${className}" role="status" aria-live="polite" aria-busy="true">
        <span class="guide-loading__spinner" aria-hidden="true"></span>
        <span>${label}</span>
      </div>
    `;
  };

  const toISODate = (date) => {
    const y = date.getFullYear();
    const m = pad2(date.getMonth() + 1);
    const d = pad2(date.getDate());
    return `${y}-${m}-${d}`;
  };

  const parseISODate = (iso) => {
    const [y, m, d] = String(iso).split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const formatMonthLabel = (date) =>
    date.toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  const formatSelectedDate = (iso) => {
    const d = parseISODate(iso);
    return d.toLocaleDateString("es-MX", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTimeLabel = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const extractTime = (rawValue, fallback = "") => {
    if (!rawValue) return fallback;
    const raw = String(rawValue).trim();
    if (/^\d{2}:\d{2}$/.test(raw)) return raw;
    const dt = new Date(raw);
    if (!Number.isNaN(dt.getTime())) {
      return `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
    }
    return fallback;
  };

  const parseDateTimeSafe = (rawDate, fallbackTime) => {
    if (!rawDate) return null;
    const value = String(rawDate);
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(`${value}T${fallbackTime || "00:00:00"}`);
    }
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return null;
    return dt;
  };

  function renderCalendarLoading() {
    if (dom.monthGrid) {
      dom.monthGrid.innerHTML = loadingMarkup("Cargando calendario...", "guide-loading--grid-full");
    }
    if (dom.timeline) {
      dom.timeline.innerHTML = loadingMarkup("Cargando agenda...");
    }
    if (dom.selectedDateLabel) {
      dom.selectedDateLabel.textContent = "--";
    }
    if (dom.selectedDateMeta) {
      dom.selectedDateMeta.textContent = "Cargando...";
    }
  }

  function getMonthRangeISO(date) {
    const from = new Date(date.getFullYear(), date.getMonth(), 1);
    const to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      from: `${toISODate(from)}T00:00:00`,
      to: `${toISODate(to)}T23:59:59`,
    };
  }

  function startOfMonthGrid(date) {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const day = first.getDay(); // 0 dom ... 6 sab
    const start = new Date(first);
    start.setDate(first.getDate() - day);
    return start;
  }

  function mapApiEventsToState(rawEvents) {
    // TODO(BACKEND): confirmar contrato final de eventos (start/end/title/status)
    state.events = {};
    if (!Array.isArray(rawEvents)) return;

    rawEvents.forEach((event) => {
      const startIso = String(event.startDate || event.start || "").slice(0, 10);
      if (!startIso) return;
      const mapped = {
        id: event.id || uid(),
        source: event.source || "internal",
        type: event.type || (event.status === "blocked" ? "blocked" : "booked"),
        title: event.title || event.name || "Evento",
        start: event.startTime || extractTime(event.start, ""),
        end: event.endTime || extractTime(event.end, ""),
        organizer: event.organizerName || event.organizer || "",
      };
      if (!state.events[startIso]) state.events[startIso] = [];
      state.events[startIso].push(mapped);
    });
  }

  function seedFallbackEvents() {
    const current = state.cursorDate;
    const y = current.getFullYear();
    const m = current.getMonth();
    const toIso = (day) => toISODate(new Date(y, m, day));

    state.events = {
      [toIso(4)]: [
        {
          id: uid(),
          source: "internal",
          type: "booked",
          title: "Centro Historico",
          start: "10:00",
          end: "12:00",
          organizer: "Juan P.",
        },
      ],
      [toIso(8)]: [
        {
          id: uid(),
          source: "internal",
          type: "blocked",
          title: "Bloqueo personal",
          start: "14:00",
          end: "18:00",
        },
      ],
      [toIso(16)]: [
        {
          id: uid(),
          source: "internal",
          type: "booked",
          title: "Tour gastronomico",
          start: "09:30",
          end: "13:00",
          organizer: "Maria R.",
        },
      ],
    };
  }

  function removeGoogleOverlayFromState() {
    Object.keys(state.events).forEach((iso) => {
      const filtered = (state.events[iso] || []).filter((event) => event.source !== "google");
      if (filtered.length) {
        state.events[iso] = filtered;
      } else {
        delete state.events[iso];
      }
    });
  }

  function mapGoogleEventToUiEvent(item) {
    const startRaw = item?.start?.dateTime || item?.start?.date;
    if (!startRaw) return null;

    const isAllDay = Boolean(item?.start?.date && !item?.start?.dateTime);
    const startDate = parseDateTimeSafe(startRaw, "00:00:00");
    const endDate = parseDateTimeSafe(item?.end?.dateTime || item?.end?.date, "23:59:00");
    if (!startDate || Number.isNaN(startDate.getTime())) return null;

    const startIsoDate = toISODate(startDate);
    const fallbackEndDate = new Date(startDate);
    fallbackEndDate.setHours(23, 59, 0, 0);
    const normalizedEnd = endDate && !Number.isNaN(endDate.getTime()) ? endDate : fallbackEndDate;

    return {
      id: item.id ? `google_${item.id}` : `google_${uid()}`,
      externalId: item.id || "",
      source: "google",
      type: "blocked",
      title: item.summary || item.description || "Evento de Google Calendar",
      startDate: startIsoDate,
      start: isAllDay ? "Todo el dia" : `${pad2(startDate.getHours())}:${pad2(startDate.getMinutes())}`,
      end: isAllDay ? "Todo el dia" : `${pad2(normalizedEnd.getHours())}:${pad2(normalizedEnd.getMinutes())}`,
      organizer:
        item.organizer?.displayName || item.organizer?.email || item.creator?.email || "Google Calendar",
      isAllDay,
      startDateTime: startDate.toISOString(),
      endDateTime: normalizedEnd.toISOString(),
    };
  }

  function mergeGoogleEventsIntoState(rawGoogleEvents) {
    removeGoogleOverlayFromState();
    if (!Array.isArray(rawGoogleEvents)) return;

    rawGoogleEvents.forEach((item) => {
      const mapped = mapGoogleEventToUiEvent(item);
      if (!mapped?.startDate) return;
      if (!state.events[mapped.startDate]) state.events[mapped.startDate] = [];
      state.events[mapped.startDate].push(mapped);
    });
  }

  function serializeGoogleEventsForBackend(rawGoogleEvents) {
    if (!Array.isArray(rawGoogleEvents)) return [];
    return rawGoogleEvents
      .map((item) => mapGoogleEventToUiEvent(item))
      .filter(Boolean)
      .map((event) => ({
        externalId: event.externalId || event.id,
        source: "google-calendar",
        title: event.title,
        organizer: event.organizer,
        isAllDay: Boolean(event.isAllDay),
        startDate: event.startDate,
        startTime: event.start,
        endTime: event.end,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        status: "blocked",
      }));
  }

  function getGoogleSessionSnapshot() {
    return {
      calendarId: state.google.calendarId,
      accessToken: state.google.accessToken,
      expiresAt: state.google.expiresAt,
      lastSyncAt: state.google.lastSyncAt,
      backendConnected: state.google.backendConnected,
    };
  }

  function persistGoogleSession() {
    try {
      window.sessionStorage.setItem(GOOGLE_SESSION_KEY, JSON.stringify(getGoogleSessionSnapshot()));
    } catch (error) {
      console.warn("No fue posible guardar sesion de Google Calendar en sessionStorage.", error);
    }
  }

  function restoreGoogleSession() {
    try {
      const raw = window.sessionStorage.getItem(GOOGLE_SESSION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      if (typeof parsed.calendarId === "string" && parsed.calendarId.trim()) {
        state.google.calendarId = parsed.calendarId.trim();
      }
      if (typeof parsed.accessToken === "string") state.google.accessToken = parsed.accessToken;
      if (typeof parsed.expiresAt === "number") state.google.expiresAt = parsed.expiresAt;
      if (typeof parsed.lastSyncAt === "string") state.google.lastSyncAt = parsed.lastSyncAt;
      state.google.backendConnected = Boolean(parsed.backendConnected);
    } catch (error) {
      console.warn("Sesion de Google Calendar invalida. Se restablece estado local.", error);
    }
  }

  function clearGoogleSession() {
    state.google.accessToken = "";
    state.google.expiresAt = 0;
    state.google.backendConnected = false;
    state.google.lastSyncAt = "";
    removeGoogleOverlayFromState();
    try {
      window.sessionStorage.removeItem(GOOGLE_SESSION_KEY);
    } catch (_error) {
      // noop
    }
  }

  function hasValidGoogleToken() {
    if (!state.google.accessToken) return false;
    if (!state.google.expiresAt) return false;
    return state.google.expiresAt - Date.now() > GOOGLE_TOKEN_SKEW_MS;
  }

  function hasGoogleConnection() {
    return hasValidGoogleToken() || state.google.backendConnected;
  }

  function resolveGoogleClientId() {
    const fromRuntime = window.KC_GOOGLE_CALENDAR_CONFIG?.clientId || window.KC_GOOGLE_CLIENT_ID || "";
    const fromMeta = document
      .querySelector('meta[name="kc-google-client-id"]')
      ?.getAttribute("content");
    const fromButton = dom.btnSync?.dataset.googleClientId || "";
    return String(fromRuntime || fromMeta || fromButton || "").trim();
  }

  function resolveGuideId() {
    try {
      const raw = window.localStorage.getItem("kc_temp_auth_session_v1");
      if (!raw) return state.guideId;
      const parsed = JSON.parse(raw);
      const candidate =
        parsed?.guideId ||
        parsed?.user?.guideId ||
        parsed?.user?.id ||
        parsed?.id ||
        parsed?.profile?.guideId;
      return candidate ? String(candidate) : state.guideId;
    } catch (_error) {
      return state.guideId;
    }
  }

  function setGoogleFeedback(message, tone = "info") {
    if (!dom.googleFeedback) return;
    dom.googleFeedback.textContent = message || "";
    dom.googleFeedback.classList.remove("gcal-modal__feedback--error", "gcal-modal__feedback--success");
    if (tone === "error") dom.googleFeedback.classList.add("gcal-modal__feedback--error");
    if (tone === "success") dom.googleFeedback.classList.add("gcal-modal__feedback--success");
  }

  function setSyncButtonState() {
    if (!dom.btnSync) return;
    const textEl = dom.btnSync.querySelector(".btn__text");
    const isBusy = state.google.isConnecting || state.google.isSyncing;
    if (textEl) {
      if (state.google.isSyncing) {
        textEl.textContent = "Sincronizando...";
      } else if (state.google.isConnecting) {
        textEl.textContent = "Conectando...";
      } else if (hasGoogleConnection()) {
        textEl.textContent = "Sincronizar Google";
      } else {
        textEl.textContent = "Conectar calendario";
      }
    }
    dom.btnSync.disabled = isBusy;
    dom.btnSync.setAttribute("aria-busy", isBusy ? "true" : "false");
  }

  function updateGoogleModalState() {
    if (!dom.googleModal) return;
    const connected = hasGoogleConnection();
    const busy = state.google.isConnecting || state.google.isSyncing;

    if (dom.googleCalendarId && !dom.googleCalendarId.value) {
      dom.googleCalendarId.value = state.google.calendarId;
    }

    if (dom.googleConnectionStatus) {
      dom.googleConnectionStatus.value = connected ? "Conectado" : "No conectado";
    }

    if (dom.googleLastSyncAt) {
      dom.googleLastSyncAt.textContent = state.google.lastSyncAt
        ? `Ultima sincronizacion: ${formatDateTimeLabel(state.google.lastSyncAt)}`
        : "Ultima sincronizacion: aun no realizada";
    }

    if (dom.btnGoogleConnect) {
      dom.btnGoogleConnect.disabled = busy;
      dom.btnGoogleConnect.textContent = connected ? "Reconectar Google" : "Conectar con Google";
    }
    if (dom.btnGoogleSync) dom.btnGoogleSync.disabled = busy || !connected;
    if (dom.btnGoogleDisconnect) dom.btnGoogleDisconnect.disabled = busy || !connected;
    if (dom.googleCalendarId) dom.googleCalendarId.disabled = busy;
  }

  function openGoogleModal() {
    if (!dom.googleModal) return;
    dom.googleModal.hidden = false;
    dom.googleModal.setAttribute("aria-hidden", "false");
    dom.googleModal.classList.add("gcal-modal--open");
    document.body.classList.add("gcal-modal-open");
    updateGoogleModalState();
  }

  function closeGoogleModal() {
    if (!dom.googleModal) return;
    dom.googleModal.classList.remove("gcal-modal--open");
    dom.googleModal.hidden = true;
    dom.googleModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gcal-modal-open");
  }

  async function ensureGoogleIdentityScript() {
    if (window.google?.accounts?.oauth2) return;
    if (state.google.scriptPromise) {
      await state.google.scriptPromise;
      return;
    }

    state.google.scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-kc-google-gsi="true"]');
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", () => reject(new Error("No se pudo cargar Google Identity.")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = GOOGLE_IDENTITY_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.kcGoogleGsi = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("No se pudo cargar Google Identity."));
      document.head.appendChild(script);
    });

    await state.google.scriptPromise;
  }

  async function ensureGoogleTokenClient() {
    if (!state.google.clientId) {
      state.google.clientId = resolveGoogleClientId();
    }

    if (!state.google.clientId) {
      throw new Error(
        "Falta configurar Google Client ID (window.KC_GOOGLE_CALENDAR_CONFIG.clientId o data-google-client-id).",
      );
    }

    await ensureGoogleIdentityScript();
    if (state.google.tokenClient) return state.google.tokenClient;

    if (!window.google?.accounts?.oauth2?.initTokenClient) {
      throw new Error("Google Identity no inicializo correctamente.");
    }

    state.google.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: state.google.clientId,
      scope: GOOGLE_CALENDAR_SCOPE,
      callback: () => {},
      error_callback: () => {},
    });

    return state.google.tokenClient;
  }

  async function requestGoogleAccessToken(forceConsent = false) {
    const tokenClient = await ensureGoogleTokenClient();

    return new Promise((resolve, reject) => {
      tokenClient.callback = (response) => {
        if (!response || !response.access_token) {
          reject(new Error("Google no devolvio access token."));
          return;
        }
        resolve(response);
      };

      tokenClient.error_callback = (error) => {
        const detail = error?.type || error?.message || "OAuth error";
        reject(new Error(`No fue posible autenticar con Google: ${detail}`));
      };

      tokenClient.requestAccessToken({
        prompt: forceConsent || !state.google.accessToken ? "consent" : "",
      });
    });
  }

  async function connectGoogleCalendar(forceConsent = false) {
    if (state.google.isConnecting) return hasGoogleConnection();

    state.google.isConnecting = true;
    setSyncButtonState();
    updateGoogleModalState();
    setGoogleFeedback("Conectando con Google...", "info");

    try {
      const tokenResponse = await requestGoogleAccessToken(forceConsent || !hasValidGoogleToken());
      const expiresInSec = Number(tokenResponse.expires_in || 3600);
      state.google.accessToken = tokenResponse.access_token;
      state.google.expiresAt = Date.now() + expiresInSec * 1000;
      state.google.backendConnected = true;
      persistGoogleSession();
      setGoogleFeedback("Cuenta de Google conectada correctamente.", "success");
      return true;
    } catch (error) {
      console.warn("Google OAuth failed:", error);
      setGoogleFeedback(error?.message || "No fue posible conectar con Google.", "error");
      return false;
    } finally {
      state.google.isConnecting = false;
      setSyncButtonState();
      updateGoogleModalState();
    }
  }

  async function disconnectGoogleCalendar() {
    const currentToken = state.google.accessToken;
    clearGoogleSession();

    try {
      if (currentToken && window.google?.accounts?.oauth2?.revoke) {
        await new Promise((resolve) => window.google.accounts.oauth2.revoke(currentToken, resolve));
      }
    } catch (error) {
      console.warn("No fue posible revocar token de Google localmente.", error);
    }

    try {
      if (window.KCGuideApi?.calendar?.disconnectGoogle) {
        await window.KCGuideApi.calendar.disconnectGoogle(state.guideId);
      }
    } catch (error) {
      console.warn("Google disconnect endpoint pendiente de backend:", error);
    }

    renderMonth();
    renderDetails();
    setGoogleFeedback("Conexion con Google eliminada.", "info");
    setSyncButtonState();
    updateGoogleModalState();
  }

  async function fetchGoogleEventsByRange(range) {
    if (!hasValidGoogleToken()) {
      const connected = await connectGoogleCalendar(false);
      if (!connected) throw new Error("No se pudo obtener acceso a Google Calendar.");
    }

    const calendarId = encodeURIComponent(state.google.calendarId || "primary");
    const timeMin = new Date(range.from).toISOString();
    const timeMax = new Date(range.to).toISOString();
    const query = new URLSearchParams({
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "2500",
      timeMin,
      timeMax,
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${state.google.accessToken}`,
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        state.google.accessToken = "";
        state.google.expiresAt = 0;
        persistGoogleSession();
      }
      const detail = await response.text();
      throw new Error(`Google Calendar API error ${response.status}: ${detail || "sin detalle"}`);
    }

    const data = await response.json();
    return Array.isArray(data?.items) ? data.items : [];
  }

  async function refreshGoogleStatusFromBackend() {
    if (!window.KCGuideApi?.calendar?.getGoogleStatus) return;
    try {
      const response = await window.KCGuideApi.calendar.getGoogleStatus(state.guideId);
      const payload = response?.data || {};
      const connected = Boolean(
        payload.connected || payload.isConnected || String(payload.status || "").toLowerCase() === "connected",
      );
      state.google.backendConnected = connected || state.google.backendConnected;

      if (typeof payload.calendarId === "string" && payload.calendarId.trim()) {
        state.google.calendarId = payload.calendarId.trim();
      }
      if (typeof payload.lastSyncAt === "string" && payload.lastSyncAt) {
        state.google.lastSyncAt = payload.lastSyncAt;
      }
      persistGoogleSession();
    } catch (error) {
      console.warn("Google status endpoint pendiente de backend:", error);
    }
  }

  async function applyGoogleOverlayToCurrentMonth() {
    if (!hasValidGoogleToken()) return;
    try {
      const range = getMonthRangeISO(state.cursorDate);
      const googleEvents = await fetchGoogleEventsByRange(range);
      mergeGoogleEventsIntoState(googleEvents);
    } catch (error) {
      console.warn("No se pudo aplicar overlay de Google Calendar:", error);
    }
  }

  async function hydrateMonthFromApi(options = {}) {
    const { includeGoogleOverlay = true } = options;

    if (!window.KCGuideApi) {
      seedFallbackEvents();
      if (includeGoogleOverlay) await applyGoogleOverlayToCurrentMonth();
      return;
    }

    try {
      const range = getMonthRangeISO(state.cursorDate);
      const response = await window.KCGuideApi.calendar.getEventsByRange(state.guideId, {
        from: range.from,
        to: range.to,
        view: state.view,
      });
      const apiEvents = response?.data?.items || response?.data || [];
      mapApiEventsToState(apiEvents);
      if (includeGoogleOverlay) await applyGoogleOverlayToCurrentMonth();
    } catch (error) {
      console.warn("Calendar API fallback enabled:", error);
      seedFallbackEvents();
      if (includeGoogleOverlay) await applyGoogleOverlayToCurrentMonth();
    }
  }

  function shorten(text, max) {
    const safe = String(text || "");
    return safe.length <= max ? safe : `${safe.slice(0, max - 1)}...`;
  }

  function renderMonth() {
    if (!dom.monthGrid || !dom.monthLabel) return;
    dom.monthLabel.textContent = formatMonthLabel(state.cursorDate);
    dom.monthGrid.innerHTML = "";

    const start = startOfMonthGrid(state.cursorDate);
    const cursorMonth = state.cursorDate.getMonth();
    const todayISO = toISODate(new Date());
    const totalCells = 42; // robusto para cualquier mes

    for (let i = 0; i < totalCells; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const iso = toISODate(d);
      const isOutside = d.getMonth() !== cursorMonth;
      const events = state.events[iso] || [];

      const cell = document.createElement("div");
      cell.className = "calendar-cell";
      cell.dataset.date = iso;
      cell.setAttribute("role", "button");
      cell.setAttribute("tabindex", isOutside ? "-1" : "0");
      if (isOutside) cell.classList.add("calendar-cell--outside");
      if (state.selectedDateISO === iso) cell.classList.add("calendar-cell--selected");

      const dayEl = document.createElement("span");
      dayEl.className = "calendar-cell__day";
      dayEl.textContent = String(d.getDate());
      if (iso === todayISO && !isOutside) dayEl.classList.add("calendar-cell__day--today");
      cell.appendChild(dayEl);

      if (events.length) {
        const chips = document.createElement("div");
        chips.className = "calendar-cell__chips";
        events.slice(0, 2).forEach((event) => {
          const chip = document.createElement("div");
          chip.className = `chip ${event.type === "booked" ? "chip--booked" : "chip--blocked"}`;
          chip.textContent =
            event.type === "booked"
              ? `${event.start || "--:--"} - ${shorten(event.title, 18)}`
              : shorten(event.title, 18);
          chips.appendChild(chip);
        });
        if (events.length > 2) {
          const more = document.createElement("div");
          more.className = "chip";
          more.textContent = `+${events.length - 2} mas`;
          chips.appendChild(more);
        }
        cell.appendChild(chips);
      }

      if (!isOutside) {
        cell.addEventListener("click", () => selectDate(iso));
        cell.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectDate(iso);
          }
        });
      }

      dom.monthGrid.appendChild(cell);
    }
  }

  function renderDetails() {
    const iso = state.selectedDateISO;
    if (!iso) {
      dom.selectedDateLabel.textContent = "--";
      dom.selectedDateMeta.textContent = "Selecciona un dia";
      dom.timeline.innerHTML = '<div class="timeline__empty">No hay fecha seleccionada</div>';
      return;
    }

    dom.selectedDateLabel.textContent = formatSelectedDate(iso);

    const events = (state.events[iso] || []).slice().sort((a, b) => (a.start || "").localeCompare(b.start || ""));
    const bookedCount = events.filter((event) => event.type === "booked").length;
    dom.selectedDateMeta.textContent = events.length
      ? `${bookedCount} tours confirmados - ${events.length - bookedCount} bloqueos`
      : "Sin reservas";

    if (!events.length) {
      dom.timeline.innerHTML = '<div class="timeline__empty">Sin reservas</div>';
      return;
    }

    dom.timeline.innerHTML = "";
    events.forEach((event) => {
      const item = document.createElement("div");
      item.className = "timeline__item";

      const dot = document.createElement("div");
      dot.className = `timeline__dot ${
        event.type === "booked" ? "timeline__dot--booked" : "timeline__dot--blocked"
      }`;

      const content = document.createElement("div");
      const time = document.createElement("div");
      time.className = "timeline__time";
      time.textContent =
        event.type === "booked"
          ? `${event.start || "--:--"} - ${event.end || "--:--"}`
          : `Bloqueado - ${event.start || "--:--"} - ${event.end || "--:--"}`;

      const card = document.createElement("div");
      card.className = "timeline__card";

      const title = document.createElement("p");
      title.className = "timeline__title";
      title.textContent = event.title;

      const row = document.createElement("div");
      row.className = "timeline__row";

      const sub = document.createElement("span");
      sub.className = "timeline__sub";
      sub.textContent = event.organizer
        ? `${event.organizer} (organizador)`
        : event.type === "booked"
          ? "Recorrido"
          : "No disponible";

      const actionBtn = document.createElement("button");
      actionBtn.className = "timeline__link";
      actionBtn.type = "button";
      actionBtn.textContent = event.type === "blocked" ? "Eliminar" : "Detalles";
      actionBtn.addEventListener("click", () => {
        if (event.type === "blocked" && event.source !== "google") {
          removeBlockedEvent(event.id);
          return;
        }
        if (event.type === "blocked" && event.source === "google") {
          openUnderConstructionModal();
          return;
        }
        openUnderConstructionModal();
      });

      row.appendChild(sub);
      row.appendChild(actionBtn);
      card.appendChild(title);
      card.appendChild(row);
      content.appendChild(time);
      content.appendChild(card);
      item.appendChild(dot);
      item.appendChild(content);
      dom.timeline.appendChild(item);
    });
  }

  function selectDate(iso) {
    state.selectedDateISO = iso;
    dom.monthGrid
      ?.querySelectorAll(".calendar-cell--selected")
      .forEach((element) => element.classList.remove("calendar-cell--selected"));
    const selectedElement = dom.monthGrid?.querySelector(`[data-date="${iso}"]`);
    if (selectedElement) selectedElement.classList.add("calendar-cell--selected");
    renderDetails();
  }

  async function changeMonth(delta) {
    const nextDate = new Date(state.cursorDate);
    nextDate.setMonth(nextDate.getMonth() + delta);
    state.cursorDate = nextDate;
    renderCalendarLoading();
    await hydrateMonthFromApi();
    renderMonth();
    renderDetails();
  }

  function setView(view) {
    state.view = view;
    dom.viewButtons.forEach((button) => {
      const isActive = button.dataset.view === view;
      button.classList.toggle("view-toggle__btn--active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    if (view !== "month") {
      openUnderConstructionModal();
      state.view = "month";
      dom.viewButtons.forEach((button) => {
        const isActive = button.dataset.view === "month";
        button.classList.toggle("view-toggle__btn--active", isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }
  }

  async function removeBlockedEvent(blockId) {
    if (!state.selectedDateISO) return;

    try {
      if (window.KCGuideApi) {
        // TODO(BACKEND): endpoint definitivo para remove block
        await window.KCGuideApi.calendar.removeBlock(state.guideId, blockId);
      }
    } catch (error) {
      console.warn("Remove block pending backend implementation:", error);
    }

    state.events[state.selectedDateISO] = (state.events[state.selectedDateISO] || []).filter(
      (item) => item.id !== blockId,
    );

    renderMonth();
    renderDetails();
  }

  async function addBlockToSelectedDay() {
    openUnderConstructionModal();
  }

  async function syncGoogleCalendar() {
    if (state.google.isSyncing) return;

    state.google.calendarId = (dom.googleCalendarId?.value || state.google.calendarId || "primary").trim();
    if (!state.google.calendarId) state.google.calendarId = "primary";

    state.google.isSyncing = true;
    setSyncButtonState();
    updateGoogleModalState();
    setGoogleFeedback("Sincronizando calendario...", "info");

    const range = getMonthRangeISO(state.cursorDate);
    let googleEvents = [];
    let usedFrontendToken = false;

    try {
      if (hasValidGoogleToken()) {
        usedFrontendToken = true;
        googleEvents = await fetchGoogleEventsByRange(range);
      } else if (state.google.backendConnected) {
        usedFrontendToken = false;
      } else {
        const connected = await connectGoogleCalendar(false);
        if (!connected) throw new Error("No se pudo conectar con Google.");
        usedFrontendToken = true;
        googleEvents = await fetchGoogleEventsByRange(range);
      }

      if (usedFrontendToken) {
        mergeGoogleEventsIntoState(googleEvents);
        renderMonth();
        renderDetails();
      }

      try {
        if (window.KCGuideApi?.calendar?.syncGoogle) {
          await window.KCGuideApi.calendar.syncGoogle(state.guideId, {
            source: "google-calendar",
            calendarId: state.google.calendarId,
            from: range.from,
            to: range.to,
            mode: usedFrontendToken ? "frontend-preview" : "backend-sync",
            syncedAt: new Date().toISOString(),
            events: usedFrontendToken ? serializeGoogleEventsForBackend(googleEvents) : undefined,
            // TODO(BACKEND): migrar a OAuth code-flow con refresh token persistente por guia.
          });
        }
      } catch (error) {
        console.warn("Google sync endpoint pending backend implementation:", error);
      }

      if (!usedFrontendToken) {
        await hydrateMonthFromApi();
        renderMonth();
        renderDetails();
      }

      state.google.lastSyncAt = new Date().toISOString();
      state.google.backendConnected = true;
      persistGoogleSession();
      setGoogleFeedback("Sincronizacion completada.", "success");
      updateGoogleModalState();
    } catch (error) {
      console.warn("Google calendar sync failed:", error);
      setGoogleFeedback(error?.message || "No se pudo completar la sincronizacion.", "error");
    } finally {
      state.google.isSyncing = false;
      setSyncButtonState();
      updateGoogleModalState();
    }
  }

  function bindGoogleModal() {
    dom.googleModal = document.getElementById("googleSyncModal");
    dom.googleModalClose = document.getElementById("btnGoogleModalClose");
    dom.googleModalBackdrop = dom.googleModal?.querySelector("[data-google-close]") || null;
    dom.googleSyncForm = document.getElementById("googleSyncForm");
    dom.googleCalendarId = document.getElementById("googleCalendarId");
    dom.googleConnectionStatus = document.getElementById("googleConnectionStatus");
    dom.googleLastSyncAt = document.getElementById("googleLastSyncAt");
    dom.googleFeedback = document.getElementById("googleSyncFeedback");
    dom.btnGoogleConnect = document.getElementById("btnGoogleConnect");
    dom.btnGoogleSync = document.getElementById("btnGoogleRunSync");
    dom.btnGoogleDisconnect = document.getElementById("btnGoogleDisconnect");

    if (!dom.googleModal) return;

    dom.googleModalClose?.addEventListener("click", closeGoogleModal);
    dom.googleModalBackdrop?.addEventListener("click", closeGoogleModal);

    dom.googleSyncForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      openUnderConstructionModal();
    });

    dom.btnGoogleConnect?.addEventListener("click", async () => {
      openUnderConstructionModal();
    });

    dom.btnGoogleSync?.addEventListener("click", () => {
      openUnderConstructionModal();
    });
    dom.btnGoogleDisconnect?.addEventListener("click", () => {
      openUnderConstructionModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dom.googleModal && !dom.googleModal.hidden) {
        closeGoogleModal();
      }
    });
  }

  function bind() {
    dom.monthLabel = document.getElementById("monthLabel");
    dom.monthGrid = document.getElementById("monthGrid");
    dom.timeline = document.getElementById("timeline");
    dom.selectedDateLabel = document.getElementById("selectedDateLabel");
    dom.selectedDateMeta = document.getElementById("selectedDateMeta");
    dom.btnPrev = document.getElementById("btnPrev");
    dom.btnNext = document.getElementById("btnNext");
    dom.btnSync = document.getElementById("btnSync");
    dom.btnBlock = document.getElementById("btnBlock");
    dom.btnAddBlockTime = document.getElementById("btnAddBlockTime");
    dom.btnEditDay = document.getElementById("btnEditDay");
    dom.viewButtons = [...document.querySelectorAll(".view-toggle__btn")];

    bindGoogleModal();

    dom.btnPrev?.addEventListener("click", () => {
      changeMonth(-1);
    });
    dom.btnNext?.addEventListener("click", () => {
      changeMonth(1);
    });
    dom.viewButtons.forEach((button) =>
      button.addEventListener("click", () => setView(button.dataset.view)),
    );
    dom.btnBlock?.addEventListener("click", addBlockToSelectedDay);
    dom.btnAddBlockTime?.addEventListener("click", addBlockToSelectedDay);
    dom.btnSync?.addEventListener("click", () => {
      openGoogleModal();
      if (hasGoogleConnection()) {
        setGoogleFeedback("Cuenta conectada. Puedes sincronizar cuando quieras.", "info");
      } else {
        setGoogleFeedback("Conecta tu cuenta de Google para iniciar la sincronizacion.", "info");
      }
      updateGoogleModalState();
    });
    dom.btnEditDay?.addEventListener("click", () => {
      openUnderConstructionModal();
    });
  }

  async function init() {
    state.guideId = resolveGuideId();
    restoreGoogleSession();
    bind();

    state.google.clientId = resolveGoogleClientId();
    if (dom.googleCalendarId) dom.googleCalendarId.value = state.google.calendarId;
    setSyncButtonState();
    updateGoogleModalState();

    await refreshGoogleStatusFromBackend();
    setSyncButtonState();
    updateGoogleModalState();

    renderCalendarLoading();
    await hydrateMonthFromApi();
    renderMonth();
    renderDetails();

    const today = toISODate(new Date());
    state.selectedDateISO = today;
    selectDate(today);
  }

  return { init };
})();

const bootstrapGuideCalendar = () => {
  const run = () => GuideCalendarApp.init();
  const sidebarReady = window.__guideSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapGuideCalendar, { once: true });
} else {
  bootstrapGuideCalendar();
}

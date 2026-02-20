/* =========================================================
   Guía - Calendario
   API-first + base para Google Calendar.
   ========================================================= */

const GuideCalendarApp = (() => {
  const state = {
    guideId: "guide_001", // TODO(AUTH): obtener desde JWT/sesión
    view: "month", // month | week | list
    cursorDate: new Date(),
    selectedDateISO: null,
    events: {},
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
  };

  const pad2 = (n) => String(n).padStart(2, "0");
  const uid = () => Math.random().toString(36).slice(2, 10);

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
        type: event.type || (event.status === "blocked" ? "blocked" : "booked"),
        title: event.title || event.name || "Evento",
        start: event.startTime || String(event.start || "").slice(11, 16) || "",
        end: event.endTime || String(event.end || "").slice(11, 16) || "",
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
          type: "blocked",
          title: "Bloqueo personal",
          start: "14:00",
          end: "18:00",
        },
      ],
      [toIso(16)]: [
        {
          id: uid(),
          type: "booked",
          title: "Tour gastronomico",
          start: "09:30",
          end: "13:00",
          organizer: "Maria R.",
        },
      ],
    };
  }

  async function hydrateMonthFromApi() {
    if (!window.KCGuideApi) {
      seedFallbackEvents();
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
    } catch (error) {
      console.warn("Calendar API fallback enabled:", error);
      seedFallbackEvents();
    }
  }

  function shorten(text, max) {
    return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
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
              ? `${event.start} - ${shorten(event.title, 18)}`
              : shorten(event.title, 18);
          chips.appendChild(chip);
        });
        if (events.length > 2) {
          const more = document.createElement("div");
          more.className = "chip";
          more.textContent = `+${events.length - 2} más`;
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
      dom.selectedDateLabel.textContent = "—";
      dom.selectedDateMeta.textContent = "Selecciona un día";
      dom.timeline.innerHTML = '<div class="timeline__empty">No hay fecha seleccionada</div>';
      return;
    }

    dom.selectedDateLabel.textContent = formatSelectedDate(iso);

    const events = (state.events[iso] || []).slice().sort((a, b) => a.start.localeCompare(b.start));
    const bookedCount = events.filter((event) => event.type === "booked").length;
    dom.selectedDateMeta.textContent = events.length
      ? `${bookedCount} tours confirmados • ${events.length - bookedCount} bloqueos`
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
          ? `${event.start} - ${event.end}`
          : `Bloqueado • ${event.start} - ${event.end}`;

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
        if (event.type === "blocked") {
          removeBlockedEvent(event.id);
          return;
        }
        // TODO(BACKEND): abrir detalle de reserva/evento en página/modal
        console.info("TODO: open calendar event details", event.id);
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
      // TODO(UI): implementar vistas week/list con consultas paginadas al backend.
      window.alert(`Vista "${view}" aún no implementada. Por ahora mostramos "mes".`);
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
    if (!state.selectedDateISO) {
      window.alert("Selecciona un día para bloquear.");
      return;
    }

    const title = window.prompt("Nombre del bloqueo:", "Bloqueo personal");
    if (!title) return;

    const start = window.prompt("Hora inicio (HH:MM):", "10:00") || "10:00";
    const end = window.prompt("Hora fin (HH:MM):", "18:00") || "18:00";

    const payload = {
      date: state.selectedDateISO,
      title,
      startTime: start,
      endTime: end,
    };

    try {
      if (window.KCGuideApi) {
        // TODO(BACKEND): validar contrato createBlock y manejo de errores de solapamiento.
        await window.KCGuideApi.calendar.createBlock(state.guideId, payload);
      }
    } catch (error) {
      console.warn("Create block pending backend implementation:", error);
    }

    const event = { id: uid(), type: "blocked", title, start, end };
    if (!state.events[state.selectedDateISO]) state.events[state.selectedDateISO] = [];
    state.events[state.selectedDateISO].push(event);

    renderMonth();
    selectDate(state.selectedDateISO);
  }

  async function syncGoogleCalendar() {
    // TODO(GOOGLE): implementar OAuth 2.0 con backend (Spring Boot) para no exponer secretos.
    // TODO(GOOGLE): guardar refresh token en backend y sincronizar por guía.
    // TODO(GOOGLE): mapear eventos de Google Calendar al dominio interno de reservas/bloqueos.
    try {
      if (window.KCGuideApi) {
        await window.KCGuideApi.calendar.syncGoogle(state.guideId, {
          source: "google-calendar",
          month: state.cursorDate.getMonth() + 1,
          year: state.cursorDate.getFullYear(),
        });
      }
    } catch (error) {
      console.warn("Google sync endpoint pending backend implementation:", error);
    }

    window.alert("Integración con Google Calendar en preparación. Revisa los TODO en JS.");
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
    dom.btnSync?.addEventListener("click", syncGoogleCalendar);
    dom.btnEditDay?.addEventListener("click", () => {
      // TODO(BACKEND): abrir modal de edición diaria (cupo, franjas, bloqueos)
      window.alert("Editor diario en preparación.");
    });
  }

  async function init() {
    bind();
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

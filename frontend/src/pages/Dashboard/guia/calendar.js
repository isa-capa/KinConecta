/* =========================
   Kin Conecta Calendar App
   Base UI + arquitectura para futura integración Google Calendar
   ========================= */

/** @typedef {"booked"|"blocked"} EventType */
/** @typedef {{ id:string, type:EventType, title:string, start:string, end:string, organizer?:string }} CalendarEvent */
/** @typedef {{ [isoDate:string]: CalendarEvent[] }} EventMap */

const App = (() => {
  // --------- State (pensado para escalar) ----------
  const state = {
    view: "month", // month | week | list
    cursorDate: new Date(2023, 9, 1), // Oct 2023 (0=Jan). Puedes cambiar a new Date() para "hoy".
    selectedDateISO: null, // "YYYY-MM-DD"
    events: /** @type {EventMap} */ ({}),
    theme: "light",
  };

  // --------- DOM ----------
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
    btnTheme: null,

    viewButtons: [],
    sidebar: null,
    btnSidebar: null,
    backdrop: null,
  };

  // --------- Utils ----------
  const pad2 = (n) => String(n).padStart(2, "0");

  const toISODate = (date) => {
    const y = date.getFullYear();
    const m = pad2(date.getMonth() + 1);
    const d = pad2(date.getDate());
    return `${y}-${m}-${d}`;
  };

  const parseISODate = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const startOfMonthGrid = (date) => {
    // Devuelve el domingo anterior (o el mismo domingo) al 1er día del mes
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const day = first.getDay(); // 0 dom ... 6 sab
    const start = new Date(first);
    start.setDate(first.getDate() - day);
    return start;
  };

  const formatMonthLabel = (date) => {
    // Mantengo English como tu UI original. Cambiable a 'es-MX' si quieres.
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const formatSelectedDate = (iso) => {
    const d = parseISODate(iso);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const uid = () => Math.random().toString(36).slice(2, 10);

  // --------- Seed events (lo que estaba “hardcodeado” en tu HTML) ----------
  const seedDemoEvents = () => {
    // Octubre 2023 demo
    state.events["2023-10-02"] = [
      {
        id: uid(),
        type: "blocked",
        title: "Blocked",
        start: "10:00",
        end: "18:00",
      },
    ];

    state.events["2023-10-04"] = [
      {
        id: uid(),
        type: "booked",
        title: "Historic Center Walk",
        start: "10:00",
        end: "12:30",
        organizer: "Juan P.",
      },
      {
        id: uid(),
        type: "booked",
        title: "Street Food & Salsa",
        start: "15:00",
        end: "18:00",
        organizer: "Sarah M.",
      },
    ];

    state.events["2023-10-05"] = [
      {
        id: uid(),
        type: "booked",
        title: "Sunrise",
        start: "09:00",
        end: "10:30",
      },
    ];

    state.events["2023-10-07"] = [
      {
        id: uid(),
        type: "blocked",
        title: "Maintenance",
        start: "08:00",
        end: "20:00",
      },
    ];

    state.events["2023-10-10"] = [
      {
        id: uid(),
        type: "booked",
        title: "Market Tour",
        start: "11:00",
        end: "13:00",
      },
    ];

    state.events["2023-10-12"] = [
      {
        id: uid(),
        type: "blocked",
        title: "Personal Day",
        start: "00:00",
        end: "23:59",
      },
    ];

    state.events["2023-10-14"] = [
      {
        id: uid(),
        type: "booked",
        title: "Architecture",
        start: "14:00",
        end: "16:00",
      },
    ];

    state.events["2023-10-18"] = [
      {
        id: uid(),
        type: "booked",
        title: "Full Day",
        start: "09:30",
        end: "18:00",
      },
    ];

    state.events["2023-10-20"] = [
      {
        id: uid(),
        type: "booked",
        title: "Night Walk",
        start: "17:00",
        end: "19:00",
      },
    ];

    state.events["2023-10-22"] = [
      {
        id: uid(),
        type: "blocked",
        title: "Blocked",
        start: "10:00",
        end: "18:00",
      },
    ];

    state.events["2023-10-27"] = [
      {
        id: uid(),
        type: "booked",
        title: "Museums",
        start: "12:00",
        end: "14:00",
      },
    ];
  };

  // --------- Render: Calendar (Month) ----------
  const renderMonth = () => {
    dom.monthLabel.textContent = formatMonthLabel(state.cursorDate);

    // Limpia grid
    dom.monthGrid.innerHTML = "";

    const start = startOfMonthGrid(state.cursorDate);
    const cursorMonth = state.cursorDate.getMonth();
    const todayISO = toISODate(new Date());

    // 5 semanas como tu diseño original (35 celdas).
    // Si quieres robustez total, podemos renderizar 6 semanas (42) según el mes.
    const totalCells = 35;

    for (let i = 0; i < totalCells; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const iso = toISODate(d);
      const isOutside = d.getMonth() !== cursorMonth;

      const cell = document.createElement("div");
      cell.className = "calendar-cell";
      cell.setAttribute("role", "button");
      cell.setAttribute("tabindex", isOutside ? "-1" : "0");
      cell.dataset.date = iso;

      if (isOutside) cell.classList.add("calendar-cell--outside");
      if (state.selectedDateISO === iso)
        cell.classList.add("calendar-cell--selected");

      const dayEl = document.createElement("span");
      dayEl.className = "calendar-cell__day";
      dayEl.textContent = String(d.getDate());

      if (iso === todayISO && !isOutside) {
        dayEl.classList.add("calendar-cell__day--today");
      }

      cell.appendChild(dayEl);

      // Chips
      const events = state.events[iso] || [];
      if (events.length) {
        const chips = document.createElement("div");
        chips.className = "calendar-cell__chips";

        // En month view, mostramos hasta 2 para no saturar
        events.slice(0, 2).forEach((ev) => {
          const chip = document.createElement("div");
          chip.className =
            "chip " + (ev.type === "booked" ? "chip--booked" : "chip--blocked");
          chip.textContent =
            ev.type === "booked"
              ? `${ev.start} - ${shorten(ev.title, 18)}`
              : shorten(ev.title, 18);
          chips.appendChild(chip);
        });

        // Indicador si hay más
        if (events.length > 2) {
          const chip = document.createElement("div");
          chip.className = "chip";
          chip.textContent = `+${events.length - 2} more`;
          chips.appendChild(chip);
        }

        cell.appendChild(chips);
      }

      // Click/keyboard solo si no es outside
      if (!isOutside) {
        cell.addEventListener("click", () => selectDate(iso));
        cell.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectDate(iso);
          }
        });
      }

      dom.monthGrid.appendChild(cell);
    }
  };

  const shorten = (s, max) => (s.length <= max ? s : s.slice(0, max - 1) + "…");

  // --------- Render: Details panel ----------
  const renderDetails = () => {
    const iso = state.selectedDateISO;
    if (!iso) {
      dom.selectedDateLabel.textContent = "—";
      dom.selectedDateMeta.textContent = "Selecciona un día";
      dom.timeline.innerHTML = `<div class="timeline__empty">No date selected</div>`;
      return;
    }

    dom.selectedDateLabel.textContent = formatSelectedDate(iso);

    const events = (state.events[iso] || [])
      .slice()
      .sort((a, b) => a.start.localeCompare(b.start));
    const bookedCount = events.filter((e) => e.type === "booked").length;

    dom.selectedDateMeta.textContent = events.length
      ? `${bookedCount} Confirmed Tours • ${events.length - bookedCount} Blocked`
      : "No bookings";

    if (!events.length) {
      dom.timeline.innerHTML = `<div class="timeline__empty">No bookings</div>`;
      return;
    }

    dom.timeline.innerHTML = "";
    events.forEach((ev) => {
      const item = document.createElement("div");
      item.className = "timeline__item";

      const dot = document.createElement("div");
      dot.className =
        "timeline__dot " +
        (ev.type === "booked"
          ? "timeline__dot--booked"
          : "timeline__dot--blocked");

      const content = document.createElement("div");

      const time = document.createElement("div");
      time.className = "timeline__time";
      time.textContent =
        ev.type === "booked"
          ? `${ev.start} - ${ev.end}`
          : `Blocked • ${ev.start} - ${ev.end}`;

      const card = document.createElement("div");
      card.className = "timeline__card";

      const title = document.createElement("p");
      title.className = "timeline__title";
      title.textContent = ev.title;

      const row = document.createElement("div");
      row.className = "timeline__row";

      const sub = document.createElement("span");
      sub.className = "timeline__sub";
      sub.textContent = ev.organizer
        ? `${ev.organizer} (Organizer)`
        : ev.type === "booked"
          ? "Tour"
          : "Unavailable";

      const link = document.createElement("button");
      link.className = "timeline__link";
      link.type = "button";
      link.textContent = "Details";
      link.addEventListener("click", () => {
        // Placeholder: aquí luego abrirías un modal o navegarías a /booking/:id
        alert(`Event: ${ev.title}\n${iso}\n${ev.start}-${ev.end}`);
      });

      row.appendChild(sub);
      row.appendChild(link);

      card.appendChild(title);
      card.appendChild(row);

      content.appendChild(time);
      content.appendChild(card);

      item.appendChild(dot);
      item.appendChild(content);

      dom.timeline.appendChild(item);
    });
  };

  // --------- Actions ----------
  const selectDate = (iso) => {
    state.selectedDateISO = iso;
    // Update selection highlight
    [...dom.monthGrid.querySelectorAll(".calendar-cell--selected")].forEach(
      (el) => el.classList.remove("calendar-cell--selected"),
    );
    const el = dom.monthGrid.querySelector(`[data-date="${iso}"]`);
    if (el) el.classList.add("calendar-cell--selected");

    renderDetails();
  };

  const changeMonth = (delta) => {
    const d = new Date(state.cursorDate);
    d.setMonth(d.getMonth() + delta);
    state.cursorDate = d;

    // Si el selectedDate quedó fuera del mes, lo limpiamos (opcional)
    // state.selectedDateISO = null;

    renderMonth();
    renderDetails();
  };

  const setView = (view) => {
    state.view = view;
    dom.viewButtons.forEach((btn) => {
      const isActive = btn.dataset.view === view;
      btn.classList.toggle("view-toggle__btn--active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    // Placeholder: en el futuro aquí montarías week/list.
    if (view !== "month") {
      alert(`Vista "${view}" aún no implementada. (Placeholder)`);
      // Regresa a month por ahora para no dejar UI “rota”
      state.view = "month";
      dom.viewButtons.forEach((btn) => {
        const isActive = btn.dataset.view === "month";
        btn.classList.toggle("view-toggle__btn--active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.classList.contains("theme--dark");
    html.classList.toggle("theme--dark", !isDark);
    html.classList.toggle("theme--light", isDark);
    state.theme = !isDark ? "dark" : "light";
  };

  const openSidebar = () => {
    dom.sidebar.classList.add("sidebar--open");
    dom.backdrop.hidden = false;
    dom.btnSidebar.setAttribute("aria-expanded", "true");
  };

  const closeSidebar = () => {
    dom.sidebar.classList.remove("sidebar--open");
    dom.backdrop.hidden = true;
    dom.btnSidebar.setAttribute("aria-expanded", "false");
  };

  const addBlockToSelectedDay = () => {
    if (!state.selectedDateISO) {
      alert("Selecciona un día para bloquear.");
      return;
    }

    const title = prompt(
      "Nombre del bloqueo (ej. Personal Day, Maintenance):",
      "Blocked",
    );
    if (!title) return;

    const start = prompt("Hora inicio (HH:MM):", "10:00") || "10:00";
    const end = prompt("Hora fin (HH:MM):", "18:00") || "18:00";

    const ev = /** @type {CalendarEvent} */ ({
      id: uid(),
      type: "blocked",
      title,
      start,
      end,
    });

    state.events[state.selectedDateISO] =
      state.events[state.selectedDateISO] || [];
    state.events[state.selectedDateISO].push(ev);

    renderMonth();
    selectDate(state.selectedDateISO);
  };

  // --------- Google Calendar Integration (BASE) ----------
  // Nota: Esto NO conecta todavía. Es una base limpia para añadir OAuth + fetch + sync.
  const GoogleCalendar = (() => {
    const config = {
      // Luego: pon aquí tus credenciales reales (no hardcodearlas en prod; usa backend).
      clientId: "YOUR_GOOGLE_OAUTH_CLIENT_ID",
      apiKey: "YOUR_GOOGLE_API_KEY",
      // calendarId: "primary" o el id del calendario del guía
      calendarId: "primary",
      scopes: [
        "https://www.googleapis.com/auth/calendar.readonly",
        // Para crear/editar bloqueos en el calendario:
        // "https://www.googleapis.com/auth/calendar.events"
      ],
    };

    /** Mapea evento de Google -> CalendarEvent interno */
    const mapGoogleEventToInternal = (gEvent) => {
      // Placeholder. Google trae start/end como dateTime o date.
      // return { id: gEvent.id, type:"booked", title:gEvent.summary ?? "Tour", start:"10:00", end:"12:00" }
      return null;
    };

    const isConfigured = () => {
      return (
        config.clientId !== "YOUR_GOOGLE_OAUTH_CLIENT_ID" &&
        config.apiKey !== "YOUR_GOOGLE_API_KEY"
      );
    };

    const connect = async () => {
      // Aquí en el futuro:
      // 1) Cargar Google Identity Services (GIS) para OAuth.
      // 2) Obtener access_token.
      // 3) Llamar Calendar API: events.list.
      // Recomendación: hacerlo con backend para no exponer secretos y manejar refresh tokens.

      if (!isConfigured()) {
        alert(
          "Google Calendar no está configurado aún. (Base lista en app.js -> GoogleCalendar.config)",
        );
        return;
      }
    };

    const syncMonth = async (year, monthIndex0) => {
      // Placeholder:
      // - construir timeMin/timeMax para el mes
      // - fetch a:
      //   https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events?timeMin=...&timeMax=...
      // - mapear y meterlos a state.events
      void year;
      void monthIndex0;
    };

    return { connect, syncMonth };
  })();

  // --------- Bind / Init ----------
  const bind = () => {
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
    dom.btnTheme = document.getElementById("btnTheme");

    dom.viewButtons = [...document.querySelectorAll(".view-toggle__btn")];

    dom.sidebar = document.getElementById("sidebar");
    dom.btnSidebar = document.getElementById("btnSidebar");
    dom.backdrop = document.getElementById("backdrop");

    dom.btnPrev.addEventListener("click", () => changeMonth(-1));
    dom.btnNext.addEventListener("click", () => changeMonth(1));

    dom.viewButtons.forEach((btn) =>
      btn.addEventListener("click", () => setView(btn.dataset.view)),
    );

    dom.btnTheme.addEventListener("click", toggleTheme);

    dom.btnBlock.addEventListener("click", addBlockToSelectedDay);
    dom.btnAddBlockTime.addEventListener("click", addBlockToSelectedDay);

    dom.btnSync.addEventListener("click", async () => {
      // Base: conectar/sincronizar
      await GoogleCalendar.connect();
      // En el futuro: await GoogleCalendar.syncMonth(state.cursorDate.getFullYear(), state.cursorDate.getMonth())
    });

    // Sidebar mobile
    dom.btnSidebar.addEventListener("click", () => {
      const open = dom.sidebar.classList.contains("sidebar--open");
      open ? closeSidebar() : openSidebar();
    });
    dom.backdrop.addEventListener("click", closeSidebar);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });
  };

  const init = () => {
    seedDemoEvents();

    bind();
    renderMonth();
    renderDetails();

    // Selecciona el 4 Oct 2023 como tu maqueta original (opcional)
    state.selectedDateISO = "2023-10-04";
    renderMonth();
    selectDate(state.selectedDateISO);
  };

  return { init };
})();

document.addEventListener("DOMContentLoaded", App.init);

/* =========================================================
   Guía - Dashboard (Inicio)
   JS “backend-ready” con arquitectura simple y extensible.

   ✅ Incluye:
   - Toggle de tema (reusa tu lógica base)
   - Sidebar mobile (open/close)
   - Toggle de estado (Disponible / No disponible)
   - Render dinámico de Agenda, Insights (barras), Tours, Mini calendario
   - Puntos claros para integrar backend (fetch, auth, endpoints, etc.)

   NOTA:
   - En producción: token/auth debe venir de tu backend o un provider (JWT).
   ========================================================= */

const GuideDashboardApp = (() => {
  // -------------------------
  // STATE
  // -------------------------
  const state = {
    theme: "light",
    isAvailable: true,

    // En el futuro esto vendrá del backend:
    // GET /api/guide/dashboard
    user: {
      id: "guide_001",
      name: "Carlos Rivera",
      unreadMessages: 3,
      verified: true,
    },

    stats: {
      rating: 4.9,
      ratingDelta: "+0.2 este mes",
      toursCompleted: 124,
      toursDelta: "+12 recorridos",
      monthlyIncomeMXN: 25000,
      incomeDelta: "+15% vs mes anterior",
    },

    schedule: [
      {
        id: "ev_1",
        status: "in_progress", // in_progress | upcoming | empty
        start: "09:00",
        end: "11:30",
        title: "Paseo por el Centro Histórico (CDMX)",
        guests: 4,
        organizer: "Juan P.",
      },
      {
        id: "ev_2",
        status: "upcoming",
        start: "14:00",
        end: "16:00",
        title: "Tour de Tacos y Mezcal (Roma-Condesa)",
        guests: 2,
        organizer: "Sarah M.",
      },
      {
        id: "ev_3",
        status: "empty",
        start: "18:00",
        end: "",
        title: "",
        guests: 0,
        organizer: "",
      },
    ],

    insights: {
      range: "6m",
      // “reservas por mes”
      points6m: [
        { label: "May", value: 42 },
        { label: "Jun", value: 58 },
        { label: "Jul", value: 48 },
        { label: "Ago", value: 85 },
        { label: "Sep", value: 72 },
        { label: "Oct", value: 124, highlight: true },
      ],
      points12m: [
        { label: "Ene", value: 18 },
        { label: "Feb", value: 21 },
        { label: "Mar", value: 33 },
        { label: "Abr", value: 40 },
        { label: "May", value: 42 },
        { label: "Jun", value: 58 },
        { label: "Jul", value: 48 },
        { label: "Ago", value: 85 },
        { label: "Sep", value: 72 },
        { label: "Oct", value: 124, highlight: true },
        { label: "Nov", value: 66 },
        { label: "Dic", value: 54 },
      ],
    },

    toursPopular: [
      {
        id: "tour_1",
        title: "Tacos, Salsas y Cultura (CDMX)",
        rating: 4.9,
        bookings: 42,
        views: 1200,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDwMyzFQkw08_GIq4bVB3n1YP-6EIVCHOOHyb9tqHxc4rqnvuXVlWeaQ8-rfxUMHDhtUHuKgJMHVgxl-YBdcj4daXi_Z_7L8l2CYZXe_PBqGtr1vjanjSwnL23-AxSQ3sNurC9m_SuGvarO6lBzLRL2A1Y8MLFp4M3D6B_oG_JZFBb3YNREVUpVE86srQGBQFipliIFPPqxpooetSy4weSqMXFBpqJE3-QSjh4hS6pM7YENCoMFUZnJBAe_2q25BHvE0a9gF1Tve5Hy",
      },
      {
        id: "tour_2",
        title: "Amanecer en Teotihuacán",
        rating: 5.0,
        bookings: 38,
        views: 980,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDSl3WmgdfBb3njAGtb1jHsij4_fpf2ZJIYwmLfN-G1xj0M7nDHkoI0ApWMIn_DjKRTe5RV9wBEkaXxdY-K2-hYYV84holkn1CvM3zy_Hfla5ftUyndjenwzvGTCXBzPaY82BqiHKEEi7JyMyoGB_P2SdLdYp6F_wt4R_s6Q47mgvECsxzsx7rCBHuM4EYSaWF0h9GW-ZneBsHStfYD-hoNCxVw3Zpei2udS6xsIOA-KuQGbiLh9tYONw6SRkVguBTupYk2JaPttPGX",
      },
      {
        id: "tour_3",
        title: "Arquitectura y Barrios Tradicionales (CDMX)",
        rating: 4.8,
        bookings: 25,
        views: 850,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA1LG2-FtjlyTa8gr8eone2W6JPS8hC-WaCblxKa4H96xY27XNBsCwqzxRH7VlmXW-DOeyGts5Hfh2MMiwsRDBXW1jGkCJ5aRwepVpXZdnOcqfS6YkPinhNlkPZzIF4iwxCAifB-1zq9twLRbSE-b4XiJiY5EAwuOQ5wQWutj-HGsGs0ZOknnUdRl5EvW2cKxNRkj7N1Kpw9UFTMLSQz8UnczdAEk9JKj5EMdTNN1eSLoduNSKMoQo5Po_6QMTL-1rRhfBKV6zBOlUR",
      },
    ],

    miniCalendar: {
      cursor: new Date(2023, 9, 1), // Octubre 2023 demo
      bookedISO: new Set(["2023-10-07", "2023-10-11"]),
      blockedISO: new Set(["2023-10-09"]),
    },
  };

  // -------------------------
  // DOM
  // -------------------------
  const dom = {
    // sidebar/mobile
    sidebar: null,
    btnSidebar: null,
    backdrop: null,

    // theme
    btnTheme: null,

    // user
    userName: null,
    msgBadge: null,
    btnLogout: null,

    // status
    statusToggle: null,
    statusText: null,

    // stats
    ratingValue: null,
    ratingDelta: null,
    toursValue: null,
    toursDelta: null,
    incomeValue: null,
    incomeDelta: null,

    // schedule
    scheduleList: null,
    btnViewAll: null,

    // insights
    insightsRange: null,
    barChart: null,

    // tours
    tourGrid: null,

    // mini calendar
    miniDow: null,
    miniGrid: null,
    miniLabel: null,
    miniPrev: null,
    miniNext: null,
    btnManageAvailability: null,
  };

  // -------------------------
  // Utils
  // -------------------------
  const pad2 = (n) => String(n).padStart(2, "0");

  const toISODate = (date) => {
    const y = date.getFullYear();
    const m = pad2(date.getMonth() + 1);
    const d = pad2(date.getDate());
    return `${y}-${m}-${d}`;
  };

  const startOfMonthGrid = (date) => {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const day = first.getDay(); // 0 domingo
    const start = new Date(first);
    start.setDate(first.getDate() - day);
    return start;
  };

  const formatMonthES = (date) =>
    date.toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const formatMoneyMXN = (amount) => {
    // Backend idealmente manda un número y ya lo formateas aquí.
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // -------------------------
  // Backend Integration (placeholders)
  // -------------------------
  /**
   * Punto de integración:
   * Aquí en el futuro obtendrás el dashboard real desde backend.
   *
   * Ejemplo (futuro):
   *  GET /api/guide/dashboard
   *  Headers: Authorization: Bearer <token>
   *
   * Debe devolver:
   *  - user
   *  - stats
   *  - schedule (eventos del día)
   *  - insights
   *  - toursPopular
   *  - miniCalendar metadata (booked/blocked)
   */
  const fetchDashboardFromBackend = async () => {
    // TODO BACKEND:
    // const token = auth.getToken();
    // const res = await fetch("/api/guide/dashboard", { headers:{ Authorization:`Bearer ${token}` }});
    // const data = await res.json();
    // Object.assign(state, data);
    return;
  };

  /**
   * Punto de integración:
   * Cambiar el estado del guía.
   * Ejemplo:
   *  PATCH /api/guide/status { isAvailable:true/false }
   */
  const updateAvailabilityOnBackend = async (isAvailable) => {
    // TODO BACKEND:
    // await fetch("/api/guide/status", {
    //   method: "PATCH",
    //   headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
    //   body: JSON.stringify({ isAvailable })
    // });
    void isAvailable;
  };

  /**
   * Punto de integración:
   * Logout.
   * En front: limpiar token y redirigir.
   */
  const logout = () => {
    // TODO BACKEND/AUTH:
    // auth.clearToken();
    // location.href = "/login";
    alert("Aquí cerrarías sesión (placeholder).");
  };

  // -------------------------
  // Render
  // -------------------------
  const renderUser = () => {
    dom.userName.textContent = state.user.name;
    dom.msgBadge.textContent = String(state.user.unreadMessages);
    dom.msgBadge.setAttribute(
      "aria-label",
      `${state.user.unreadMessages} mensajes sin leer`,
    );
  };

  const renderStats = () => {
    dom.ratingValue.textContent = String(state.stats.rating);
    dom.ratingDelta.textContent = state.stats.ratingDelta;

    dom.toursValue.textContent = String(state.stats.toursCompleted);
    dom.toursDelta.textContent = state.stats.toursDelta;

    dom.incomeValue.textContent = formatMoneyMXN(state.stats.monthlyIncomeMXN);
    dom.incomeDelta.textContent = state.stats.incomeDelta;
  };

  const renderStatus = () => {
    dom.statusToggle.checked = state.isAvailable;
    dom.statusText.textContent = state.isAvailable
      ? "Disponible"
      : "No disponible";
  };

  const renderSchedule = () => {
    dom.scheduleList.innerHTML = "";

    state.schedule.forEach((item) => {
      const row = document.createElement("div");
      row.className = "schedule-item";

      const dot = document.createElement("div");
      dot.className = "schedule-item__dot";

      if (item.status === "in_progress")
        dot.classList.add("schedule-item__dot--active");
      if (item.status === "upcoming")
        dot.classList.add("schedule-item__dot--upcoming");

      const content = document.createElement("div");

      const time = document.createElement("div");
      time.className = "schedule-item__time";
      time.textContent =
        item.status === "in_progress"
          ? `${item.start} - ${item.end} • En curso`
          : item.status === "upcoming"
            ? `${item.start} - ${item.end}`
            : `${item.start}`;

      const card = document.createElement("div");

      if (item.status === "empty") {
        card.className = "schedule-item__card schedule-item__card--plain";
        card.innerHTML = `<div class="timeline__empty">Sin reservas por ahora</div>`;
      } else {
        card.className =
          item.status === "in_progress"
            ? "schedule-item__card"
            : "schedule-item__card schedule-item__card--plain";

        const title = document.createElement("p");
        title.className = "schedule-item__title";
        title.textContent = item.title;

        const meta = document.createElement("div");
        meta.className = "schedule-item__meta";
        meta.innerHTML = `
          <span class="material-symbols-outlined" aria-hidden="true">group</span>
          <span>${item.guests} visitantes</span>
          <span aria-hidden="true">•</span>
          <span>${item.organizer} (organizador)</span>
        `;

        card.appendChild(title);
        card.appendChild(meta);

        // Click para detalles (placeholder)
        card.addEventListener("click", () => {
          // TODO BACKEND:
          // location.href = `/guia/reservas/${item.id}`
          alert(`Abrir detalles de la reserva: ${item.id} (placeholder)`);
        });
      }

      content.appendChild(time);
      content.appendChild(card);

      row.appendChild(dot);
      row.appendChild(content);

      dom.scheduleList.appendChild(row);
    });
  };

  const renderInsights = () => {
    dom.barChart.innerHTML = "";
    const points =
      state.insights.range === "12m"
        ? state.insights.points12m
        : state.insights.points6m;

    const max = points.reduce((m, p) => Math.max(m, p.value), 1);

    points.forEach((p) => {
      const wrapper = document.createElement("div");
      wrapper.className = "bar";

      const col = document.createElement("div");
      col.className = "bar__col";
      col.tabIndex = 0; // accesible por teclado
      const hPct = clamp((p.value / max) * 100, 8, 100);
      col.style.height = `${hPct}%`;

      if (p.highlight) col.classList.add("bar__col--highlight");

      const tooltip = document.createElement("div");
      tooltip.className = "bar__tooltip";
      tooltip.textContent = String(p.value);

      const label = document.createElement("div");
      label.className = "bar__label";
      label.textContent = p.label;

      col.appendChild(tooltip);
      wrapper.appendChild(col);
      wrapper.appendChild(label);

      // Mobile: tap -> muestra tooltip usando focus
      col.addEventListener("click", () => col.focus());

      dom.barChart.appendChild(wrapper);
    });
  };

  const renderTours = () => {
    dom.tourGrid.innerHTML = "";

    state.toursPopular.forEach((t) => {
      const card = document.createElement("article");
      card.className = "tour-card";
      card.tabIndex = 0;

      card.innerHTML = `
        <div class="tour-card__media" style="background-image:url('${t.image}');">
          <div class="tour-card__rating">
            <span class="material-symbols-outlined" aria-hidden="true">star</span>
            <span>${t.rating.toFixed(1)}</span>
          </div>
        </div>
        <div class="tour-card__body">
          <h4 class="tour-card__title">${t.title}</h4>
          <div class="tour-card__meta">
            <span class="tour-card__meta-item">
              <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
              <span>${t.bookings} reservas</span>
            </span>
            <span class="tour-card__meta-item">
              <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
              <span>${formatViews(t.views)}</span>
            </span>
          </div>
        </div>
      `;

      const openTour = () => {
        // TODO BACKEND:
        // location.href = `/guia/recorridos/${t.id}`
        alert(`Abrir recorrido: ${t.id} (placeholder)`);
      };

      card.addEventListener("click", openTour);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openTour();
        }
      });

      dom.tourGrid.appendChild(card);
    });
  };

  const formatViews = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  // Mini calendario
  const renderMiniCalendar = () => {
    // Días de la semana (México suele iniciar lunes, pero el diseño original era domingo)
    // Si quieres lunes, lo cambiamos.
    const dow = ["D", "L", "M", "M", "J", "V", "S"];
    dom.miniDow.innerHTML = dow.map((d) => `<span>${d}</span>`).join("");

    dom.miniLabel.textContent = capitalize(
      formatMonthES(state.miniCalendar.cursor),
    );

    dom.miniGrid.innerHTML = "";

    const cursor = state.miniCalendar.cursor;
    const start = startOfMonthGrid(cursor);
    const cursorMonth = cursor.getMonth();
    const todayISO = toISODate(new Date());

    // 35 celdas para mantener compacto
    const totalCells = 35;

    for (let i = 0; i < totalCells; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const iso = toISODate(d);
      const isOutside = d.getMonth() !== cursorMonth;

      const cell = document.createElement("div");
      cell.className = "mini-cal__day";
      cell.textContent = String(d.getDate());

      if (isOutside) cell.classList.add("mini-cal__day--muted");

      if (iso === todayISO && !isOutside)
        cell.classList.add("mini-cal__day--today");

      if (!isOutside) {
        if (state.miniCalendar.bookedISO.has(iso))
          cell.classList.add("mini-cal__day--booked");
        if (state.miniCalendar.blockedISO.has(iso))
          cell.classList.add("mini-cal__day--blocked");

        cell.addEventListener("click", () => {
          // TODO BACKEND:
          // Aquí podrías llevar a /calendario?date=YYYY-MM-DD
          alert(`Abrir disponibilidad del día ${iso} (placeholder)`);
        });
      }

      dom.miniGrid.appendChild(cell);
    }
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // -------------------------
  // UI helpers (theme, sidebar)
  // -------------------------
  const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.classList.contains("theme--dark");

    html.classList.toggle("theme--dark", !isDark);
    html.classList.toggle("theme--light", isDark);

    state.theme = !isDark ? "dark" : "light";

    // TODO BACKEND / STORAGE:
    // localStorage.setItem("theme", state.theme);
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

  // -------------------------
  // Bind / Init
  // -------------------------
  const bind = () => {
    dom.sidebar = document.getElementById("sidebar");
    dom.btnSidebar = document.getElementById("btnSidebar");
    dom.backdrop = document.getElementById("backdrop");

    dom.btnTheme = document.getElementById("btnTheme");

    dom.userName = document.getElementById("userName");
    dom.msgBadge = document.getElementById("msgBadge");
    dom.btnLogout = document.getElementById("btnLogout");

    dom.statusToggle = document.getElementById("statusToggle");
    dom.statusText = document.getElementById("statusText");

    dom.ratingValue = document.getElementById("ratingValue");
    dom.ratingDelta = document.getElementById("ratingDelta");
    dom.toursValue = document.getElementById("toursValue");
    dom.toursDelta = document.getElementById("toursDelta");
    dom.incomeValue = document.getElementById("incomeValue");
    dom.incomeDelta = document.getElementById("incomeDelta");

    dom.scheduleList = document.getElementById("scheduleList");
    dom.btnViewAll = document.getElementById("btnViewAll");

    dom.insightsRange = document.getElementById("insightsRange");
    dom.barChart = document.getElementById("barChart");

    dom.tourGrid = document.getElementById("tourGrid");

    dom.miniDow = document.getElementById("miniDow");
    dom.miniGrid = document.getElementById("miniGrid");
    dom.miniLabel = document.getElementById("miniLabel");
    dom.miniPrev = document.getElementById("miniPrev");
    dom.miniNext = document.getElementById("miniNext");
    dom.btnManageAvailability = document.getElementById(
      "btnManageAvailability",
    );

    // Sidebar mobile
    dom.btnSidebar.addEventListener("click", () => {
      const isOpen = dom.sidebar.classList.contains("sidebar--open");
      isOpen ? closeSidebar() : openSidebar();
    });
    dom.backdrop.addEventListener("click", closeSidebar);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });

    // Theme
    dom.btnTheme.addEventListener("click", toggleTheme);

    // Status toggle -> backend-ready
    dom.statusToggle.addEventListener("change", async () => {
      state.isAvailable = dom.statusToggle.checked;
      renderStatus();
      await updateAvailabilityOnBackend(state.isAvailable);
    });

    // View all schedule
    dom.btnViewAll.addEventListener("click", () => {
      // TODO BACKEND:
      // location.href = "/guia/calendario?view=day"
      alert("Ir a agenda completa (placeholder).");
    });

    // Insights range
    dom.insightsRange.addEventListener("change", () => {
      state.insights.range = dom.insightsRange.value;
      renderInsights();
    });

    // Mini calendar navigation
    dom.miniPrev.addEventListener("click", () => {
      const d = new Date(state.miniCalendar.cursor);
      d.setMonth(d.getMonth() - 1);
      state.miniCalendar.cursor = d;

      // TODO BACKEND:
      // Pedir al backend booked/blocked de ese mes:
      // GET /api/guide/availability?month=YYYY-MM
      renderMiniCalendar();
    });

    dom.miniNext.addEventListener("click", () => {
      const d = new Date(state.miniCalendar.cursor);
      d.setMonth(d.getMonth() + 1);
      state.miniCalendar.cursor = d;

      // TODO BACKEND:
      // GET /api/guide/availability?month=YYYY-MM
      renderMiniCalendar();
    });

    dom.btnManageAvailability.addEventListener("click", () => {
      // TODO BACKEND:
      // location.href = "/guia/calendario"
      alert("Administrar disponibilidad (placeholder).");
    });

    // Logout
    dom.btnLogout.addEventListener("click", logout);
  };

  const renderAll = () => {
    renderUser();
    renderStats();
    renderStatus();
    renderSchedule();
    renderInsights();
    renderTours();
    renderMiniCalendar();
  };

  const init = async () => {
    bind();

    // TODO BACKEND:
    // await fetchDashboardFromBackend();
    await fetchDashboardFromBackend();

    renderAll();
  };

  return { init };
})();

document.addEventListener("DOMContentLoaded", GuideDashboardApp.init);

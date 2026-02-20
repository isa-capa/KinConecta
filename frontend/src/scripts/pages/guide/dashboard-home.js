/* =========================================================
   Guía - Dashboard (Inicio)
   API-first con fallback local para futura integración Spring Boot.
   ========================================================= */

const GuideDashboardApp = (() => {
  const state = {
    guideId: "guide_001", // TODO(AUTH): obtener guideId real de JWT/sesión
    user: {
      id: "guide_001",
      name: "Carlos Rivera",
      unreadMessages: 3,
    },
    stats: {
      rating: 4.9,
      ratingDelta: "+0.2 este mes",
      toursCompleted: 124,
      toursDelta: "+12 recorridos",
      monthlyIncomeMXN: 25000,
      incomeDelta: "+15% vs mes anterior",
    },
    schedule: [],
    insights: {
      range: "6m",
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
        title: "Amanecer en Teotihuacan",
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
    toursSpotlight: [],
  };

  state.toursSpotlight = [state.toursPopular[1], state.toursPopular[0]];

  const dom = {
    userName: null,
    msgBadge: null,
    btnLogout: null,
    btnNotif: null,
    ratingValue: null,
    ratingDelta: null,
    toursValue: null,
    toursDelta: null,
    incomeValue: null,
    incomeDelta: null,
    scheduleList: null,
    btnViewAll: null,
    insightsRange: null,
    barChart: null,
    tourGrid: null,
    tourGridSecondary: null,
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const createUid = () => Math.random().toString(36).slice(2, 10);

  const formatMoneyMXN = (amount) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const formatViews = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

  const loadingMarkup = (label) => `
    <div class="guide-loading" role="status" aria-live="polite" aria-busy="true">
      <span class="guide-loading__spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `;

  const renderLoadingState = () => {
    if (dom.scheduleList) {
      dom.scheduleList.innerHTML = loadingMarkup("Cargando agenda...");
    }
    if (dom.barChart) {
      dom.barChart.innerHTML = loadingMarkup("Cargando tendencia...");
    }
    if (dom.tourGrid) {
      dom.tourGrid.innerHTML = loadingMarkup("Cargando recorridos...");
    }
    if (dom.tourGridSecondary) {
      dom.tourGridSecondary.innerHTML = loadingMarkup("Cargando sugerencias...");
    }
  };

  function getTrendPoints() {
    return state.insights.range === "12m" ? state.insights.points12m : state.insights.points6m;
  }

  function mapSummaryResponse(raw) {
    // TODO(BACKEND): mapear contrato final DTO summary -> state.stats/state.user
    if (!raw || typeof raw !== "object") return;
    state.user.name = raw.guideName ?? state.user.name;
    state.user.unreadMessages = raw.unreadMessages ?? state.user.unreadMessages;

    state.stats.rating = raw.averageRating ?? state.stats.rating;
    state.stats.ratingDelta = raw.ratingDeltaLabel ?? state.stats.ratingDelta;
    state.stats.toursCompleted = raw.completedTours ?? state.stats.toursCompleted;
    state.stats.toursDelta = raw.completedToursDeltaLabel ?? state.stats.toursDelta;
    state.stats.monthlyIncomeMXN = raw.monthlyIncomeMXN ?? state.stats.monthlyIncomeMXN;
    state.stats.incomeDelta = raw.monthlyIncomeDeltaLabel ?? state.stats.incomeDelta;
  }

  function mapScheduleResponse(raw) {
    // TODO(BACKEND): estandarizar estados ("in_progress","upcoming","empty")
    if (!Array.isArray(raw)) return;
    state.schedule = raw.map((item) => ({
      id: item.id ?? createUid(),
      status: item.status || "upcoming",
      start: item.start || "",
      end: item.end || "",
      title: item.title || "",
      guests: item.guests ?? 0,
      organizer: item.organizer || "",
    }));
  }

  function mapTrendResponse(raw, range) {
    // TODO(BACKEND): confirmar estructura: { points:[{label,value,highlight}] }
    if (!raw || !Array.isArray(raw.points)) return;
    const nextPoints = raw.points.map((point) => ({
      label: point.label,
      value: Number(point.value || 0),
      highlight: Boolean(point.highlight),
    }));
    if (range === "12m") state.insights.points12m = nextPoints;
    else state.insights.points6m = nextPoints;
  }

  function mapToursResponse(raw, targetKey) {
    // TODO(BACKEND): unificar shape de tours para cards de dashboard
    if (!Array.isArray(raw)) return;
    state[targetKey] = raw.map((tour) => ({
      id: tour.id,
      title: tour.title || "Recorrido sin título",
      rating: Number(tour.rating || 0),
      bookings: Number(tour.bookings || 0),
      views: Number(tour.views || 0),
      image:
        tour.imageUrl ||
        tour.coverImageUrl ||
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
    }));
  }

  function seedFallbackSchedule() {
    if (state.schedule.length) return;
    state.schedule = [
      {
        id: "ev_1",
        status: "in_progress",
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
    ];
  }

  async function hydrateFromApi() {
    // TODO(BACKEND): centralizar auth token + refresh en http-client.js
    // TODO(BACKEND): mover guideId a contexto global de usuario autenticado
    if (!window.KCGuideApi) {
      seedFallbackSchedule();
      return;
    }

    try {
      const [summaryRes, scheduleRes, trendRes, popularRes, spotlightRes] = await Promise.all([
        window.KCGuideApi.dashboard.getSummary(),
        window.KCGuideApi.dashboard.getTodaySchedule(),
        window.KCGuideApi.dashboard.getReservationsTrend(state.insights.range),
        window.KCGuideApi.dashboard.getPopularTours(),
        window.KCGuideApi.dashboard.getSpotlightTours(),
      ]);

      mapSummaryResponse(summaryRes?.data);
      mapScheduleResponse(scheduleRes?.data?.items || scheduleRes?.data || []);
      mapTrendResponse(trendRes?.data || {}, state.insights.range);
      mapToursResponse(popularRes?.data?.items || popularRes?.data || [], "toursPopular");
      mapToursResponse(spotlightRes?.data?.items || spotlightRes?.data || [], "toursSpotlight");
    } catch (error) {
      console.warn("Dashboard API fallback enabled:", error);
      seedFallbackSchedule();
    }
  }

  const logout = () => {
    // TODO(AUTH): llamar endpoint de logout + limpiar storage/tokens.
    window.location.href = "../../../index.html";
  };

  const renderUser = () => {
    if (dom.userName) dom.userName.textContent = state.user.name;
    if (dom.msgBadge) {
      dom.msgBadge.textContent = String(state.user.unreadMessages);
      dom.msgBadge.setAttribute("aria-label", `${state.user.unreadMessages} mensajes sin leer`);
    }
  };

  const renderStats = () => {
    if (!dom.ratingValue) return;
    dom.ratingValue.textContent = String(state.stats.rating);
    dom.ratingDelta.textContent = state.stats.ratingDelta;
    dom.toursValue.textContent = String(state.stats.toursCompleted);
    dom.toursDelta.textContent = state.stats.toursDelta;
    dom.incomeValue.textContent = formatMoneyMXN(state.stats.monthlyIncomeMXN);
    dom.incomeDelta.textContent = state.stats.incomeDelta;
  };

  const renderSchedule = () => {
    if (!dom.scheduleList) return;
    dom.scheduleList.innerHTML = "";

    state.schedule.forEach((item) => {
      const row = document.createElement("div");
      row.className = "schedule-item";

      const dot = document.createElement("div");
      dot.className = "schedule-item__dot";
      if (item.status === "in_progress") dot.classList.add("schedule-item__dot--active");
      if (item.status === "upcoming") dot.classList.add("schedule-item__dot--upcoming");

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
        card.innerHTML = '<div class="timeline__empty">Sin reservas por ahora</div>';
      } else {
        card.className =
          item.status === "in_progress"
            ? "schedule-item__card"
            : "schedule-item__card schedule-item__card--plain";
        card.innerHTML = `
          <p class="schedule-item__title">${item.title}</p>
          <div class="schedule-item__meta">
            <span class="material-symbols-outlined" aria-hidden="true">group</span>
            <span>${item.guests} visitantes</span>
            <span aria-hidden="true">•</span>
            <span>${item.organizer} (organizador)</span>
          </div>
        `;
        card.addEventListener("click", () => {
          // TODO(BACKEND): navegar a detalle de reserva /booking/:id
          console.info("TODO: open booking details", item.id);
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
    if (!dom.barChart) return;
    dom.barChart.innerHTML = "";
    const points = getTrendPoints();
    const max = points.reduce((m, p) => Math.max(m, Number(p.value || 0)), 1);

    points.forEach((point) => {
      const wrapper = document.createElement("div");
      wrapper.className = "bar";

      const col = document.createElement("div");
      col.className = "bar__col";
      col.tabIndex = 0;
      col.style.height = `${clamp((Number(point.value || 0) / max) * 100, 8, 100)}%`;
      if (point.highlight) col.classList.add("bar__col--highlight");
      col.innerHTML = `<div class="bar__tooltip">${point.value}</div>`;

      const label = document.createElement("div");
      label.className = "bar__label";
      label.textContent = point.label;

      col.addEventListener("click", () => col.focus());
      wrapper.appendChild(col);
      wrapper.appendChild(label);
      dom.barChart.appendChild(wrapper);
    });
  };

  const renderTourCards = (target, items) => {
    if (!target) return;
    target.innerHTML = "";

    items.forEach((tour) => {
      const card = document.createElement("article");
      card.className = "tour-card";
      card.tabIndex = 0;
      card.innerHTML = `
        <div class="tour-card__media" style="background-image:url('${tour.image}');">
          <div class="tour-card__rating">
            <span class="material-symbols-outlined" aria-hidden="true">star</span>
            <span>${Number(tour.rating || 0).toFixed(1)}</span>
          </div>
        </div>
        <div class="tour-card__body">
          <h4 class="tour-card__title">${tour.title}</h4>
          <div class="tour-card__meta">
            <span class="tour-card__meta-item">
              <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
              <span>${tour.bookings} reservas</span>
            </span>
            <span class="tour-card__meta-item">
              <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
              <span>${formatViews(tour.views)}</span>
            </span>
          </div>
        </div>
      `;

      const openTour = () => {
        // TODO(BACKEND): abrir detalle de tour /guides/:guideId/tours/:tourId
        console.info("TODO: open tour details", tour.id);
      };
      card.addEventListener("click", openTour);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openTour();
        }
      });

      target.appendChild(card);
    });
  };

  const bind = () => {
    dom.userName = document.getElementById("userName");
    dom.msgBadge = document.getElementById("msgBadge");
    dom.btnLogout = document.getElementById("btnLogout");
    dom.btnNotif = document.getElementById("btnNotif");

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
    dom.tourGridSecondary = document.getElementById("tourGridSecondary");

    dom.btnViewAll?.addEventListener("click", () => {
      // TODO(BACKEND): ruta real de agenda/componente de reservas
      window.location.href = "../../Dashboard/guia/calendar.html";
    });

    dom.insightsRange?.addEventListener("change", async () => {
      state.insights.range = dom.insightsRange.value;
      if (dom.barChart) dom.barChart.innerHTML = loadingMarkup("Cargando tendencia...");
      // TODO(BACKEND): endpoint con query range para evitar descargar toda la serie
      await hydrateFromApi();
      renderInsights();
    });

    dom.btnLogout?.addEventListener("click", logout);
    dom.btnNotif?.addEventListener("click", () => {
      // El popover real lo gestiona guide-shell.js
    });
  };

  const renderAll = () => {
    renderUser();
    renderStats();
    renderSchedule();
    renderInsights();
    renderTourCards(dom.tourGrid, state.toursPopular);
    renderTourCards(dom.tourGridSecondary, state.toursSpotlight);
  };

  const init = async () => {
    bind();
    renderLoadingState();
    await hydrateFromApi();
    renderAll();

    // TODO(BACKEND): websocket/sse para actualizar stats y agenda en tiempo real
  };

  return { init };
})();

const bootstrapGuideDashboard = () => {
  const run = () => GuideDashboardApp.init();
  const sidebarReady = window.__guideSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapGuideDashboard, { once: true });
} else {
  bootstrapGuideDashboard();
}

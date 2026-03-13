const GuideDashboardApp = (() => {
  const state = {
    user: {
      id: null,
      name: "Usuario",
      unreadMessages: 0,
    },
    stats: {
      rating: 0,
      ratingDelta: "Sin datos",
      toursCompleted: 0,
      toursDelta: "Sin datos",
      monthlyIncomeMXN: 0,
      incomeDelta: "Sin datos",
    },
    schedule: [],
    insights: {
      range: "6m",
      points: [],
    },
    toursPopular: [],
    toursSpotlight: [],
  };

  const dom = {
    userName: null,
    msgBadge: null,
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

  const formatMoneyMXN = (amount) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const formatViews = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Number(n || 0)));

  const loadingMarkup = (label) => `
    <div class="guide-loading" role="status" aria-live="polite" aria-busy="true">
      <span class="guide-loading__spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `;

  const TOUR_IMAGE_FALLBACKS = [
    {
      match: ["gastronom", "food", "culin", "mercad", "cantina"],
      file: "gastronomia.jpeg",
    },
    {
      match: ["aventur", "sender", "montan", "nature", "naturaleza", "cenote", "ecotur"],
      file: "naturaleza.jpeg",
    },
    {
      match: ["hist", "cultura", "arque", "architecture", "arquitect", "museo", "centro"],
      file: "historia_y_cultura.jpeg",
    },
    {
      match: ["arte", "art", "street", "mural", "foto", "photo"],
      file: "arte_urbano.jpeg",
    },
    {
      match: ["playa", "beach", "mar", "coast", "isla"],
      file: "naturaleza.jpeg",
    },
  ];

  const normalizeLookup = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const sanitizeUrl = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/kinconecta\.test/i.test(raw)) return "";
    if (/\/t[1-5]\.jpg$/i.test(raw)) return "";
    return raw.replace(/"/g, "%22").replace(/'/g, "%27");
  };

  const isImageSource = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return false;
    if (/^data:image\//i.test(raw)) return true;
    if (/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(raw)) return true;
    if (/^https?:\/\//i.test(raw)) return true;
    if (raw.startsWith("/") || raw.startsWith("./") || raw.startsWith("../")) return true;
    return false;
  };

  const tourAssetUrl = (fileName) =>
    sanitizeUrl(new URL(`../../../assets/tours/categories/${fileName}`, window.location.href).href);

  const resolveTourImage = (...candidates) => {
    const direct = candidates.find((value) => isImageSource(value));
    if (direct) return sanitizeUrl(direct);

    const haystack = normalizeLookup(candidates.join(" "));
    const matched = TOUR_IMAGE_FALLBACKS.find((entry) =>
      entry.match.some((token) => haystack.includes(token)),
    );
    return sanitizeUrl(
      matched?.file
        ? tourAssetUrl(matched.file)
        : tourAssetUrl("arquitectura.jpeg"),
    );
  };

  const emptyMarkup = (label) => `
    <div class="guide-loading guide-loading--compact" role="status" aria-live="polite" aria-busy="false">
      <span>${label}</span>
    </div>
  `;

  function isRoleLabel(value) {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return ["turista", "tourist", "guia", "guide", "usuario", "user"].includes(normalized);
  }

  function resolveDisplayName(...candidates) {
    for (const candidate of candidates) {
      const value = String(candidate || "").trim();
      if (!value || isRoleLabel(value)) continue;
      return value;
    }
    return "Usuario";
  }

  function bind() {
    dom.userName = document.getElementById("userName");
    dom.msgBadge = document.getElementById("msgBadge");
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
      window.location.href = "./calendar.html";
    });

    dom.insightsRange?.addEventListener("change", async () => {
      state.insights.range = dom.insightsRange.value || "6m";
      if (dom.barChart) {
        dom.barChart.innerHTML = loadingMarkup("Cargando tendencia...");
      }
      try {
        await hydrateTrend();
      } catch (error) {
        console.error("No se pudo cargar la tendencia del guía.", error);
      }
      renderInsights();
    });
  }

  function getGuideId() {
    const snapshot = window.KCAuthState?.getSnapshot?.();
    return snapshot?.guideId || snapshot?.userId || null;
  }

  function renderUser() {
    if (dom.userName) dom.userName.textContent = resolveDisplayName(state.user.name);
    if (dom.msgBadge) {
      dom.msgBadge.textContent = String(state.user.unreadMessages);
      dom.msgBadge.setAttribute("aria-label", `${state.user.unreadMessages} mensajes sin leer`);
    }
  }

  function renderStats() {
    if (dom.ratingValue) dom.ratingValue.textContent = state.stats.rating.toFixed(1);
    if (dom.ratingDelta) dom.ratingDelta.textContent = state.stats.ratingDelta;
    if (dom.toursValue) dom.toursValue.textContent = String(state.stats.toursCompleted);
    if (dom.toursDelta) dom.toursDelta.textContent = state.stats.toursDelta;
    if (dom.incomeValue) dom.incomeValue.textContent = formatMoneyMXN(state.stats.monthlyIncomeMXN);
    if (dom.incomeDelta) dom.incomeDelta.textContent = state.stats.incomeDelta;
  }

  function renderSchedule() {
    if (!dom.scheduleList) return;
    if (!state.schedule.length) {
      dom.scheduleList.innerHTML = emptyMarkup("No hay reservas agendadas para hoy.");
      return;
    }

    dom.scheduleList.innerHTML = state.schedule
      .map((item) => {
        const statusSuffix = item.status === "in_progress" ? " • En curso" : "";
        const cardClass =
          item.status === "in_progress"
            ? "schedule-item__card"
            : "schedule-item__card schedule-item__card--plain";
        const dotClass =
          item.status === "in_progress"
            ? "schedule-item__dot schedule-item__dot--active"
            : "schedule-item__dot schedule-item__dot--upcoming";
        return `
          <div class="schedule-item">
            <div class="${dotClass}"></div>
            <div>
              <div class="schedule-item__time">${item.start || "--:--"} - ${item.end || "--:--"}${statusSuffix}</div>
              <div class="${cardClass}">
                <p class="schedule-item__title">${item.title || "Reserva"}</p>
                <div class="schedule-item__meta">
                  <span class="material-symbols-outlined" aria-hidden="true">group</span>
                  <span>${Number(item.guests || 0)} visitantes</span>
                  <span aria-hidden="true">•</span>
                  <span>${item.organizer || "Turista"}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderInsights() {
    if (!dom.barChart) return;
    if (!state.insights.points.length) {
      dom.barChart.innerHTML = emptyMarkup("Aún no hay datos suficientes para la tendencia.");
      return;
    }

    dom.barChart.innerHTML = "";
    const max = state.insights.points.reduce((highest, point) => Math.max(highest, Number(point.value || 0)), 1);

    state.insights.points.forEach((point) => {
      const wrapper = document.createElement("div");
      wrapper.className = "bar";

      const bar = document.createElement("div");
      bar.className = `bar__col ${point.highlight ? "bar__col--highlight" : ""}`.trim();
      bar.style.height = `${Math.max(8, (Number(point.value || 0) / max) * 100)}%`;
      bar.innerHTML = `<div class="bar__tooltip">${Number(point.value || 0)}</div>`;

      const label = document.createElement("div");
      label.className = "bar__label";
      label.textContent = point.label || "";

      wrapper.appendChild(bar);
      wrapper.appendChild(label);
      dom.barChart.appendChild(wrapper);
    });
  }

  function renderTourCards(target, items, emptyLabel) {
    if (!target) return;
    if (!items.length) {
      target.innerHTML = emptyMarkup(emptyLabel);
      return;
    }

    target.innerHTML = items
      .map(
        (tour) => `
          <article class="tour-card">
            <div class="tour-card__media">
              <img
                class="tour-card__media-img"
                src="${resolveTourImage(
                  tour.imageUrl,
                  tour.coverImageUrl,
                  tour.category,
                  tour.title,
                  tour.description,
                )}"
                alt="${tour.title || "Recorrido"}"
                loading="lazy"
              />
              <div class="tour-card__rating">
                <span class="material-symbols-outlined" aria-hidden="true">star</span>
                <span>${Number(tour.rating || 0).toFixed(1)}</span>
              </div>
            </div>
            <div class="tour-card__body">
              <h4 class="tour-card__title">${tour.title || "Recorrido"}</h4>
              <div class="tour-card__meta">
                <span class="tour-card__meta-item">
                  <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
                  <span>${Number(tour.bookings || 0)} reservas</span>
                </span>
                <span class="tour-card__meta-item">
                  <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
                  <span>${formatViews(tour.views || 0)}</span>
                </span>
              </div>
            </div>
          </article>
        `,
      )
      .join("");
  }

  function renderLoadingState() {
    if (dom.scheduleList) dom.scheduleList.innerHTML = loadingMarkup("Cargando agenda...");
    if (dom.barChart) dom.barChart.innerHTML = loadingMarkup("Cargando tendencia...");
    if (dom.tourGrid) dom.tourGrid.innerHTML = loadingMarkup("Cargando recorridos...");
    if (dom.tourGridSecondary) dom.tourGridSecondary.innerHTML = loadingMarkup("Cargando destacados...");
  }

  async function hydrateTrend() {
    if (!window.KCGuideApi?.dashboard?.getReservationsTrend) {
      state.insights.points = [];
      return;
    }

    const response = await window.KCGuideApi.dashboard.getReservationsTrend(state.insights.range, getGuideId());
    state.insights.points = response?.data?.points || [];
  }

  async function hydrateFromApi() {
    const guideId = getGuideId();
    const api = window.KCGuideApi;
    const currentUser = (await window.KCAuthState?.getCurrentUser?.()) || null;

    if (currentUser?.fullName) {
      state.user.name = resolveDisplayName(currentUser.fullName, state.user.name);
      state.user.id = currentUser.userId || guideId;
    }

    if (!api?.dashboard) {
      return;
    }

    const [summaryRes, scheduleRes, popularRes, spotlightRes] = await Promise.all([
      api.dashboard.getSummary(guideId),
      api.dashboard.getTodaySchedule(guideId),
      api.dashboard.getPopularTours(guideId),
      api.dashboard.getSpotlightTours(guideId),
    ]);

    const summary = summaryRes?.data || {};
    state.user.name = resolveDisplayName(summary.guideName, summary.fullName, summary.name, state.user.name);
    state.user.unreadMessages = Number(summary.unreadMessages || 0);
    state.stats.rating = Number(summary.averageRating || 0);
    state.stats.ratingDelta = summary.ratingDeltaLabel || "Sin datos";
    state.stats.toursCompleted = Number(summary.completedTours || 0);
    state.stats.toursDelta = summary.completedToursDeltaLabel || "Sin datos";
    state.stats.monthlyIncomeMXN = Number(summary.monthlyIncomeMXN || 0);
    state.stats.incomeDelta = summary.monthlyIncomeDeltaLabel || "Sin datos";
    state.schedule = scheduleRes?.data || [];
    state.toursPopular = popularRes?.data || [];
    state.toursSpotlight = spotlightRes?.data || [];

    await hydrateTrend();
  }

  async function init() {
    bind();
    renderLoadingState();

    try {
      await hydrateFromApi();
    } catch (error) {
      console.error("No se pudo cargar el dashboard del guía.", error);
    }

    renderUser();
    renderStats();
    renderSchedule();
    renderInsights();
    renderTourCards(dom.tourGrid, state.toursPopular, "Aún no tienes recorridos con reservas.");
    renderTourCards(dom.tourGridSecondary, state.toursSpotlight, "Aún no hay recorridos destacados.");
  }

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

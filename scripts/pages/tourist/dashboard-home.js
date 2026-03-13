const TouristDashboardApp = (() => {
  const GUIDE_AVATAR_ASSET = "../../../assets/users/user_guide.png";
  const NEXT_TRIP_FALLBACK_ASSET = "../../../assets/tours/viaje.jpg";
  const state = {
    user: {
      id: null,
      name: "Usuario",
      activeTrips: 0,
    },
    nextTrip: null,
    recommendedGuides: [],
    destinations: [],
    savedGuides: [],
  };

  const dom = {
    welcomeTitle: null,
    msgBadge: null,
    userName: null,
    nextTripMedia: null,
    nextTripDestination: null,
    nextTripTitle: null,
    nextTripDates: null,
    nextTripStatus: null,
    nextTripGuideAvatar: null,
    nextTripGuideName: null,
    btnChatGuide: null,
    btnTripDetails: null,
    btnTripManage: null,
    recommendedGuides: null,
    destinationGrid: null,
    savedGuides: null,
    btnViewAllGuides: null,
    btnSavedAll: null,
    btnExploreMore: null,
  };

  const formatMoneyMXN = (value) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const loadingMarkup = (label, compact = false) => `
    <div class="guide-loading ${compact ? "guide-loading--compact" : ""}" role="status" aria-live="polite" aria-busy="true">
      <span class="guide-loading__spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `;

  const emptyMarkup = (label, compact = false) => `
    <div class="guide-loading ${compact ? "guide-loading--compact" : ""}" role="status" aria-live="polite" aria-busy="false">
      <span>${label}</span>
    </div>
  `;

  function setText(node, value) {
    if (node) node.textContent = value;
  }

  function isRoleLabel(value) {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return ["turista", "tourist", "guia", "guide", "usuario", "user", "viajero", "traveler"].includes(normalized);
  }

  function resolveDisplayName(...candidates) {
    for (const candidate of candidates) {
      const value = String(candidate || "").trim();
      if (!value || isRoleLabel(value)) continue;
      return value;
    }
    return "Usuario";
  }

  function getTouristId() {
    const snapshot = window.KCAuthState?.getSnapshot?.();
    return snapshot?.touristId || snapshot?.userId || null;
  }

  function bind() {
    dom.welcomeTitle = document.getElementById("welcomeTitle");
    dom.msgBadge = document.getElementById("msgBadge");
    dom.userName = document.getElementById("userName");
    dom.nextTripMedia = document.getElementById("nextTripMedia");
    dom.nextTripDestination = document.getElementById("nextTripDestination");
    dom.nextTripTitle = document.getElementById("nextTripTitle");
    dom.nextTripDates = document.getElementById("nextTripDates");
    dom.nextTripStatus = document.getElementById("nextTripStatus");
    dom.nextTripGuideAvatar = document.getElementById("nextTripGuideAvatar");
    dom.nextTripGuideName = document.getElementById("nextTripGuideName");
    dom.btnChatGuide = document.getElementById("btnChatGuide");
    dom.btnTripDetails = document.getElementById("btnTripDetails");
    dom.btnTripManage = document.getElementById("btnTripManage");
    dom.recommendedGuides = document.getElementById("recommendedGuides");
    dom.destinationGrid = document.getElementById("destinationGrid");
    dom.savedGuides = document.getElementById("savedGuides");
    dom.btnViewAllGuides = document.getElementById("btnViewAllGuides");
    dom.btnSavedAll = document.getElementById("btnSavedAll");
    dom.btnExploreMore = document.getElementById("btnExploreMore");

    dom.btnChatGuide?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("tourist-chat:open"));
    });
    dom.btnTripDetails?.addEventListener("click", () => {
      window.location.href = "./trips.html";
    });
    dom.btnTripManage?.addEventListener("click", () => {
      window.location.href = "./trips.html";
    });
    dom.btnViewAllGuides?.addEventListener("click", () => {
      window.location.href = "./explore.html";
    });
    dom.btnSavedAll?.addEventListener("click", () => {
      window.location.href = "./favorites.html";
    });
    dom.btnExploreMore?.addEventListener("click", () => {
      window.location.href = "./explore.html";
    });
  }

  function renderUser() {
    const fullName = resolveDisplayName(state.user.name);
    const firstName = fullName.split(/\s+/).filter(Boolean)[0] || "Usuario";
    setText(dom.userName, fullName);
    setText(dom.welcomeTitle, `Hola, ${firstName}`);
    if (dom.msgBadge) {
      dom.msgBadge.textContent = String(state.user.activeTrips);
      dom.msgBadge.setAttribute("aria-label", `${state.user.activeTrips} viajes activos`);
    }
  }

  function renderNextTrip() {
    const trip = state.nextTrip;
    if (!trip) {
      if (dom.nextTripMedia) {
        dom.nextTripMedia.style.backgroundImage = `url('${NEXT_TRIP_FALLBACK_ASSET}')`;
      }
      setText(dom.nextTripDestination, "Sin viaje próximo");
      setText(dom.nextTripTitle, "Aún no tienes una reserva confirmada");
      setText(dom.nextTripDates, "Cuando reserves una experiencia, aparecerá aquí.");
      setText(dom.nextTripStatus, "Pendiente");
      setText(dom.nextTripGuideName, "Sin guía asignado");
      if (dom.nextTripGuideAvatar) {
        dom.nextTripGuideAvatar.style.backgroundImage = `url('${GUIDE_AVATAR_ASSET}')`;
        dom.nextTripGuideAvatar.textContent = "";
      }
      return;
    }

    if (dom.nextTripMedia) {
      dom.nextTripMedia.style.backgroundImage = `url('${trip.imageUrl || NEXT_TRIP_FALLBACK_ASSET}')`;
    }
    setText(dom.nextTripDestination, trip.destination || "Destino confirmado");
    setText(dom.nextTripTitle, trip.title || "Reserva confirmada");
    setText(dom.nextTripDates, trip.datesLabel || "Fecha por confirmar");
    setText(dom.nextTripStatus, trip.statusLabel || "Confirmado");
    setText(dom.nextTripGuideName, trip.guide?.name || "Guía asignado");
    if (dom.nextTripGuideAvatar) {
      dom.nextTripGuideAvatar.style.backgroundImage = `url('${GUIDE_AVATAR_ASSET}')`;
      dom.nextTripGuideAvatar.textContent = "";
    }
  }

  function renderRecommendedGuides() {
    if (!dom.recommendedGuides) return;
    if (!state.recommendedGuides.length) {
      dom.recommendedGuides.innerHTML = emptyMarkup("No hay guías recomendados disponibles todavía.");
      return;
    }

    dom.recommendedGuides.innerHTML = state.recommendedGuides
      .map(
        (guide) => `
          <article class="guide-card">
            <div class="guide-card__media" style="background-image:url('${GUIDE_AVATAR_ASSET}');">
              <div class="guide-card__rating">
                <span class="material-symbols-outlined" aria-hidden="true">star</span>
                <span>${Number(guide.rating || 0).toFixed(1)}</span>
              </div>
            </div>
            <div class="guide-card__body">
              <h3 class="guide-card__name">${guide.name || "Guía"}</h3>
              <p class="guide-card__desc">${guide.description || guide.bio || "Perfil disponible en Kin Conecta."}</p>
              <div class="guide-card__footer">
                <div class="guide-card__price"><strong>${formatMoneyMXN(guide.price || 0)}</strong> / hora</div>
                <button class="guide-card__btn" type="button" data-chat-guide="${guide.id}">
                  Contactar
                  <span class="material-symbols-outlined" aria-hidden="true">send</span>
                </button>
              </div>
            </div>
          </article>
        `,
      )
      .join("");

    dom.recommendedGuides.querySelectorAll("[data-chat-guide]").forEach((button) => {
      button.addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("tourist-chat:open"));
      });
    });
  }

  function renderDestinations() {
    if (!dom.destinationGrid) return;
    if (!state.destinations.length) {
      dom.destinationGrid.innerHTML = emptyMarkup("No hay destinos publicados por el momento.");
      return;
    }

    dom.destinationGrid.innerHTML = state.destinations
      .map(
        (destination) => `
          <div class="destination-card ${destination.isFeatured || destination.wide ? "destination-card--wide" : ""}">
            <div class="destination-card__media" style="background-image:url('${destination.imageUrl || ""}');"></div>
            <div class="destination-card__overlay" aria-hidden="true"></div>
            <div class="destination-card__content">
              <h3 class="destination-card__title">${destination.title || "Destino"}</h3>
              <p class="destination-card__subtitle">${destination.subtitle || destination.description || "Explora nuevas experiencias."}</p>
            </div>
          </div>
        `,
      )
      .join("");

    dom.destinationGrid.querySelectorAll(".destination-card").forEach((card) => {
      card.addEventListener("click", () => {
        window.location.href = "./explore.html";
      });
    });
  }

  function renderSavedGuides() {
    if (!dom.savedGuides) return;
    if (!state.savedGuides.length) {
      dom.savedGuides.innerHTML = emptyMarkup("Aún no has guardado guías.", true);
      return;
    }

    dom.savedGuides.innerHTML = state.savedGuides
      .map(
        (guide) => `
          <li class="saved-item">
            <div class="saved-item__avatar" style="background-image:url('${GUIDE_AVATAR_ASSET}');"></div>
            <div class="saved-item__meta">
              <div class="saved-item__name">${guide.name || "Guía"}</div>
              <div class="saved-item__place">${guide.location || guide.place || "México"}</div>
            </div>
          </li>
        `,
      )
      .join("");
  }

  function renderLoadingState() {
    setText(dom.welcomeTitle, "Hola");
    if (dom.recommendedGuides) {
      dom.recommendedGuides.innerHTML = loadingMarkup("Cargando guías recomendados...");
    }
    if (dom.destinationGrid) {
      dom.destinationGrid.innerHTML = loadingMarkup("Cargando destinos...");
    }
    if (dom.savedGuides) {
      dom.savedGuides.innerHTML = loadingMarkup("Cargando guías guardados...", true);
    }
  }

  async function hydrateFromApi() {
    const touristId = getTouristId();
    const api = window.KCTouristApi;
    const currentUser = (await window.KCAuthState?.getCurrentUser?.()) || null;

    if (currentUser?.fullName) {
      state.user.name = resolveDisplayName(currentUser.fullName, state.user.name);
      state.user.id = currentUser.userId || touristId;
    }

    if (!api?.dashboard) {
      return;
    }

    const [summaryRes, nextTripRes, guidesRes, destinationsRes, savedRes] = await Promise.all([
      api.dashboard.getSummary(touristId),
      api.dashboard.getNextTrip(touristId),
      api.dashboard.getRecommendedGuides({ page: 0, size: 6 }),
      api.dashboard.getPopularDestinations({ page: 0, size: 6 }),
      api.dashboard.getSavedGuides({ page: 0, size: 6 }, touristId),
    ]);

    const summary = summaryRes?.data || {};
    state.user.name = resolveDisplayName(summary.fullName, summary.name, state.user.name);
    state.user.activeTrips = Number(summary.activeTrips || 0);
    state.nextTrip = nextTripRes?.data || null;
    state.recommendedGuides = guidesRes?.data?.items || [];
    state.destinations = destinationsRes?.data?.items || [];
    state.savedGuides = savedRes?.data?.items || [];
  }

  async function init() {
    bind();
    renderLoadingState();

    try {
      await hydrateFromApi();
    } catch (error) {
      console.error("No se pudo cargar el dashboard del turista.", error);
    }

    renderUser();
    renderNextTrip();
    renderRecommendedGuides();
    renderDestinations();
    renderSavedGuides();
  }

  return { init };
})();

const bootstrapTouristDashboard = () => {
  const run = () => TouristDashboardApp.init();
  const sidebarReady = window.__touristSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapTouristDashboard, { once: true });
} else {
  bootstrapTouristDashboard();
}

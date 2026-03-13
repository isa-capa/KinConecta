/* =========================================================
   Guía - Perfil público
   Base para consumir perfil, tours y reseñas desde API.
   ========================================================= */

const GuidePublicProfileApp = (() => {
  const openUnderConstructionModal = () => {
    if (window.KCUnderConstruction?.open) {
      window.KCUnderConstruction.open();
      return;
    }
    window.alert("Aun estamos trabajando en esto.");
  };

  const params = new URLSearchParams(window.location.search);
  const state = {
    guideId: params.get("guideId") || "guide_001", // TODO(ROUTER): obtener del slug/url real
    profile: {
      name: "Juan Ariel Alarcón García",
      statusLabel: "DISPONIBLE HOY",
      locationLabel: "Ciudad de México, México",
      languagesLabel: "Español, Inglés, francés, alemán",
      rating: 4.8,
      reviewsCount: 80,
      tags: ["#Historia", "#Deporte", "#Tecnología"],
      priceLabel: "$40 USD / hora",
      about:
        "¡Hola! Soy Juan, apasionado por la historia y la tecnología de Ciudad de México. Llevo alrededor de 3 años guiando viajeros.",
      stats: [
        { value: "3+", label: "Años de experiencia" },
        { value: "100+", label: "Tours" },
        { value: "4.8", label: "Calificación" },
        { value: "✔", label: "Verificado" },
      ],
      tours: [
        {
          id: "tour_1",
          title: "Función de Lucha Libre en vivo",
          rating: 4.5,
          duration: "6 horas",
          maxGroupLabel: "Máximo 4 personas",
          description: "Visita a la Arena México, la cuna del Consejo Mundial de Lucha Libre.",
          priceLabel: "$10 USD PP",
          badgeIcon: "sports_kabaddi",
          badgeText: "Deporte",
          imageUrl: "https://luchacentral.com/wp-content/uploads/IMG_4198-1.jpg",
        },
      ],
      reviews: [
        {
          id: "review_1",
          author: "Mariana C.",
          starsText: "★★★★★",
          comment: "Excelente experiencia. Súper auténtico y profesional.",
        },
      ],
    },
  };

  const dom = {
    name: null,
    status: null,
    location: null,
    languages: null,
    ratingMeta: null,
    tags: null,
    price: null,
    about: null,
    stats: null,
    toursList: null,
    reviewsList: null,
    contactBtn: null,
  };

  const loadingMarkup = (label) => `
    <div class="guide-loading" role="status" aria-live="polite" aria-busy="true">
      <span class="guide-loading__spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `;

  function renderLoadingState() {
    if (dom.toursList) {
      dom.toursList.innerHTML = loadingMarkup("Cargando tours...");
    }
    if (dom.reviewsList) {
      dom.reviewsList.innerHTML = loadingMarkup("Cargando reseñas...");
    }
  }

  function mapApiProfile(raw) {
    // TODO(BACKEND): homologar DTO final de perfil publico.
    if (!raw || typeof raw !== "object") return;

    state.profile.name = raw.name ?? state.profile.name;
    state.profile.statusLabel = raw.statusLabel ?? state.profile.statusLabel;
    state.profile.locationLabel = raw.locationLabel ?? state.profile.locationLabel;
    state.profile.languagesLabel = raw.languagesLabel ?? state.profile.languagesLabel;
    state.profile.rating = Number(raw.rating ?? state.profile.rating);
    state.profile.reviewsCount = Number(raw.reviewsCount ?? state.profile.reviewsCount);
    state.profile.tags = Array.isArray(raw.tags) ? raw.tags : state.profile.tags;
    state.profile.priceLabel = raw.priceLabel ?? state.profile.priceLabel;
    state.profile.about = raw.about ?? state.profile.about;
    state.profile.stats = Array.isArray(raw.stats) ? raw.stats : state.profile.stats;
    state.profile.tours = Array.isArray(raw.tours) ? raw.tours : state.profile.tours;
    state.profile.reviews = Array.isArray(raw.reviews) ? raw.reviews : state.profile.reviews;
  }

  async function hydrateFromApi() {
    if (!window.KCGuideApi) return;

    try {
      const response = await window.KCGuideApi.profile.getPublicProfile(state.guideId);
      mapApiProfile(response?.data || {});
    } catch (error) {
      console.warn("Public profile API fallback enabled:", error);
    }
  }

  function renderBasicInfo() {
    dom.name.textContent = state.profile.name;
    dom.status.textContent = state.profile.statusLabel;

    dom.location.innerHTML = `
      <span class="material-symbols-outlined">location_on</span>
      ${state.profile.locationLabel}
    `;

    dom.languages.innerHTML = `
      <span class="material-symbols-outlined">translate</span>
      ${state.profile.languagesLabel}
    `;

    dom.ratingMeta.innerHTML = `
      <span class="material-symbols-outlined filled">star</span>
      <strong>${Number(state.profile.rating).toFixed(1)}</strong>
      <span class="reviews">(${state.profile.reviewsCount} reseñas)</span>
    `;

    dom.tags.innerHTML = state.profile.tags.map((tag) => `<span>${tag}</span>`).join("");
    dom.price.innerHTML = `${state.profile.priceLabel.replace("/ hora", "")} <span>/ hora</span>`;
    dom.about.textContent = state.profile.about;
  }

  function renderStats() {
    dom.stats.innerHTML = state.profile.stats
      .map(
        (item) => `
          <div>
            <strong>${item.value}</strong>
            <span>${item.label}</span>
          </div>
        `,
      )
      .join("");
  }

  function renderTours() {
    dom.toursList.innerHTML = state.profile.tours
      .map(
        (tour) => `
          <div class="tour-card">
            <div class="tour-img" style="background: url('${tour.imageUrl}') center/cover;">
              <div class="tour-badge">
                <span class="material-symbols-outlined">${tour.badgeIcon || "map"}</span>
                ${tour.badgeText || "Tour"}
              </div>
            </div>
            <div class="tour-body">
              <div class="tour-header">
                <h4>${tour.title}</h4>
                <div class="tour-rating">
                  <span class="material-symbols-outlined filled">star</span>
                  ${Number(tour.rating || 0).toFixed(1)}
                </div>
              </div>
              <div class="tour-details">
                <span>
                  <span class="material-symbols-outlined">schedule</span>
                  ${tour.duration || "-"}
                </span>
                <span>
                  <span class="material-symbols-outlined">group</span>
                  ${tour.maxGroupLabel || "-"}
                </span>
              </div>
              <p class="tour-desc">${tour.description || ""}</p>
              <div class="tour-footer">
                <div>
                  <small>Desde</small>
                  <p class="tour-price">${tour.priceLabel || "-"}</p>
                </div>
                <button class="secondary-btn" type="button" data-book-tour="${tour.id}">
                  Reservar
                </button>
              </div>
            </div>
          </div>
        `,
      )
      .join("");
  }

  function renderReviews() {
    dom.reviewsList.innerHTML = state.profile.reviews
      .map(
        (review) => `
          <div class="review-card">
            <div class="review-header">
              <strong>${review.author}</strong>
              <span>${review.starsText || "★★★★★"}</span>
            </div>
            <p>${review.comment || ""}</p>
          </div>
        `,
      )
      .join("");
  }

  function bind() {
    dom.name = document.getElementById("publicGuideName");
    dom.status = document.getElementById("publicGuideStatus");
    dom.location = document.getElementById("publicGuideLocation");
    dom.languages = document.getElementById("publicGuideLanguages");
    dom.ratingMeta = document.getElementById("publicGuideRatingMeta");
    dom.tags = document.getElementById("publicGuideTags");
    dom.price = document.getElementById("publicGuidePrice");
    dom.about = document.getElementById("publicGuideAbout");
    dom.stats = document.getElementById("publicGuideStats");
    dom.toursList = document.getElementById("publicToursList");
    dom.reviewsList = document.getElementById("publicReviewsList");
    dom.contactBtn = document.querySelector(".hero-cta .primary-btn");

    dom.contactBtn?.addEventListener("click", () => {
      // TODO(BACKEND): abrir chat con guia o crear hilo nuevo.
      window.dispatchEvent(new CustomEvent("guide-chat:open"));
    });

    dom.toursList?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-book-tour]");
      if (!button) return;
      openUnderConstructionModal();
    });
  }

  function renderAll() {
    renderBasicInfo();
    renderStats();
    renderTours();
    renderReviews();
  }

  async function init() {
    bind();
    renderLoadingState();
    await hydrateFromApi();
    renderAll();
  }

  return { init };
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => GuidePublicProfileApp.init(), { once: true });
} else {
  GuidePublicProfileApp.init();
}

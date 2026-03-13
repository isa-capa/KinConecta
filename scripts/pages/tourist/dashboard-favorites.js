const TouristFavoritesApp = (() => {
  const state = {
    touristId: null,
    currentUser: null,
    activeTab: "guides",
    guides: [],
    experiences: [],
  };

  const fallback = {
    guides: [],
    experiences: [],
  };

  const dom = {
    pageTitle: null,
    pageSubtitle: null,
    sidebarUserName: null,
    tabs: [],
    countGuides: null,
    countExperiences: null,
    cards: null,
    searchInput: null,
    btnChat: null,
    btnNewTrip: null,
  };

  const loadingMarkup = (label, compact = false) => `
    <div class="guide-loading ${compact ? "guide-loading--compact" : ""}" role="status" aria-live="polite" aria-busy="true">
      <span class="guide-loading__spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `;

  function renderLoadingState() {
    if (dom.pageTitle) dom.pageTitle.textContent = "Mis favoritos";
    if (dom.pageSubtitle) dom.pageSubtitle.textContent = "Cargando información del usuario...";
    if (dom.cards) {
      dom.cards.innerHTML = loadingMarkup("Cargando favoritos...");
    }
  }

  function getCurrentTouristId() {
    const direct = window.localStorage.getItem("kc_tourist_id");
    const directDigits = String(direct || "").match(/\d+/g);
    const directParsed = Number(directDigits ? directDigits.join("") : direct);
    if (Number.isFinite(directParsed) && directParsed > 0) return directParsed;

    try {
      const rawSession = window.localStorage.getItem("kc_temp_auth_session_v1");
      const session = rawSession ? JSON.parse(rawSession) : null;
      const role = String(session?.role || "").trim().toLowerCase();
      const digits = String(session?.userId || "").match(/\d+/g);
      const parsed = Number(digits ? digits.join("") : session?.userId);
      if (role === "tourist" && Number.isFinite(parsed) && parsed > 0) {
        window.localStorage.setItem("kc_tourist_id", String(parsed));
        return parsed;
      }
    } catch (error) {
      console.warn("No se pudo resolver el touristId desde la sesion local.", error);
    }

    return null;
  }

  async function hydrateCurrentUser() {
    state.touristId = getCurrentTouristId();
    if (!window.KCTouristApi?.profile?.getMe || !state.touristId) return;

    try {
      const response = await window.KCTouristApi.profile.getMe(state.touristId);
      const profile = response?.data || {};
      const name = String(profile.name || profile.fullName || "").trim();
      if (!name) return;

      state.currentUser = {
        name,
        location: String(profile.location || "").trim(),
      };

      try {
        const rawSession = window.localStorage.getItem("kc_temp_auth_session_v1");
        const session = rawSession ? JSON.parse(rawSession) : {};
        window.localStorage.setItem(
          "kc_temp_auth_session_v1",
          JSON.stringify({
            ...session,
            role: "tourist",
            userId: String(state.touristId),
            fullName: name,
          }),
        );
      } catch (error) {
        console.warn("No se pudo actualizar la sesion local con el nombre del turista.", error);
      }
    } catch (error) {
      console.warn("No se pudo cargar el usuario actual en favoritos desde API.", error);
    }
  }

  function renderCurrentUser() {
    if (dom.sidebarUserName && state.currentUser?.name) {
      dom.sidebarUserName.textContent = state.currentUser.name;
    }
    if (dom.pageTitle) {
      dom.pageTitle.textContent = state.currentUser?.name
        ? `Favoritos de ${state.currentUser.name}`
        : "Mis favoritos";
    }
    if (dom.pageSubtitle) {
      dom.pageSubtitle.textContent = state.currentUser?.location
        ? `Colección de guías y experiencias guardadas desde ${state.currentUser.location}.`
        : "Colección de guías y experiencias guardadas.";
    }
  }

  function mapFavorite(raw) {
    return {
      id: raw.id,
      title: raw.title || raw.name || "Favorito",
      location: raw.location || "México",
      description: raw.description || "Sin descripción.",
      priceLabel: raw.priceLabel || raw.priceText || "$0 MXN",
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      image:
        raw.imageUrl ||
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
    };
  }

  async function hydrateFromApi() {
    if (!window.KCTouristApi) {
      state.guides = fallback.guides.slice();
      state.experiences = fallback.experiences.slice();
      return;
    }

    try {
      const [guidesRes, expRes] = await Promise.all([
        window.KCTouristApi.favorites.listGuides({ page: 0, size: 24 }, state.touristId),
        window.KCTouristApi.favorites.listExperiences({ page: 0, size: 24 }, state.touristId),
      ]);

      const guides = guidesRes?.data?.items || guidesRes?.data || [];
      const experiences = expRes?.data?.items || expRes?.data || [];
      state.guides = Array.isArray(guides) ? guides.map(mapFavorite) : fallback.guides.slice();
      state.experiences = Array.isArray(experiences)
        ? experiences.map(mapFavorite)
        : fallback.experiences.slice();
    } catch (error) {
      console.warn("No se pudieron cargar los favoritos desde la API.", error);
      state.guides = fallback.guides.slice();
      state.experiences = fallback.experiences.slice();
    }
  }

  function getActiveCollection() {
    return state.activeTab === "guides" ? state.guides : state.experiences;
  }

  function applySearch(collection) {
    const query = dom.searchInput?.value?.trim().toLowerCase() || "";
    if (!query) return collection;

    return collection.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }

  function updateCounters() {
    if (dom.countGuides) dom.countGuides.textContent = String(state.guides.length);
    if (dom.countExperiences) dom.countExperiences.textContent = String(state.experiences.length);
  }

  function renderCards() {
    if (!dom.cards) return;
    const rows = applySearch(getActiveCollection());
    dom.cards.innerHTML = "";

    if (!rows.length) {
      dom.cards.innerHTML = `
        <div class="guide-loading guide-loading--compact" role="status" aria-live="polite" aria-busy="false">
          <span>No tienes favoritos que coincidan con la búsqueda.</span>
        </div>
      `;
      return;
    }

    rows.forEach((item) => {
      const card = document.createElement("article");
      card.className = "favorite-card";
      card.innerHTML = `
        <div class="favorite-card__media" style="background-image:url('${item.image}');">
          <button class="favorite-card__remove" type="button" data-remove-id="${item.id}" aria-label="Quitar de favoritos">
            <span class="material-symbols-outlined">favorite</span>
          </button>
          <div class="favorite-card__tags">
            ${item.tags.map((tag) => `<span class="favorite-card__tag">${tag}</span>`).join("")}
          </div>
        </div>
        <div class="favorite-card__body">
          <div class="favorite-card__header">
            <h3 class="favorite-card__title">${item.title}</h3>
            <p class="favorite-card__price">${item.priceLabel}</p>
          </div>
          <p class="favorite-card__location">
            <span class="material-symbols-outlined">location_on</span>
            ${item.location}
          </p>
          <p class="favorite-card__description">${item.description}</p>
        </div>
      `;

      card.querySelector("[data-remove-id]")?.addEventListener("click", async (event) => {
        event.stopPropagation();
        const id = event.currentTarget.getAttribute("data-remove-id");
        try {
          if (window.KCTouristApi) {
            if (state.activeTab === "guides") {
              await window.KCTouristApi.favorites.removeGuide(id, state.touristId);
            } else {
              await window.KCTouristApi.favorites.removeExperience(id, state.touristId);
            }
          }
        } catch (error) {
          console.warn("Remove favorite pending backend implementation:", error);
        }

        if (state.activeTab === "guides") {
          state.guides = state.guides.filter((itemRow) => itemRow.id !== id);
        } else {
          state.experiences = state.experiences.filter((itemRow) => itemRow.id !== id);
        }
        updateCounters();
        renderCards();
      });

      dom.cards.appendChild(card);
    });
  }

  function setActiveTab(tabId) {
    state.activeTab = tabId;
    dom.tabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.tab === tabId);
    });
    renderCards();
  }

  function bind() {
    dom.pageTitle = document.querySelector(".tourist-section__title");
    dom.pageSubtitle = document.querySelector(".tourist-section__subtitle");
    dom.sidebarUserName = document.getElementById("userName");
    dom.tabs = [...document.querySelectorAll("[data-tab]")];
    dom.countGuides = document.getElementById("favoritesGuidesCount");
    dom.countExperiences = document.getElementById("favoritesExperiencesCount");
    dom.cards = document.getElementById("favoritesCards");
    dom.searchInput = document.getElementById("favoritesSearchInput");
    dom.btnChat = document.getElementById("btnChat");
    dom.btnNewTrip = document.getElementById("btnNewTrip");

    dom.tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setActiveTab(tab.dataset.tab || "guides");
      });
    });

    dom.searchInput?.addEventListener("input", renderCards);

    dom.btnChat?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("tourist-chat:open"));
    });

    dom.btnNewTrip?.addEventListener("click", () => {
      window.location.href = "./trips.html";
    });
  }

  async function init() {
    bind();
    renderLoadingState();
    await hydrateCurrentUser();
    renderCurrentUser();
    await hydrateFromApi();
    updateCounters();
    setActiveTab("guides");
  }

  return { init };
})();

const bootstrapTouristFavorites = () => {
  const run = () => TouristFavoritesApp.init();
  const sidebarReady = window.__touristSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapTouristFavorites, { once: true });
} else {
  bootstrapTouristFavorites();
}




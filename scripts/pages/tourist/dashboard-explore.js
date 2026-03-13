const TouristExploreApp = (() => {
  const openUnderConstructionModal = () => {
    if (window.KCUnderConstruction?.open) {
      window.KCUnderConstruction.open();
      return;
    }
    window.alert("Aun estamos trabajando en esto.");
  };

  const state = {
    touristId: null,
    currentUser: null,
    activeFilter: "all",
    items: [],
  };

  const fallbackItems = [];

  const dom = {
    pageTitle: null,
    pageSubtitle: null,
    sidebarUserName: null,
    searchInput: null,
    cards: null,
    filters: [],
    quickSearchBtn: null,
    btnChat: null,
    btnNewTrip: null,
  };

  const loadingMarkup = (label, compact = false) => `
    <div class="guide-loading ${compact ? "guide-loading--compact" : ""}" role="status" aria-live="polite" aria-busy="true">
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

  function renderLoadingState() {
    if (dom.pageTitle) dom.pageTitle.textContent = "Explorar";
    if (dom.pageSubtitle) dom.pageSubtitle.textContent = "Cargando información del usuario...";
    if (dom.cards) {
      dom.cards.innerHTML = loadingMarkup("Cargando experiencias...");
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
      console.warn("No se pudo cargar el usuario actual en explorar desde API.", error);
    }
  }

  function renderCurrentUser() {
    const name = state.currentUser?.name || "Explorar";
    if (dom.sidebarUserName && state.currentUser?.name) {
      dom.sidebarUserName.textContent = state.currentUser.name;
    }
    if (dom.pageTitle) {
      dom.pageTitle.textContent = state.currentUser?.name
        ? `Explorar para ${name}`
        : "Explorar destinos y guías";
    }
    if (dom.pageSubtitle) {
      const location = state.currentUser?.location;
      dom.pageSubtitle.textContent = location
        ? `Descubre experiencias y guías pensadas para ${location}.`
        : "Encuentra la experiencia ideal para tu siguiente aventura.";
    }
  }

  function mapExploreItem(raw) {
    return {
      id: raw.id,
      title: raw.title || raw.name || "Experiencia",
      location: raw.location || "México",
      category: (raw.category || "all").toLowerCase(),
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      rating: Number(raw.rating || 0),
      priceLabel: raw.priceLabel || raw.priceText || "$0 MXN",
      image: resolveTourImage(
        raw.imageUrl,
        raw.category,
        Array.isArray(raw.tags) ? raw.tags.join(" ") : "",
        raw.title,
        raw.location,
      ),
    };
  }

  async function hydrateFromApi() {
    if (!window.KCTouristApi) {
      state.items = fallbackItems.slice();
      return;
    }

    try {
      const response = await window.KCTouristApi.explore.listExperiences({
        page: 0,
        size: 24,
      }, state.touristId);
      const data = response?.data?.items || response?.data || [];
      state.items = Array.isArray(data) && data.length
        ? data.map(mapExploreItem)
        : fallbackItems.slice();
    } catch (error) {
      console.warn("No se pudieron cargar las experiencias desde la API.", error);
      state.items = fallbackItems.slice();
    }
  }

  function filterItems() {
    const query = dom.searchInput?.value?.trim().toLowerCase() || "";
    return state.items.filter((item) => {
      const passFilter =
        state.activeFilter === "all" || item.category === state.activeFilter;
      if (!passFilter) return false;

      if (!query) return true;
      return (
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }

  function renderCards() {
    if (!dom.cards) return;
    const rows = filterItems();
    dom.cards.innerHTML = "";

    if (!rows.length) {
      dom.cards.innerHTML = `
        <div class="guide-loading guide-loading--compact" role="status" aria-live="polite" aria-busy="false">
          <span>No se encontraron experiencias con esos filtros.</span>
        </div>
      `;
      return;
    }

    rows.forEach((item) => {
      const card = document.createElement("article");
      card.className = "explore-card";
      const mediaUrl = resolveTourImage(
        item.image,
        item.category,
        item.title,
        item.location,
        item.tags.join(" "),
      );
      card.innerHTML = `
        <div class="explore-card__media">
          <img class="explore-card__media-img" src="${mediaUrl}" alt="${item.title}" loading="lazy" />
          <button class="explore-card__favorite" type="button" data-toggle-favorite="${item.id}" aria-label="Agregar a favoritos">
            <span class="material-symbols-outlined">favorite</span>
          </button>
          <span class="explore-card__badge">Experiencia</span>
          <span class="explore-card__rating">
            <span class="material-symbols-outlined">star</span>
            ${item.rating.toFixed(1)}
          </span>
        </div>
        <div class="explore-card__body">
          <h3 class="explore-card__title">${item.title}</h3>
          <p class="explore-card__meta">
            <span class="material-symbols-outlined">location_on</span>
            ${item.location}
          </p>
          <div class="explore-card__tags">
            ${item.tags.map((tag) => `<span class="explore-card__tag">${tag}</span>`).join("")}
          </div>
          <div class="explore-card__footer">
            <span class="explore-card__price">${item.priceLabel}</span>
          </div>
        </div>
      `;

      card.querySelector("[data-toggle-favorite]")?.addEventListener("click", async (event) => {
        event.stopPropagation();
        const itemId = event.currentTarget.getAttribute("data-toggle-favorite");
        try {
          if (window.KCTouristApi) {
            await window.KCTouristApi.explore.toggleFavorite(itemId, state.touristId);
          }
        } catch (error) {
          console.warn("Toggle favorite pending backend implementation:", error);
        }
      });

      card.addEventListener("click", () => {
        openUnderConstructionModal();
      });

      dom.cards.appendChild(card);
    });
  }

  function setActiveFilter(nextFilter) {
    state.activeFilter = nextFilter;
    dom.filters.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.filter === nextFilter);
    });
    renderCards();
  }

  function bind() {
    dom.pageTitle = document.querySelector(".tourist-section__title");
    dom.pageSubtitle = document.querySelector(".tourist-section__subtitle");
    dom.sidebarUserName = document.getElementById("userName");
    dom.searchInput = document.getElementById("exploreSearchInput");
    dom.cards = document.getElementById("exploreCards");
    dom.filters = [...document.querySelectorAll("[data-filter]")];
    dom.quickSearchBtn = document.getElementById("exploreQuickSearch");
    dom.btnChat = document.getElementById("btnChat");
    dom.btnNewTrip = document.getElementById("btnNewTrip");

    dom.searchInput?.addEventListener("input", renderCards);
    dom.quickSearchBtn?.addEventListener("click", renderCards);

    dom.filters.forEach((button) => {
      button.addEventListener("click", () => {
        setActiveFilter(button.dataset.filter || "all");
      });
    });

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
    setActiveFilter("all");
  }

  return { init };
})();

const bootstrapTouristExplore = () => {
  const run = () => TouristExploreApp.init();
  const sidebarReady = window.__touristSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapTouristExplore, { once: true });
} else {
  bootstrapTouristExplore();
}



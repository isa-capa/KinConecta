const TOURIST_PROFILE_STORAGE_KEY = "kc_tourist_profile_v1";
const TOURIST_AVATAR_ASSET = "../../../assets/users/user_tourist.png";
const TOURIST_COVER_ASSET = "../../../assets/users/user_tourist_background.png";

const TouristProfileApp = (() => {
  const state = {
    profile: {
      name: "Usuario",
      location: "Sin ubicacion registrada",
      memberSince: "",
      badge: "Perfil en construccion",
      bio: "Aun no hay informacion disponible.",
      interests: [],
      travelStyle: "",
      tripType: "",
      languages: [],
      paceAndCompany: "",
      activityLevel: "",
      groupPreference: "",
      dietaryPreferences: "",
      planningLevel: "",
      amenities: "",
      transport: "",
      photoPreference: "",
      accessibility: "",
      additionalNotes: "",
      avatar: "",
      cover: "",
    },
    history: [],
  };

  const dom = {
    avatar: null,
    cover: null,
    name: null,
    location: null,
    memberSince: null,
    badge: null,
    bio: null,
    interests: null,
    travelStyle: null,
    tripType: null,
    languages: null,
    paceAndCompany: null,
    activityLevel: null,
    groupPreference: null,
    dietaryPreferences: null,
    planningLevel: null,
    amenities: null,
    transport: null,
    photoPreference: null,
    accessibility: null,
    additionalNotes: null,
    history: null,
  };

  const loadingMarkup = (label, compact = false) => `
    <div class="guide-loading ${compact ? "guide-loading--compact" : ""}" role="status" aria-live="polite" aria-busy="true">
      <span class="guide-loading__spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `;

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

  function bind() {
    dom.avatar = document.getElementById("profileAvatar");
    dom.cover = document.getElementById("profileCover");
    dom.name = document.getElementById("profileName");
    dom.location = document.getElementById("profileLocation");
    dom.memberSince = document.getElementById("profileMemberSince");
    dom.badge = document.getElementById("profileBadge");
    dom.bio = document.getElementById("profileBio");
    dom.interests = document.getElementById("profileInterests");
    dom.travelStyle = document.getElementById("profileTravelStyle");
    dom.tripType = document.getElementById("profileTripType");
    dom.languages = document.getElementById("profileLanguages");
    dom.paceAndCompany = document.getElementById("profilePaceAndCompany");
    dom.activityLevel = document.getElementById("profileActivityLevel");
    dom.groupPreference = document.getElementById("profileGroupPreference");
    dom.dietaryPreferences = document.getElementById("profileDietaryPreferences");
    dom.planningLevel = document.getElementById("profilePlanningLevel");
    dom.amenities = document.getElementById("profileAmenities");
    dom.transport = document.getElementById("profileTransport");
    dom.photoPreference = document.getElementById("profilePhotoPreference");
    dom.accessibility = document.getElementById("profileAccessibility");
    dom.additionalNotes = document.getElementById("profileAdditionalNotes");
    dom.history = document.getElementById("profileHistory");
  }

  function setText(node, value, fallback = "Sin informacion") {
    if (node) node.textContent = value || fallback;
  }

  function getTouristId() {
    const snapshot = window.KCAuthState?.getSnapshot?.();
    return snapshot?.touristId || snapshot?.userId || null;
  }

  function mapApiProfile(raw) {
    return {
      name: resolveDisplayName(raw.name, raw.fullName, state.profile.name),
      location: raw.location || state.profile.location,
      memberSince: raw.memberSince || "",
      badge: raw.badge || "Perfil activo",
      bio: raw.bio || "Aun no hay biografia registrada.",
      interests: Array.isArray(raw.interests) ? raw.interests : [],
      travelStyle: raw.travelStyle || "",
      tripType: raw.tripType || "",
      languages: Array.isArray(raw.languages) ? raw.languages : [],
      paceAndCompany: raw.paceAndCompany || "",
      activityLevel: raw.activityLevel || "",
      groupPreference: raw.groupPreference || "",
      dietaryPreferences: raw.dietaryPreferences || "",
      planningLevel: raw.planningLevel || "",
      amenities: raw.amenities || "",
      transport: raw.transport || "",
      photoPreference: raw.photoPreference || "",
      accessibility: raw.accessibility || "",
      additionalNotes: raw.additionalNotes || "",
      avatar: TOURIST_AVATAR_ASSET,
      cover: TOURIST_COVER_ASSET,
    };
  }

  function mapTrip(raw) {
    return {
      id: raw.id || raw.tripId,
      title: raw.title || "Viaje",
      dateLabel: raw.dateLabel || raw.date || "Sin fecha",
      image: raw.imageUrl || raw.image || "",
    };
  }

  function renderProfile() {
    if (dom.avatar) {
      dom.avatar.style.backgroundImage = state.profile.avatar ? `url('${state.profile.avatar}')` : "";
      dom.avatar.textContent = state.profile.avatar ? "" : "KC";
    }
    if (dom.cover) {
      dom.cover.style.backgroundImage = state.profile.cover ? `url('${state.profile.cover}')` : "";
    }

    setText(dom.name, resolveDisplayName(state.profile.name));
    setText(dom.location, state.profile.location);
    setText(dom.memberSince, state.profile.memberSince ? `Miembro desde ${state.profile.memberSince}` : "Miembro reciente");
    setText(dom.badge, state.profile.badge);
    setText(dom.bio, state.profile.bio);
    setText(dom.travelStyle, state.profile.travelStyle);
    setText(dom.tripType, state.profile.tripType);
    setText(dom.languages, state.profile.languages.join(", "));
    setText(dom.paceAndCompany, state.profile.paceAndCompany);
    setText(dom.activityLevel, state.profile.activityLevel);
    setText(dom.groupPreference, state.profile.groupPreference);
    setText(dom.dietaryPreferences, state.profile.dietaryPreferences);
    setText(dom.planningLevel, state.profile.planningLevel);
    setText(dom.amenities, state.profile.amenities);
    setText(dom.transport, state.profile.transport);
    setText(dom.photoPreference, state.profile.photoPreference);
    setText(dom.accessibility, state.profile.accessibility);
    setText(dom.additionalNotes, state.profile.additionalNotes);

    if (dom.interests) {
      if (!state.profile.interests.length) {
        dom.interests.innerHTML = "<span>#Sin preferencias registradas</span>";
      } else {
        dom.interests.innerHTML = state.profile.interests.map((tag) => `<span>#${tag}</span>`).join("");
      }
    }
  }

  function renderHistory() {
    if (!dom.history) return;
    if (!state.history.length) {
      dom.history.innerHTML = `
        <div class="guide-loading guide-loading--compact" role="status" aria-live="polite" aria-busy="false">
          <span>No hay viajes para mostrar por ahora.</span>
        </div>
      `;
      return;
    }

    dom.history.innerHTML = state.history
      .map(
        (item) => `
          <article class="trip-history__item">
            <div class="trip-history__image" style="background-image:url('${item.image}');"></div>
            <div class="trip-history__body">
              <h4 class="trip-history__title">${item.title}</h4>
              <p class="trip-history__meta">
                <span class="material-symbols-outlined">calendar_month</span>
                ${item.dateLabel}
              </p>
            </div>
          </article>
        `,
      )
      .join("");
  }

  function renderLoadingState() {
    setText(dom.name, "Cargando perfil...");
    if (dom.interests) {
      dom.interests.innerHTML = loadingMarkup("Cargando intereses...", true);
    }
    if (dom.history) {
      dom.history.innerHTML = loadingMarkup("Cargando historial...");
    }
  }

  async function hydrateFromApi() {
    const touristId = getTouristId();
    const currentUser = (await window.KCAuthState?.getCurrentUser?.()) || null;

    if (currentUser?.fullName) {
      state.profile.name = resolveDisplayName(currentUser.fullName, state.profile.name);
    }

    if (!window.KCTouristApi?.profile?.getMe) {
      return;
    }

    const [profileRes, tripsRes] = await Promise.all([
      window.KCTouristApi.profile.getMe(touristId),
      window.KCTouristApi.trips.list({ page: 0, size: 6 }, touristId),
    ]);

    state.profile = mapApiProfile(profileRes?.data || {});
    state.history = Array.isArray(tripsRes?.data?.items || tripsRes?.data)
      ? (tripsRes?.data?.items || tripsRes?.data).slice(0, 6).map(mapTrip)
      : [];

    window.localStorage.setItem(TOURIST_PROFILE_STORAGE_KEY, JSON.stringify(state.profile));
  }

  async function init() {
    bind();
    renderLoadingState();

    try {
      await hydrateFromApi();
    } catch (error) {
      console.error("No se pudo cargar el perfil del turista.", error);
      try {
        const cached = JSON.parse(window.localStorage.getItem(TOURIST_PROFILE_STORAGE_KEY) || "null");
        if (cached && typeof cached === "object") {
          state.profile = { ...state.profile, ...cached };
        }
      } catch (_error) {
        // Ignorar cache invalido.
      }
    }

    renderProfile();
    renderHistory();
  }

  return { init };
})();

const bootstrapTouristProfile = () => {
  const run = () => TouristProfileApp.init();
  const sidebarReady = window.__touristSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapTouristProfile, { once: true });
} else {
  bootstrapTouristProfile();
}

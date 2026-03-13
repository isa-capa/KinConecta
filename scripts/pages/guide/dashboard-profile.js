const GUIDE_PROFILE_STORAGE_KEY = "kc_guide_profile_v1";
const GUIDE_AVATAR_ASSET = "../../../assets/users/user_guide.png";
const GUIDE_COVER_ASSET = "../../../assets/users/user_guide_background.png";

const GuideProfileApp = (() => {
  const state = {
    profile: {
      name: "Usuario",
      summary: "Aun no hay informacion publica disponible.",
      story: "",
      statusText: "PERFIL EN PROCESO",
      hourlyRate: "Sin tarifa registrada",
      rating: 0,
      reviewsCount: 0,
      locationLabel: "Sin ubicacion registrada",
      areasExperience: [],
      locations: [],
      experienceLevel: "",
      languages: [],
      style: "",
      groupSize: "",
      tourIntensity: "",
      transportOffered: "",
      certifications: [],
      adaptations: [],
      photoStyle: "",
      additionalNotes: "",
      coverImage: "",
      avatarImage: "",
      post: {
        text: "",
        image: "",
        caption: "",
        publishedAt: "",
      },
      updatedAt: "",
    },
  };

  const dom = {
    loading: null,
    social: null,
    cover: null,
    avatar: null,
    postAvatar: null,
    postImage: null,
    areasTags: null,
    locationsList: null,
    languagesList: null,
    certificationsList: null,
    adaptationsList: null,
    fieldMap: new Map(),
  };

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
    dom.loading = document.getElementById("profileLoading");
    dom.social = document.getElementById("profileSocial");
    dom.cover = document.getElementById("profileCover");
    dom.avatar = document.getElementById("profileAvatar");
    dom.postAvatar = document.getElementById("profilePostAvatar");
    dom.postImage = document.getElementById("profilePostImage");
    dom.areasTags = document.getElementById("profileAreasTags");
    dom.locationsList = document.getElementById("profileLocationsList");
    dom.languagesList = document.getElementById("profileLanguagesList");
    dom.certificationsList = document.getElementById("profileCertificationsList");
    dom.adaptationsList = document.getElementById("profileAdaptationsList");

    document.querySelectorAll("[data-profile-field]").forEach((node) => {
      const key = node.getAttribute("data-profile-field");
      if (!key) return;
      const list = dom.fieldMap.get(key) || [];
      list.push(node);
      dom.fieldMap.set(key, list);
    });
  }

  function setField(key, value) {
    const nodes = dom.fieldMap.get(key) || [];
    nodes.forEach((node) => {
      node.textContent = value || "Sin informacion";
    });
  }

  function renderList(element, items, formatter) {
    if (!element) return;
    if (!items.length) {
      element.innerHTML = "<li>Sin informacion</li>";
      return;
    }

    element.innerHTML = items
      .map((item) => `<li>${typeof formatter === "function" ? formatter(item) : item}</li>`)
      .join("");
  }

  function formatUpdatedAt(value) {
    if (!value) return "Actualiza tu informacion para mantenerla al dia.";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Actualizacion reciente";
    return `Actualizado: ${date.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}`;
  }

  function formatPostDate(value) {
    if (!value) return "Sin publicaciones recientes";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Sin publicaciones recientes";
    return date.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
  }

  function formatRatingInline(profile) {
    return `${Number(profile.rating || 0).toFixed(1)} (${Number(profile.reviewsCount || 0)} reseñas)`;
  }

  function renderProfile() {
    const displayName = resolveDisplayName(state.profile.name);

    setField("name", displayName);
    setField("summary", state.profile.summary);
    setField("story", state.profile.story || "Aun no hay historia publicada.");
    setField("statusText", state.profile.statusText);
    setField("locationLabel", state.profile.locationLabel);
    setField("ratingInline", formatRatingInline(state.profile));
    setField("hourlyRate", state.profile.hourlyRate);
    setField("updatedAtText", formatUpdatedAt(state.profile.updatedAt));
    setField("postText", state.profile.post.text || "Aun no hay publicaciones destacadas.");
    setField("postCaption", state.profile.post.caption || "Sin pie de foto");
    setField("postDateText", formatPostDate(state.profile.post.publishedAt));
    setField("experienceLevel", state.profile.experienceLevel);
    setField("style", state.profile.style);
    setField("groupSize", state.profile.groupSize);
    setField("groupSizeShort", state.profile.groupSize || "Sin definir");
    setField("tourIntensity", state.profile.tourIntensity);
    setField("transportOffered", state.profile.transportOffered);
    setField("photoStyle", state.profile.photoStyle);
    setField("additionalNotes", state.profile.additionalNotes);

    renderList(dom.areasTags, state.profile.areasExperience, (item) => `#${String(item || "").replace(/^#+/, "")}`);
    renderList(dom.locationsList, state.profile.locations);
    renderList(dom.languagesList, state.profile.languages);
    renderList(dom.certificationsList, state.profile.certifications);
    renderList(dom.adaptationsList, state.profile.adaptations);

    if (dom.cover) {
      dom.cover.style.backgroundImage = state.profile.coverImage
        ? `linear-gradient(120deg, rgba(7, 80, 86, 0.45), rgba(6, 31, 43, 0.5)), url("${state.profile.coverImage}")`
        : "";
    }
    if (dom.avatar) {
      dom.avatar.src = state.profile.avatarImage || "";
      dom.avatar.alt = displayName;
    }
    if (dom.postAvatar) {
      dom.postAvatar.src = state.profile.avatarImage || "";
      dom.postAvatar.alt = displayName;
    }
    if (dom.postImage) {
      dom.postImage.src = state.profile.post.image || "";
      dom.postImage.alt = state.profile.post.caption || "Publicacion destacada";
    }
  }

  function mapApiProfile(payload) {
    return {
      name: resolveDisplayName(payload.fullName, payload.name, state.profile.name),
      summary: payload.summary || state.profile.summary,
      story: payload.story || "",
      statusText: payload.statusText || payload.availabilityLabel || state.profile.statusText,
      hourlyRate:
        payload.hourlyRateLabel ||
        (payload.hourlyRate ? `${payload.currency || "MXN"} ${payload.hourlyRate} / hora` : state.profile.hourlyRate),
      rating: Number(payload.rating || 0),
      reviewsCount: Number(payload.reviewsCount || 0),
      locationLabel: payload.locationLabel || state.profile.locationLabel,
      areasExperience: Array.isArray(payload.areasExperience) ? payload.areasExperience : [],
      locations: Array.isArray(payload.locations) ? payload.locations : [],
      experienceLevel: payload.experienceLevel || "",
      languages: Array.isArray(payload.languages) ? payload.languages : [],
      style: payload.style || "",
      groupSize: payload.groupSize || "",
      tourIntensity: payload.tourIntensity || "",
      transportOffered: payload.transportOffered || "",
      certifications: Array.isArray(payload.certifications) ? payload.certifications : [],
      adaptations: Array.isArray(payload.adaptations) ? payload.adaptations : [],
      photoStyle: payload.photoStyle || "",
      additionalNotes: payload.additionalNotes || "",
      coverImage: GUIDE_COVER_ASSET,
      avatarImage: GUIDE_AVATAR_ASSET,
      post: {
        text: payload.post?.text || "",
        image: payload.post?.image || "",
        caption: payload.post?.caption || "",
        publishedAt: payload.post?.publishedAt || "",
      },
      updatedAt: payload.updatedAt || "",
    };
  }

  function getGuideId() {
    const snapshot = window.KCAuthState?.getSnapshot?.();
    return snapshot?.guideId || snapshot?.userId || null;
  }

  async function hydrateFromApi() {
    const guideId = getGuideId();
    const currentUser = (await window.KCAuthState?.getCurrentUser?.()) || null;

    if (currentUser?.fullName) {
      state.profile.name = resolveDisplayName(currentUser.fullName, state.profile.name);
    }

    if (!window.KCGuideApi?.profile?.getPublicProfile) return;
    const response = await window.KCGuideApi.profile.getPublicProfile(guideId);
    state.profile = mapApiProfile(response?.data || {});
    window.localStorage.setItem(GUIDE_PROFILE_STORAGE_KEY, JSON.stringify(state.profile));
  }

  async function init() {
    bind();
    dom.loading?.removeAttribute("hidden");
    dom.social?.setAttribute("hidden", "hidden");

    try {
      await hydrateFromApi();
    } catch (error) {
      console.error("No se pudo cargar el perfil publico del guia.", error);
      try {
        const cached = JSON.parse(window.localStorage.getItem(GUIDE_PROFILE_STORAGE_KEY) || "null");
        if (cached && typeof cached === "object") {
          state.profile = { ...state.profile, ...cached };
        }
      } catch (_error) {
        // Ignorar cache invalido.
      }
    }

    renderProfile();
    dom.loading?.setAttribute("hidden", "hidden");
    dom.social?.removeAttribute("hidden");
  }

  return { init };
})();

const bootstrapGuideProfile = () => {
  const run = () => GuideProfileApp.init();
  const sidebarReady = window.__guideSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapGuideProfile, { once: true });
} else {
  bootstrapGuideProfile();
}

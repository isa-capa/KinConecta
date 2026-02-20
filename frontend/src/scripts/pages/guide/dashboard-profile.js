/* =========================================================
   Guía - Perfil profesional (vista social)
   Carga de datos desde backend (pendiente) con fallback local.
   ========================================================= */

const GUIDE_PROFILE_STORAGE_KEY = "kc_guide_profile_v1";
const PROFILE_MIN_LOADING_MS = 420;
const PROFILE_FETCH_TIMEOUT_MS = 3500;

const DEFAULT_GUIDE_PROFILE = {
  name: "Juan Ariel Alarcón García",
  summary:
    "¡Hola! Soy Juan, apasionado de la historia y tecnología de Ciudad de México. Llevo alrededor de 3 años guiando viajeros de todo el mundo.",
  story:
    "Diseño recorridos auténticos con enfoque cultural y deportivo para que cada visitante viva la ciudad como local.",
  statusText: "DISPONIBLE HOY",
  hourlyRate: "$40 USD / hora",
  rating: 4.8,
  reviewsCount: 80,
  locationLabel: "Ciudad de México, México",
  areasExperience: ["Historia", "Deporte", "Tecnología"],
  locations: ["Centro Histórico", "Coyoacán", "Roma-Condesa", "Arena México"],
  experienceLevel: "3+ años de experiencia",
  languages: ["Español", "English", "Français", "Deutsch"],
  style:
    "Estilo cercano y dinámico. Combino contexto histórico con actividades que conectan con la energía de la ciudad.",
  groupSize: "Max 4 personas",
  tourIntensity: "Moderada",
  transportOffered: "Caminata guiada y transporte público",
  certifications: ["Guía verificado", "Atención al visitante"],
  adaptations: ["Ritmo flexible", "Tours para grupos pequeños"],
  photoStyle: "Fotografía urbana y documental",
  additionalNotes: "Siempre recomiendo calzado cómodo e hidratación.",
  coverImage:
    "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1600&q=80",
  avatarImage: "../../../assets/team/juanAboutUs.png",
  post: {
    text: "Hoy cerramos una experiencia de lucha libre y cultura local con un grupo increíble.",
    image:
      "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1600&q=80",
    caption: "Post destacado: función de lucha libre en vivo.",
    publishedAt: "",
  },
  updatedAt: "",
};

const GuideProfileApp = (() => {
  const state = {
    profile: cloneDefaultProfile(),
    media: {
      mode: null,
      file: null,
      objectUrl: "",
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

    coverEditBtn: null,
    avatarEditBtn: null,
    mediaModal: null,
    mediaBackdrop: null,
    mediaTitle: null,
    mediaHint: null,
    mediaInput: null,
    mediaPreview: null,
    mediaFilename: null,
    mediaStatus: null,
    mediaSave: null,
    mediaCancel: null,
    mediaClose: null,
  };

  function cloneDefaultProfile() {
    return {
      ...DEFAULT_GUIDE_PROFILE,
      areasExperience: [...DEFAULT_GUIDE_PROFILE.areasExperience],
      locations: [...DEFAULT_GUIDE_PROFILE.locations],
      languages: [...DEFAULT_GUIDE_PROFILE.languages],
      certifications: [...DEFAULT_GUIDE_PROFILE.certifications],
      adaptations: [...DEFAULT_GUIDE_PROFILE.adaptations],
      post: { ...DEFAULT_GUIDE_PROFILE.post },
    };
  }

  function delay(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function withTimeout(promise, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timeoutRef = window.setTimeout(() => {
        reject(new Error("Tiempo de espera excedido al cargar el perfil"));
      }, timeoutMs);

      Promise.resolve(promise)
        .then((result) => {
          window.clearTimeout(timeoutRef);
          resolve(result);
        })
        .catch((error) => {
          window.clearTimeout(timeoutRef);
          reject(error);
        });
    });
  }

  function normalizeText(rawValue, fallbackValue) {
    const value = String(rawValue || "").trim();
    return value || fallbackValue;
  }

  function normalizeList(rawValue, fallbackList) {
    if (Array.isArray(rawValue)) {
      const items = rawValue
        .map((item) => String(item || "").trim())
        .filter(Boolean);
      return items.length ? items : [...fallbackList];
    }

    if (typeof rawValue === "string") {
      const parsed = rawValue
        .split(/[\n,]+/g)
        .map((item) => item.trim())
        .filter(Boolean);
      return parsed.length ? parsed : [...fallbackList];
    }

    return [...fallbackList];
  }

  function normalizeNumber(rawValue, fallbackValue) {
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? parsed : fallbackValue;
  }

  function normalizeProfile(rawProfile) {
    const base = cloneDefaultProfile();
    if (!rawProfile || typeof rawProfile !== "object") return base;

    base.name = normalizeText(rawProfile.fullName ?? rawProfile.name, base.name);
    base.summary = normalizeText(rawProfile.summary, base.summary);
    base.story = normalizeText(rawProfile.story, base.story);
    base.statusText = normalizeText(rawProfile.statusText, base.statusText);
    base.hourlyRate = normalizeText(rawProfile.hourlyRate, base.hourlyRate);
    base.rating = normalizeNumber(rawProfile.rating, base.rating);
    base.reviewsCount = normalizeNumber(rawProfile.reviewsCount, base.reviewsCount);
    base.locationLabel = normalizeText(rawProfile.locationLabel, base.locationLabel);
    base.areasExperience = normalizeList(rawProfile.areasExperience, base.areasExperience);
    base.locations = normalizeList(rawProfile.locations, base.locations);
    base.experienceLevel = normalizeText(rawProfile.experienceLevel, base.experienceLevel);
    base.languages = normalizeList(rawProfile.languages, base.languages);
    base.style = normalizeText(rawProfile.style, base.style);
    base.groupSize = normalizeText(rawProfile.groupSize, base.groupSize);
    base.tourIntensity = normalizeText(rawProfile.tourIntensity, base.tourIntensity);
    base.transportOffered = normalizeText(rawProfile.transportOffered, base.transportOffered);
    base.certifications = normalizeList(rawProfile.certifications, base.certifications);
    base.adaptations = normalizeList(rawProfile.adaptations, base.adaptations);
    base.photoStyle = normalizeText(rawProfile.photoStyle, base.photoStyle);
    base.additionalNotes = normalizeText(rawProfile.additionalNotes, base.additionalNotes);
    base.coverImage = normalizeText(rawProfile.coverImage, base.coverImage);
    base.avatarImage = normalizeText(rawProfile.avatarImage, base.avatarImage);
    base.updatedAt = normalizeText(rawProfile.updatedAt, base.updatedAt);

    const rawPost = rawProfile.post && typeof rawProfile.post === "object" ? rawProfile.post : {};
    base.post = {
      text: normalizeText(rawPost.text, base.post.text),
      image: normalizeText(rawPost.image, base.post.image),
      caption: normalizeText(rawPost.caption, base.post.caption),
      publishedAt: normalizeText(rawPost.publishedAt, base.post.publishedAt),
    };

    return base;
  }

  function readProfileFromStorage() {
    try {
      const raw = window.localStorage.getItem(GUIDE_PROFILE_STORAGE_KEY);
      if (!raw) return cloneDefaultProfile();
      return normalizeProfile(JSON.parse(raw));
    } catch (error) {
      console.warn("No se pudo leer el perfil local. Se usarán datos por defecto.", error);
      return cloneDefaultProfile();
    }
  }

  function persistProfile(profile) {
    try {
      window.localStorage.setItem(GUIDE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.warn("No se pudo guardar el perfil localmente.", error);
    }
  }

  function formatDate(value, fallbackText) {
    if (!value) return fallbackText;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return fallbackText;
    return parsed.toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function formatUpdatedAt(value) {
    if (!value) return "Actualiza tu información para mantenerla al día.";
    return `Actualizado: ${formatDate(value, "Recientemente")}`;
  }

  function formatPostDate(value) {
    return formatDate(value, "Hace unas horas");
  }

  function formatRatingInline(profile) {
    return `${profile.rating.toFixed(1)} (${profile.reviewsCount} reseñas)`;
  }

  function getGroupSizeShort(rawGroupSize) {
    const raw = String(rawGroupSize || "").trim();
    if (!raw) return "No definido";
    if (raw.length <= 22) return raw;
    return `${raw.slice(0, 22)}...`;
  }

  function setField(key, value) {
    const nodes = dom.fieldMap.get(key);
    if (!nodes) return;
    nodes.forEach((node) => {
      node.textContent = value;
    });
  }

  function renderList(element, items, formatter) {
    if (!element) return;
    element.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = typeof formatter === "function" ? formatter(item) : item;
      element.appendChild(li);
    });
  }

  function setImageSource(element, source, fallback) {
    if (!element) return;
    element.src = source || fallback;
    element.onerror = () => {
      element.src = fallback;
    };
  }

  function renderProfile(profile) {
    setField("name", profile.name);
    setField("summary", profile.summary);
    setField("story", profile.story);
    setField("statusText", profile.statusText);
    setField("locationLabel", profile.locationLabel);
    setField("ratingInline", formatRatingInline(profile));
    setField("hourlyRate", profile.hourlyRate);
    setField("updatedAtText", formatUpdatedAt(profile.updatedAt));
    setField("postText", profile.post.text);
    setField("postCaption", profile.post.caption);
    setField("postDateText", formatPostDate(profile.post.publishedAt));
    setField("experienceLevel", profile.experienceLevel);
    setField("style", profile.style);
    setField("groupSize", profile.groupSize);
    setField("groupSizeShort", getGroupSizeShort(profile.groupSize));
    setField("tourIntensity", profile.tourIntensity);
    setField("transportOffered", profile.transportOffered);
    setField("photoStyle", profile.photoStyle);
    setField("additionalNotes", profile.additionalNotes);

    renderList(dom.areasTags, profile.areasExperience, (item) => {
      const clean = String(item || "").replace(/^#+/, "").trim();
      return `#${clean || "General"}`;
    });
    renderList(dom.locationsList, profile.locations);
    renderList(dom.languagesList, profile.languages);
    renderList(dom.certificationsList, profile.certifications);
    renderList(dom.adaptationsList, profile.adaptations);

    if (dom.cover) {
      dom.cover.style.backgroundImage = `linear-gradient(120deg, rgba(7, 80, 86, 0.45), rgba(6, 31, 43, 0.5)), url("${profile.coverImage}")`;
    }
    setImageSource(dom.avatar, profile.avatarImage, DEFAULT_GUIDE_PROFILE.avatarImage);
    setImageSource(dom.postAvatar, profile.avatarImage, DEFAULT_GUIDE_PROFILE.avatarImage);
    setImageSource(dom.postImage, profile.post.image, DEFAULT_GUIDE_PROFILE.post.image);
  }

  function revokeMediaObjectUrl() {
    if (!state.media.objectUrl) return;
    window.URL.revokeObjectURL(state.media.objectUrl);
    state.media.objectUrl = "";
  }

  function openMediaModal(mode) {
    state.media.mode = mode;
    state.media.file = null;
    revokeMediaObjectUrl();

    const isAvatar = mode === "avatar";
    const source = isAvatar ? state.profile.avatarImage : state.profile.coverImage;

    if (dom.mediaTitle) dom.mediaTitle.textContent = isAvatar ? "Editar foto de perfil" : "Editar portada";
    if (dom.mediaHint) {
      dom.mediaHint.textContent = isAvatar
        ? "Selecciona una foto de perfil para reemplazar la actual."
        : "Selecciona una imagen de portada para reemplazar la actual.";
    }
    if (dom.mediaFilename) dom.mediaFilename.textContent = "Ningún archivo seleccionado.";
    if (dom.mediaStatus) dom.mediaStatus.textContent = "";
    if (dom.mediaInput) dom.mediaInput.value = "";
    if (dom.mediaPreview) dom.mediaPreview.src = source;

    dom.mediaBackdrop?.removeAttribute("hidden");
    dom.mediaModal?.removeAttribute("hidden");
  }

  function closeMediaModal() {
    revokeMediaObjectUrl();
    state.media.mode = null;
    state.media.file = null;
    dom.mediaBackdrop?.setAttribute("hidden", "hidden");
    dom.mediaModal?.setAttribute("hidden", "hidden");
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("No se pudo leer el archivo seleccionado."));
      reader.readAsDataURL(file);
    });
  }

  function handleMediaInputChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      if (dom.mediaStatus) dom.mediaStatus.textContent = "Selecciona un archivo de imagen válido.";
      event.target.value = "";
      state.media.file = null;
      return;
    }

    state.media.file = file;
    if (dom.mediaFilename) dom.mediaFilename.textContent = file.name;
    if (dom.mediaStatus) dom.mediaStatus.textContent = "";

    revokeMediaObjectUrl();
    state.media.objectUrl = window.URL.createObjectURL(file);
    if (dom.mediaPreview) dom.mediaPreview.src = state.media.objectUrl;
  }

  async function syncMediaWithApi(mode, file, encodedImage) {
    const api = window.KCGuideApi;
    const guideId = getGuideId();

    if (mode === "avatar") {
      if (api?.profile?.uploadAvatar) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("avatar", file);
        await api.profile.uploadAvatar(guideId, formData);
        return;
      }

      console.info("TODO(BACKEND): implementar endpoint de avatar en KCGuideApi.profile.uploadAvatar.");
      return;
    }

    if (mode === "cover") {
      if (api?.profile?.uploadCover) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("cover", file);
        await api.profile.uploadCover(guideId, formData);
        return;
      }

      if (api?.profile?.updateSettings) {
        // TODO(BACKEND): confirmar contrato para actualizar portada (url/base64/mediaId).
        await api.profile.updateSettings(guideId, { coverImage: encodedImage, coverImageUrl: encodedImage });
        return;
      }

      console.info("TODO(BACKEND): definir uploadCover o updateSettings para portada.");
    }
  }

  async function handleMediaSave() {
    if (!state.media.mode) return;
    if (!state.media.file) {
      if (dom.mediaStatus) dom.mediaStatus.textContent = "Selecciona una imagen antes de guardar.";
      return;
    }

    dom.mediaSave?.setAttribute("disabled", "disabled");
    if (dom.mediaStatus) dom.mediaStatus.textContent = "Guardando imagen...";

    try {
      const encodedImage = await fileToDataUrl(state.media.file);

      if (state.media.mode === "avatar") {
        state.profile.avatarImage = encodedImage;
      } else {
        state.profile.coverImage = encodedImage;
      }

      persistProfile(state.profile);
      renderProfile(state.profile);

      try {
        await syncMediaWithApi(state.media.mode, state.media.file, encodedImage);
      } catch (apiError) {
        console.warn("No se pudo sincronizar la imagen con API. Se mantiene actualización local.", apiError);
      }

      if (dom.mediaStatus) dom.mediaStatus.textContent = "Imagen actualizada.";
      closeMediaModal();
    } catch (error) {
      if (dom.mediaStatus) dom.mediaStatus.textContent = error.message;
    } finally {
      dom.mediaSave?.removeAttribute("disabled");
    }
  }

  function setupMediaEditor() {
    dom.coverEditBtn?.addEventListener("click", () => openMediaModal("cover"));
    dom.avatarEditBtn?.addEventListener("click", () => openMediaModal("avatar"));

    dom.mediaInput?.addEventListener("change", handleMediaInputChange);
    dom.mediaSave?.addEventListener("click", handleMediaSave);
    dom.mediaCancel?.addEventListener("click", closeMediaModal);
    dom.mediaClose?.addEventListener("click", closeMediaModal);
    dom.mediaBackdrop?.addEventListener("click", closeMediaModal);

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMediaModal();
    });
  }

  function showLoading() {
    dom.loading?.removeAttribute("hidden");
    dom.social?.setAttribute("hidden", "hidden");
  }

  function hideLoading() {
    dom.loading?.setAttribute("hidden", "hidden");
    dom.social?.removeAttribute("hidden");
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

    dom.coverEditBtn = document.getElementById("profileCoverEditBtn");
    dom.avatarEditBtn = document.getElementById("profileAvatarEditBtn");
    dom.mediaModal = document.getElementById("profileMediaModal");
    dom.mediaBackdrop = document.getElementById("profileMediaBackdrop");
    dom.mediaTitle = document.getElementById("profileMediaModalTitle");
    dom.mediaHint = document.getElementById("profileMediaModalHint");
    dom.mediaInput = document.getElementById("profileMediaInput");
    dom.mediaPreview = document.getElementById("profileMediaPreview");
    dom.mediaFilename = document.getElementById("profileMediaFilename");
    dom.mediaStatus = document.getElementById("profileMediaStatus");
    dom.mediaSave = document.getElementById("profileMediaSave");
    dom.mediaCancel = document.getElementById("profileMediaCancel");
    dom.mediaClose = document.getElementById("profileMediaClose");

    document.querySelectorAll("[data-profile-field]").forEach((node) => {
      const key = node.getAttribute("data-profile-field");
      if (!key) return;
      const arr = dom.fieldMap.get(key) || [];
      arr.push(node);
      dom.fieldMap.set(key, arr);
    });
  }

  function mapApiProfile(payload) {
    return {
      name: payload.fullName ?? payload.name,
      summary: payload.summary,
      story: payload.story,
      statusText: payload.statusText ?? payload.availabilityLabel,
      hourlyRate:
        payload.hourlyRateLabel ||
        (payload.hourlyRate ? `$${payload.hourlyRate} ${payload.currency || "USD"} / hora` : ""),
      rating: payload.rating,
      reviewsCount: payload.reviewsCount,
      locationLabel: payload.locationLabel,
      areasExperience: payload.areasExperience,
      locations: payload.locations,
      experienceLevel: payload.experienceLevel,
      languages: payload.languages,
      style: payload.style,
      groupSize: payload.groupSize,
      tourIntensity: payload.tourIntensity,
      transportOffered: payload.transportOffered,
      certifications: payload.certifications,
      adaptations: payload.adaptations,
      photoStyle: payload.photoStyle,
      additionalNotes: payload.additionalNotes,
      coverImage: payload.coverImageUrl || payload.coverImage,
      avatarImage: payload.avatarUrl || payload.avatarImage,
      post: payload.post,
      updatedAt: payload.updatedAt,
    };
  }

  function getGuideId() {
    const fromStorage = window.localStorage.getItem("kc_guide_id");
    return fromStorage || "1";
  }

  async function fetchProfileFromApi() {
    const api = window.KCGuideApi;
    if (!api?.profile?.getPublicProfile) return null;

    const guideId = getGuideId();

    try {
      const response = await withTimeout(
        api.profile.getPublicProfile(guideId),
        PROFILE_FETCH_TIMEOUT_MS,
      );

      const payload = response?.data ?? response?.profile ?? response;
      if (!payload || typeof payload !== "object") return null;
      return normalizeProfile(mapApiProfile(payload));
    } catch (error) {
      console.warn("No se pudo cargar el perfil desde API. Se utilizará fallback local.", error);
      return null;
    }
  }

  async function loadProfile() {
    const startedAt = Date.now();
    let profile = await fetchProfileFromApi();

    if (!profile) {
      profile = readProfileFromStorage();
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed < PROFILE_MIN_LOADING_MS) {
      await delay(PROFILE_MIN_LOADING_MS - elapsed);
    }

    return profile;
  }

  async function init() {
    bind();
    setupMediaEditor();
    showLoading();

    try {
      state.profile = await loadProfile();
      renderProfile(state.profile);
    } finally {
      hideLoading();
    }
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

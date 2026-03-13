const GUIDE_PROFILE_STORAGE_KEY = "kc_guide_profile_v1";

const GuideProfileEditApp = (() => {
  const state = {
    isSaving: false,
    profile: {
      name: "",
      summary: "",
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
    },
  };

  const dom = {
    form: null,
    feedback: null,
    saveButton: null,
    profileNameInput: null,
    profileSummaryInput: null,
    areasExperienceInput: null,
    locationsInput: null,
    experienceLevelInput: null,
    languagesInput: null,
    styleInput: null,
    groupSizeInput: null,
    tourIntensityInput: null,
    transportOfferedInput: null,
    certificationsInput: null,
    adaptationsInput: null,
    photoStyleInput: null,
    additionalNotesInput: null,
  };

  function listToText(items) {
    return (Array.isArray(items) ? items : []).join("\n");
  }

  function textToList(rawValue) {
    return String(rawValue || "")
      .split(/[\n,]+/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function getGuideId() {
    const snapshot = window.KCAuthState?.getSnapshot?.();
    return snapshot?.guideId || snapshot?.userId || null;
  }

  function setFeedback(message, type = "") {
    if (!dom.feedback) return;
    dom.feedback.textContent = message;
    dom.feedback.classList.remove("is-success", "is-error");
    if (type) dom.feedback.classList.add(type);
  }

  function setSavingState(isSaving) {
    state.isSaving = isSaving;
    if (!dom.saveButton) return;
    dom.saveButton.disabled = isSaving;
    dom.saveButton.textContent = isSaving ? "Guardando..." : "Guardar cambios";
  }

  function bind() {
    dom.form = document.getElementById("profileEditForm");
    dom.feedback = document.getElementById("profileEditFeedback");
    dom.saveButton = document.getElementById("btnSaveProfile");
    dom.profileNameInput = document.getElementById("profileNameInput");
    dom.profileSummaryInput = document.getElementById("profileSummaryInput");
    dom.areasExperienceInput = document.getElementById("areasExperienceInput");
    dom.locationsInput = document.getElementById("locationsInput");
    dom.experienceLevelInput = document.getElementById("experienceLevelInput");
    dom.languagesInput = document.getElementById("languagesInput");
    dom.styleInput = document.getElementById("styleInput");
    dom.groupSizeInput = document.getElementById("groupSizeInput");
    dom.tourIntensityInput = document.getElementById("tourIntensityInput");
    dom.transportOfferedInput = document.getElementById("transportOfferedInput");
    dom.certificationsInput = document.getElementById("certificationsInput");
    dom.adaptationsInput = document.getElementById("adaptationsInput");
    dom.photoStyleInput = document.getElementById("photoStyleInput");
    dom.additionalNotesInput = document.getElementById("additionalNotesInput");

    dom.form?.addEventListener("submit", handleSubmit);
  }

  function fillForm(profile) {
    dom.profileNameInput.value = profile.name || "";
    dom.profileSummaryInput.value = profile.summary || "";
    dom.areasExperienceInput.value = listToText(profile.areasExperience);
    dom.locationsInput.value = listToText(profile.locations);
    dom.experienceLevelInput.value = profile.experienceLevel || "";
    dom.languagesInput.value = listToText(profile.languages);
    dom.styleInput.value = profile.style || "";
    dom.groupSizeInput.value = profile.groupSize || "";
    dom.tourIntensityInput.value = profile.tourIntensity || "";
    dom.transportOfferedInput.value = profile.transportOffered || "";
    dom.certificationsInput.value = listToText(profile.certifications);
    dom.adaptationsInput.value = listToText(profile.adaptations);
    dom.photoStyleInput.value = profile.photoStyle || "";
    dom.additionalNotesInput.value = profile.additionalNotes || "";
  }

  function collectPayload() {
    return {
      name: dom.profileNameInput.value.trim(),
      summary: dom.profileSummaryInput.value.trim(),
      areasExperience: textToList(dom.areasExperienceInput.value),
      locations: textToList(dom.locationsInput.value),
      experienceLevel: dom.experienceLevelInput.value.trim(),
      languages: textToList(dom.languagesInput.value),
      style: dom.styleInput.value.trim(),
      groupSize: dom.groupSizeInput.value.trim(),
      tourIntensity: dom.tourIntensityInput.value.trim(),
      transportOffered: dom.transportOfferedInput.value.trim(),
      certifications: textToList(dom.certificationsInput.value),
      adaptations: textToList(dom.adaptationsInput.value),
      photoStyle: dom.photoStyleInput.value.trim(),
      additionalNotes: dom.additionalNotesInput.value.trim(),
    };
  }

  function validatePayload(profile) {
    if (!profile.name) return "Ingresa el nombre del guía.";
    if (!profile.summary) return "Agrega una descripción breve.";
    if (!profile.areasExperience.length) return "Agrega al menos un área de experiencia.";
    if (!profile.locations.length) return "Agrega al menos una ubicación.";
    if (!profile.languages.length) return "Agrega al menos un idioma.";
    return "";
  }

  async function hydrateFromApi() {
    if (!window.KCGuideApi?.profile?.getPublicProfile) return;
    const response = await window.KCGuideApi.profile.getPublicProfile(getGuideId());
    const profile = response?.data || {};
    state.profile = {
      ...state.profile,
      name: profile.fullName || profile.name || "",
      summary: profile.summary || "",
      areasExperience: Array.isArray(profile.areasExperience) ? profile.areasExperience : [],
      locations: Array.isArray(profile.locations) ? profile.locations : [],
      experienceLevel: profile.experienceLevel || "",
      languages: Array.isArray(profile.languages) ? profile.languages : [],
      style: profile.style || "",
      groupSize: profile.groupSize || "",
      tourIntensity: profile.tourIntensity || "",
      transportOffered: profile.transportOffered || "",
      certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
      adaptations: Array.isArray(profile.adaptations) ? profile.adaptations : [],
      photoStyle: profile.photoStyle || "",
      additionalNotes: profile.additionalNotes || "",
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (state.isSaving) return;

    const payload = collectPayload();
    const validationError = validatePayload(payload);
    if (validationError) {
      setFeedback(validationError, "is-error");
      return;
    }

    setSavingState(true);
    setFeedback("Guardando cambios...");

    try {
      if (!window.KCGuideApi?.profile?.updateSettings) {
        throw new Error("KCGuideApi.profile.updateSettings no está disponible.");
      }

      await window.KCGuideApi.profile.updateSettings(getGuideId(), {
        summary: payload.summary,
        locationLabel: payload.locations.join(", "),
        experienceLevel: payload.experienceLevel,
        style: payload.style,
        groupSize: payload.groupSize,
        tourIntensity: payload.tourIntensity,
        transportOffered: payload.transportOffered,
        photoStyle: payload.photoStyle,
        additionalNotes: payload.additionalNotes,
      });

      window.localStorage.setItem(GUIDE_PROFILE_STORAGE_KEY, JSON.stringify(payload));
      setFeedback("Perfil actualizado correctamente. Redirigiendo...", "is-success");
      window.setTimeout(() => {
        window.location.href = "profileGuide.html";
      }, 500);
    } catch (error) {
      console.error(error);
      setFeedback("No se pudo guardar el perfil. Revisa tu conexión e intenta nuevamente.", "is-error");
    } finally {
      setSavingState(false);
    }
  }

  async function init() {
    bind();

    try {
      await hydrateFromApi();
    } catch (error) {
      console.error("No se pudo cargar el perfil del guía para edición.", error);
      try {
        const cached = JSON.parse(window.localStorage.getItem(GUIDE_PROFILE_STORAGE_KEY) || "null");
        if (cached && typeof cached === "object") {
          state.profile = { ...state.profile, ...cached };
        }
      } catch (_error) {
        // Ignorar cache inválido.
      }
    }

    fillForm(state.profile);
  }

  return { init };
})();

const bootstrapGuideProfileEdit = () => {
  const run = () => GuideProfileEditApp.init();
  const sidebarReady = window.__guideSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapGuideProfileEdit, { once: true });
} else {
  bootstrapGuideProfileEdit();
}

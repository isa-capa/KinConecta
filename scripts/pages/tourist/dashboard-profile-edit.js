const TOURIST_PROFILE_STORAGE_KEY = "kc_tourist_profile_v1";

const TouristProfileEditApp = (() => {
  const state = {
    isSaving: false,
    profile: {
      name: "",
      location: "",
      bio: "",
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
    },
  };

  const dom = {
    form: null,
    feedback: null,
    saveButton: null,
    profileNameInput: null,
    profileLocationInput: null,
    profileBioInput: null,
    interestsInput: null,
    travelStyleInput: null,
    tripTypeInput: null,
    languagesInput: null,
    paceAndCompanyInput: null,
    activityLevelInput: null,
    groupPreferenceInput: null,
    dietaryPreferencesInput: null,
    planningLevelInput: null,
    amenitiesInput: null,
    transportInput: null,
    photoPreferenceInput: null,
    accessibilityInput: null,
    additionalNotesInput: null,
  };

  function textToList(rawValue) {
    return String(rawValue || "")
      .split(/[\n,]+/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function listToText(items) {
    return (Array.isArray(items) ? items : []).join("\n");
  }

  function getTouristId() {
    const snapshot = window.KCAuthState?.getSnapshot?.();
    return snapshot?.touristId || snapshot?.userId || null;
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
    dom.form = document.getElementById("touristProfileEditForm");
    dom.feedback = document.getElementById("touristProfileEditFeedback");
    dom.saveButton = document.getElementById("btnSaveTouristProfile");
    dom.profileNameInput = document.getElementById("profileNameInput");
    dom.profileLocationInput = document.getElementById("profileLocationInput");
    dom.profileBioInput = document.getElementById("profileBioInput");
    dom.interestsInput = document.getElementById("interestsInput");
    dom.travelStyleInput = document.getElementById("travelStyleInput");
    dom.tripTypeInput = document.getElementById("tripTypeInput");
    dom.languagesInput = document.getElementById("languagesInput");
    dom.paceAndCompanyInput = document.getElementById("paceAndCompanyInput");
    dom.activityLevelInput = document.getElementById("activityLevelInput");
    dom.groupPreferenceInput = document.getElementById("groupPreferenceInput");
    dom.dietaryPreferencesInput = document.getElementById("dietaryPreferencesInput");
    dom.planningLevelInput = document.getElementById("planningLevelInput");
    dom.amenitiesInput = document.getElementById("amenitiesInput");
    dom.transportInput = document.getElementById("transportInput");
    dom.photoPreferenceInput = document.getElementById("photoPreferenceInput");
    dom.accessibilityInput = document.getElementById("accessibilityInput");
    dom.additionalNotesInput = document.getElementById("additionalNotesInput");

    dom.form?.addEventListener("submit", handleSubmit);
  }

  function fillForm(profile) {
    dom.profileNameInput.value = profile.name || "";
    dom.profileLocationInput.value = profile.location || "";
    dom.profileBioInput.value = profile.bio || "";
    dom.interestsInput.value = listToText(profile.interests);
    dom.travelStyleInput.value = profile.travelStyle || "";
    dom.tripTypeInput.value = profile.tripType || "";
    dom.languagesInput.value = listToText(profile.languages);
    dom.paceAndCompanyInput.value = profile.paceAndCompany || "";
    dom.activityLevelInput.value = profile.activityLevel || "";
    dom.groupPreferenceInput.value = profile.groupPreference || "";
    dom.dietaryPreferencesInput.value = profile.dietaryPreferences || "";
    dom.planningLevelInput.value = profile.planningLevel || "";
    dom.amenitiesInput.value = profile.amenities || "";
    dom.transportInput.value = profile.transport || "";
    dom.photoPreferenceInput.value = profile.photoPreference || "";
    dom.accessibilityInput.value = profile.accessibility || "";
    dom.additionalNotesInput.value = profile.additionalNotes || "";
  }

  function collectPayload() {
    return {
      name: dom.profileNameInput.value.trim(),
      location: dom.profileLocationInput.value.trim(),
      bio: dom.profileBioInput.value.trim(),
      interests: textToList(dom.interestsInput.value),
      travelStyle: dom.travelStyleInput.value.trim(),
      tripType: dom.tripTypeInput.value.trim(),
      languages: textToList(dom.languagesInput.value),
      paceAndCompany: dom.paceAndCompanyInput.value.trim(),
      activityLevel: dom.activityLevelInput.value.trim(),
      groupPreference: dom.groupPreferenceInput.value.trim(),
      dietaryPreferences: dom.dietaryPreferencesInput.value.trim(),
      planningLevel: dom.planningLevelInput.value.trim(),
      amenities: dom.amenitiesInput.value.trim(),
      transport: dom.transportInput.value.trim(),
      photoPreference: dom.photoPreferenceInput.value.trim(),
      accessibility: dom.accessibilityInput.value.trim(),
      additionalNotes: dom.additionalNotesInput.value.trim(),
    };
  }

  function validatePayload(profile) {
    if (!profile.name) return "Ingresa tu nombre.";
    if (!profile.location) return "Ingresa tu ubicación.";
    if (!profile.bio) return "Agrega una breve descripción personal.";
    if (!profile.interests.length) return "Agrega al menos un interés.";
    if (!profile.languages.length) return "Agrega al menos un idioma.";
    return "";
  }

  async function hydrateFromApi() {
    const touristId = getTouristId();
    if (!window.KCTouristApi?.profile?.getMe) return;

    const response = await window.KCTouristApi.profile.getMe(touristId);
    state.profile = {
      ...state.profile,
      ...(response?.data || {}),
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
      if (!window.KCTouristApi?.profile?.updateMe) {
        throw new Error("KCTouristApi.profile.updateMe no está disponible.");
      }

      await window.KCTouristApi.profile.updateMe(payload, getTouristId());
      window.localStorage.setItem(TOURIST_PROFILE_STORAGE_KEY, JSON.stringify(payload));
      setFeedback("Perfil actualizado correctamente. Redirigiendo...", "is-success");
      window.setTimeout(() => {
        window.location.href = "./profileTourist.html";
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
      console.error("No se pudo cargar el perfil de turista para edición.", error);
      try {
        const cached = JSON.parse(window.localStorage.getItem(TOURIST_PROFILE_STORAGE_KEY) || "null");
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

const bootstrapTouristProfileEdit = () => {
  const run = () => TouristProfileEditApp.init();
  const sidebarReady = window.__touristSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapTouristProfileEdit, { once: true });
} else {
  bootstrapTouristProfileEdit();
}

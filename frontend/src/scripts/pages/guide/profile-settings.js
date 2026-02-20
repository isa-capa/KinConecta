/* =========================================================
   Guía - Configuración de Perfil
   Base de lectura/actualización vía API REST.
   ========================================================= */

const GuideProfileSettingsApp = (() => {
  const state = {
    guideId: "guide_001", // TODO(AUTH): resolver guía autenticado real
    profile: {
      name: "José Rodríguez",
      location: "Tulum, México",
      bio: "Apasionado por la historia maya y las aventuras naturales.",
      rating: 4.9,
      avatarUrl: "https://i.pravatar.cc/150?u=jose",
    },
    isSaving: false,
  };

  const dom = {
    name: null,
    location: null,
    bio: null,
    rating: null,
    saveButton: null,
    avatarImage: null,
    avatarOverlay: null,
  };

  function mapSettings(raw) {
    // TODO(BACKEND): definir contrato oficial de profile settings.
    if (!raw || typeof raw !== "object") return;
    state.profile.name = raw.name ?? state.profile.name;
    state.profile.location = raw.location ?? state.profile.location;
    state.profile.bio = raw.bio ?? state.profile.bio;
    state.profile.rating = Number(raw.rating ?? state.profile.rating);
    state.profile.avatarUrl = raw.avatarUrl ?? state.profile.avatarUrl;
  }

  async function hydrateFromApi() {
    if (!window.KCGuideApi) return;

    try {
      const response = await window.KCGuideApi.profile.getSettings(state.guideId);
      mapSettings(response?.data || {});
    } catch (error) {
      console.warn("Profile settings API fallback enabled:", error);
    }
  }

  function render() {
    dom.name.textContent = state.profile.name;
    dom.location.innerHTML = `<span class="material-symbols-outlined">location_on</span> ${state.profile.location}`;
    dom.bio.value = state.profile.bio;
    dom.rating.textContent = Number(state.profile.rating).toFixed(1);
    if (dom.avatarImage) dom.avatarImage.src = state.profile.avatarUrl;
  }

  function collectPayload() {
    return {
      name: dom.name.textContent.trim(),
      location: dom.location.textContent.replace("location_on", "").trim(),
      bio: dom.bio.value.trim(),
    };
  }

  function setSavingState(isSaving) {
    state.isSaving = isSaving;
    if (!dom.saveButton) return;
    dom.saveButton.disabled = isSaving;
    dom.saveButton.textContent = isSaving ? "Guardando..." : "Guardar Cambios";
  }

  async function saveProfile() {
    if (state.isSaving) return;
    setSavingState(true);
    const payload = collectPayload();

    try {
      if (window.KCGuideApi) {
        // TODO(BACKEND): endpoint final PUT /guides/{guideId}/profile/settings
        const response = await window.KCGuideApi.profile.updateSettings(state.guideId, payload);
        mapSettings(response?.data || payload);
      } else {
        mapSettings(payload);
      }
      render();
    } catch (error) {
      console.warn("Save profile pending backend implementation:", error);
    } finally {
      setSavingState(false);
    }
  }

  function bind() {
    dom.name = document.getElementById("profileName");
    dom.location = document.getElementById("profileLocation");
    dom.bio = document.getElementById("profileBio");
    dom.rating = document.getElementById("profileRating");
    dom.saveButton = document.getElementById("btnSaveProfile");
    dom.avatarImage = document.querySelector(".avatar-edit img");
    dom.avatarOverlay = document.querySelector(".avatar-edit .edit-overlay");

    dom.saveButton?.addEventListener("click", saveProfile);
    dom.avatarOverlay?.addEventListener("click", async () => {
      // TODO(BACKEND): abrir selector de archivo y enviar FormData a uploadAvatar.
      // TODO(BACKEND): validar tipo/tamano y recortar imagen antes de subir.
      if (window.KCGuideApi) {
        console.info("TODO: invoke KCGuideApi.profile.uploadAvatar(guideId, formData)");
      }
    });
  }

  async function init() {
    bind();
    await hydrateFromApi();
    render();
  }

  return { init };
})();

const bootstrapGuideProfileSettings = () => {
  const run = () => GuideProfileSettingsApp.init();
  const sidebarReady = window.__guideSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapGuideProfileSettings, { once: true });
} else {
  bootstrapGuideProfileSettings();
}

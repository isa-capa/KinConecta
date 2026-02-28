(function () {
  const MIN_PASSWORD_LENGTH = 8;

  async function fetchMarkup(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error("No se pudo cargar el modal de seguridad: " + path);
    }
    return response.text();
  }

  async function mountModal() {
    const mount = document.querySelector("[data-security-modal-mount]");
    if (!mount) return null;

    const path = mount.getAttribute("data-component-path");
    if (!path) return null;

    const markup = await fetchMarkup(path);
    mount.insertAdjacentHTML("beforebegin", markup);
    mount.remove();
    return document.querySelector("[data-security-modal]");
  }

  function resolveRoleApi() {
    const body = document.body;
    if (!body) return null;

    if (body.classList.contains("role-guide")) {
      return window.KCGuideApi?.profile?.updateSecurity || null;
    }

    if (body.classList.contains("role-tourist")) {
      return window.KCTouristApi?.profile?.updateSecurity || null;
    }

    return null;
  }

  function setupModal(modal) {
    const openTriggers = [...document.querySelectorAll("[data-security-open]")];
    const closeTriggers = [...modal.querySelectorAll("[data-security-close]")];
    const form = modal.querySelector("[data-security-form]");
    const feedback = modal.querySelector("[data-security-feedback]");
    let previousBodyOverflow = "";

    const openModal = () => {
      previousBodyOverflow = document.body.style.overflow;
      modal.classList.add("security-modal--open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (feedback) feedback.textContent = "";
    };

    const closeModal = () => {
      modal.classList.remove("security-modal--open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = previousBodyOverflow;
    };

    const buildPayload = () => {
      const data = new FormData(form);
      return {
        currentEmail: String(data.get("currentEmail") || "").trim(),
        newEmail: String(data.get("newEmail") || "").trim(),
        // No se hace trim en contrasenas para conservar la longitud exacta que ingreso el usuario.
        currentPassword: String(data.get("currentPassword") || ""),
        newPassword: String(data.get("newPassword") || ""),
        confirmNewPassword: String(data.get("confirmNewPassword") || ""),
      };
    };

    const getPasswordLength = (value) => Array.from(String(value || "")).length;

    const validatePayload = (payload) => {
      if (
        !payload.newEmail &&
        !payload.currentPassword &&
        !payload.newPassword &&
        !payload.confirmNewPassword
      ) {
        return "Ingresa al menos un cambio para guardar.";
      }

      if (payload.newPassword || payload.confirmNewPassword) {
        if (!payload.currentPassword) {
          return "Ingresa tu contraseña actual para cambiar la contraseña.";
        }
        if (!payload.newPassword) {
          return "Ingresa una nueva contrasena.";
        }
        if (getPasswordLength(payload.newPassword) < MIN_PASSWORD_LENGTH) {
          return "La nueva contraseña debe tener al menos 8 caracteres.";
        }
        if (!payload.confirmNewPassword) {
          return "Confirma la nueva contrasena.";
        }
        if (payload.newPassword !== payload.confirmNewPassword) {
          return "La confirmación de contraseña no coincide.";
        }
      }

      return "";
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      const payload = buildPayload();
      const validationError = validatePayload(payload);

      if (validationError) {
        if (feedback) feedback.textContent = validationError;
        return;
      }

      try {
        const updateSecurity = resolveRoleApi();
        if (updateSecurity) {
          await updateSecurity(payload);
        } else {
          // TODO(BACKEND): conectar endpoint definitivo de seguridad si falta en API services.
          console.warn("Security endpoint pending API service integration.");
        }

        if (feedback) feedback.textContent = "Datos de seguridad actualizados correctamente.";
        window.setTimeout(() => {
          closeModal();
          form.reset();
        }, 650);
      } catch (error) {
        console.error(error);
        const backendMessage =
          error?.payload?.message ||
          error?.payload?.error ||
          error?.message;
        if (feedback) {
          feedback.textContent =
            backendMessage || "No se pudieron guardar los cambios. Intenta nuevamente.";
        }
      }
    };

    openTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        openModal();
      });
    });

    closeTriggers.forEach((trigger) => {
      trigger.addEventListener("click", closeModal);
    });

    form?.addEventListener("submit", handleSubmit);

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }

  async function init() {
    try {
      const modal = await mountModal();
      if (!modal) return;
      setupModal(modal);
    } catch (error) {
      console.error(error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

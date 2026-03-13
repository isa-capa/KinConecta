/* =========================================================
   Turista - Centro de Ayuda
   Base de FAQ/tickets lista para integracion API.
   ========================================================= */

const TouristHelpApp = (() => {
  const SOCIAL_LINKS = Object.freeze({
    linkedin: "https://www.linkedin.com/company/kinconecta",
    x: "https://x.com/kinconecta",
    instagram: "https://www.instagram.com/kinconecta",
  });

  const dom = {
    supportOpenButton: null,
    modal: null,
    modalCloseTriggers: [],
    form: null,
    submitButton: null,
    fileInput: null,
    fileDropzoneTitle: null,
    toast: null,
    toastClose: null,
  };

  function openModal() {
    if (!dom.modal) return;
    dom.modal.classList.add("modal--open");
    dom.modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!dom.modal) return;
    dom.modal.classList.remove("modal--open");
    dom.modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function showToast(message) {
    if (!dom.toast) return;
    const text = dom.toast.querySelector(".toast__text");
    if (text) text.textContent = message;
    dom.toast.classList.add("toast--show");
    dom.toast.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      dom.toast.classList.remove("toast--show");
      dom.toast.setAttribute("aria-hidden", "true");
    }, 3200);
  }

  function buildTicketPayload() {
    const formData = new FormData(dom.form);
    return {
      fullName: String(formData.get("fullName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };
  }

  function resolveHelpApi() {
    return window.KCTouristApi?.help || null;
  }

  function shouldUsePreviewFallback(error) {
    const status = Number(error?.status || 0);
    return Boolean(
      error?.isNetworkError ||
      error?.isApiUnavailable ||
      status === 404 ||
      status === 405 ||
      status === 501 ||
      status === 503,
    );
  }

  function getSupportErrorMessage(error) {
    const backendMessage =
      error?.payload?.message ||
      error?.payload?.error ||
      error?.message;
    if (backendMessage) return String(backendMessage);
    return "No se pudo enviar. Intenta nuevamente.";
  }

  function setSubmitting(isSubmitting) {
    if (!dom.submitButton) return;
    if (!dom.submitButton.dataset.originalLabel) {
      dom.submitButton.dataset.originalLabel = dom.submitButton.innerHTML;
    }
    dom.submitButton.disabled = isSubmitting;
    dom.submitButton.setAttribute("aria-busy", isSubmitting ? "true" : "false");
    dom.submitButton.innerHTML = isSubmitting
      ? 'Enviando mensaje <span class="material-symbols-outlined">hourglass_top</span>'
      : dom.submitButton.dataset.originalLabel;
  }

  function resetSupportForm() {
    dom.form?.reset();
    if (dom.fileDropzoneTitle) {
      dom.fileDropzoneTitle.textContent = "Haz clic o arrastra una imagen o documento";
    }
  }

  function applySocialLinks() {
    const byLabel = {
      linkedin: SOCIAL_LINKS.linkedin,
      x: SOCIAL_LINKS.x,
      instagram: SOCIAL_LINKS.instagram,
    };
    document.querySelectorAll(".support__social-btn[aria-label]").forEach((anchor) => {
      const label = String(anchor.getAttribute("aria-label") || "").trim().toLowerCase();
      const href = byLabel[label];
      if (!href) return;
      anchor.setAttribute("href", href);
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    });
  }

  async function submitTicket(event) {
    event.preventDefault();
    const payload = buildTicketPayload();
    setSubmitting(true);

    try {
      const helpApi = resolveHelpApi();
      if (helpApi?.sendTicket) {
        // TODO(BACKEND): endpoint real de tickets y adjuntos para turista.
        await helpApi.sendTicket(payload);
      } else {
        // TODO(BACKEND): eliminar fallback cuando el endpoint para turista exista en todos los ambientes.
        console.warn("Tourist support endpoint unavailable. Using preview fallback.");
      }
      showToast("Mensaje enviado. Te responderemos pronto.");
      resetSupportForm();
      closeModal();
    } catch (error) {
      if (shouldUsePreviewFallback(error)) {
        console.warn("Support endpoint unavailable. Using preview success fallback:", error);
        showToast("Mensaje enviado (modo prueba). Te responderemos pronto.");
        resetSupportForm();
        closeModal();
      } else {
        showToast(getSupportErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  }

  function setupFaqBehavior() {
    const detailsItems = [...document.querySelectorAll(".faq__item")];
    detailsItems.forEach((detail) => {
      detail.addEventListener("toggle", () => {
        if (!detail.open) return;
        detailsItems.forEach((other) => {
          if (other !== detail) other.open = false;
        });
      });
    });
  }

  function bind() {
    dom.supportOpenButton = document.querySelector("[data-support-open]");
    dom.modal = document.querySelector("[data-support-modal]");
    dom.modalCloseTriggers = [...document.querySelectorAll("[data-support-close]")];
    dom.form = document.querySelector("[data-support-form]");
    dom.submitButton = dom.form?.querySelector(".form__submit") || null;
    dom.fileInput = document.getElementById("file");
    dom.fileDropzoneTitle = document.querySelector(".dropzone__title");
    dom.toast = document.querySelector("[data-toast]");
    dom.toastClose = document.querySelector("[data-toast-close]");

    dom.supportOpenButton?.addEventListener("click", openModal);
    dom.modalCloseTriggers.forEach((trigger) => trigger.addEventListener("click", closeModal));
    dom.form?.addEventListener("submit", submitTicket);
    dom.toastClose?.addEventListener("click", () => {
      dom.toast.classList.remove("toast--show");
      dom.toast.setAttribute("aria-hidden", "true");
    });

    dom.fileInput?.addEventListener("change", () => {
      const file = dom.fileInput.files?.[0];
      if (!file || !dom.fileDropzoneTitle) return;
      dom.fileDropzoneTitle.textContent = `Archivo seleccionado: ${file.name}`;
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }

  function init() {
    bind();
    applySocialLinks();
    setupFaqBehavior();
  }

  return { init };
})();

const bootstrapTouristHelp = () => {
  const run = () => TouristHelpApp.init();
  const sidebarReady = window.__touristSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapTouristHelp, { once: true });
} else {
  bootstrapTouristHelp();
}

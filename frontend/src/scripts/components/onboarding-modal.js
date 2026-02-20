(function () {
  const dom = {
    modal: null,
    frame: null,
    closeTriggers: [],
  };

  let previousBodyOverflow = "";

  function normalizeRole(role) {
    return String(role || "").trim().toLowerCase() === "guide" ? "guide" : "traveler";
  }

  function resolveDashboardPathByRole(role) {
    const normalizedRole = String(role || "").trim().toLowerCase();
    const dashboardPath =
      normalizedRole === "guide"
        ? "Dashboard/guia/mainUserGuide.html"
        : "Dashboard/turista/mainUserTourist.html";

    const path = String(window.location.pathname || "").replace(/\\/g, "/").toLowerCase();
    const pagesPrefix = path.includes("/frontend/src/pages/") ? "./" : "./frontend/src/pages/";
    return `${pagesPrefix}${dashboardPath}`;
  }

  function resolveWizardPath() {
    const path = String(window.location.pathname || "").replace(/\\/g, "/").toLowerCase();
    if (path.includes("/frontend/src/pages/")) {
      return "./profiler/profiles-wizard.html";
    }
    return "./frontend/src/pages/profiler/profiles-wizard.html";
  }

  function buildWizardUrl(role) {
    const params = new URLSearchParams();
    params.set("embed", "1");
    params.set("role", normalizeRole(role));
    return `${resolveWizardPath()}?${params.toString()}`;
  }

  function buildModal() {
    const wrapper = document.createElement("div");
    wrapper.className = "onboarding-modal";
    wrapper.setAttribute("data-onboarding-modal", "");
    wrapper.setAttribute("aria-hidden", "true");
    wrapper.innerHTML = `
      <div class="onboarding-modal__backdrop" data-onboarding-close></div>
      <section class="onboarding-modal__panel" role="dialog" aria-modal="true" aria-label="Formulario de registro de perfil">
        <iframe class="onboarding-modal__frame" title="Formulario de onboarding" data-onboarding-frame></iframe>
      </section>
    `;

    document.body.appendChild(wrapper);
    dom.modal = wrapper;
    dom.frame = wrapper.querySelector("[data-onboarding-frame]");
    dom.closeTriggers = [...wrapper.querySelectorAll("[data-onboarding-close]")];

    dom.closeTriggers.forEach((trigger) => {
      trigger.addEventListener("click", close);
    });

    dom.frame?.addEventListener("load", () => {
      resizeFrameToContent();
    });
  }

  function resizeFrameToContent() {
    if (!dom.frame) return;
    try {
      const doc = dom.frame.contentDocument;
      if (!doc) return;
      const root = doc.documentElement;
      const body = doc.body;
      const contentHeight = Math.max(
        body ? body.scrollHeight : 0,
        root ? root.scrollHeight : 0,
      );
      const viewportCap = Math.floor(window.innerHeight * 0.9);
      const finalHeight = Math.max(430, Math.min(contentHeight + 6, viewportCap));
      dom.frame.style.height = `${finalHeight}px`;
    } catch (_error) {
      // Si no se puede leer el contenido del iframe por alguna razon, dejamos el alto base CSS.
    }
  }

  function open(role) {
    if (!dom.modal || !dom.frame) buildModal();

    const normalizedRole = normalizeRole(role);
    dom.frame.src = buildWizardUrl(normalizedRole);

    previousBodyOverflow = document.body.style.overflow;
    dom.modal.classList.add("onboarding-modal--open");
    dom.modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (!dom.modal || !dom.frame) return;
    dom.modal.classList.remove("onboarding-modal--open");
    dom.modal.setAttribute("aria-hidden", "true");
    dom.frame.src = "about:blank";
    document.body.style.overflow = previousBodyOverflow;
  }

  function bindGlobalEvents() {
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });

    window.addEventListener("message", (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "kc-onboarding-close") {
        close();
      }
      if (event.data?.type === "kc-onboarding-back-to-register") {
        close();
        window.KCAuthModal?.openRegister?.({ resetRegisterForm: false });
      }
      if (event.data?.type === "kc-onboarding-resize") {
        resizeFrameToContent();
      }
      if (event.data?.type === "kc-onboarding-complete") {
        const dashboardPath = resolveDashboardPathByRole(event.data?.role);
        close();
        window.location.href = dashboardPath;
      }
    });

    window.addEventListener("resize", () => {
      if (dom.modal?.classList.contains("onboarding-modal--open")) {
        resizeFrameToContent();
      }
    });
  }

  function init() {
    buildModal();
    bindGlobalEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.KCOnboardingModal = {
    open,
    close,
  };
})();

(function () {
  const LEGAL_DEFS = {
    terms: {
      title: "Términos de Servicio",
      path: "../../../components/legal/terms-of-service.html",
    },
    privacy: {
      title: "Política de Privacidad",
      path: "../../../components/legal/privacy-policy.html",
    },
    map: {
      title: "Mapa del Sitio",
      path: "../../../components/legal/site-map.html",
    },
  };

  const dom = {
    modal: null,
    title: null,
    content: null,
    closeTriggers: [],
    loadedCache: new Map(),
  };

  let lastBodyOverflow = "";

  function buildModal() {
    const wrapper = document.createElement("div");
    wrapper.className = "legal-modal";
    wrapper.setAttribute("data-legal-modal", "");
    wrapper.setAttribute("aria-hidden", "true");
    wrapper.innerHTML = `
      <div class="legal-modal__backdrop" data-legal-close></div>
      <section class="legal-modal__panel" role="dialog" aria-modal="true" aria-labelledby="legal-modal-title">
        <header class="legal-modal__header">
          <h2 class="legal-modal__title" id="legal-modal-title"></h2>
          <button class="legal-modal__close" type="button" aria-label="Cerrar" data-legal-close>
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>
        <div class="legal-modal__body">
          <div class="legal-modal__scroll" data-legal-modal-content></div>
        </div>
        <footer class="legal-modal__footer">
          <button class="legal-modal__button" type="button" data-legal-close>Cerrar</button>
        </footer>
      </section>
    `;
    document.body.appendChild(wrapper);

    dom.modal = wrapper;
    dom.title = wrapper.querySelector("#legal-modal-title");
    dom.content = wrapper.querySelector("[data-legal-modal-content]");
    dom.closeTriggers = [...wrapper.querySelectorAll("[data-legal-close]")];
  }

  async function fetchMarkup(path) {
    const cached = dom.loadedCache.get(path);
    if (cached) return cached;

    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error("No se pudo cargar contenido legal: " + path);
    }

    const markup = await response.text();
    dom.loadedCache.set(path, markup);
    return markup;
  }

  function closeModal() {
    if (!dom.modal) return;
    dom.modal.classList.remove("legal-modal--open");
    dom.modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = lastBodyOverflow;
  }

  async function openModal(key) {
    const definition = LEGAL_DEFS[key];
    if (!definition || !dom.modal || !dom.title || !dom.content) return;

    try {
      const markup = await fetchMarkup(definition.path);
      dom.title.textContent = definition.title;
      dom.content.innerHTML = markup;
      lastBodyOverflow = document.body.style.overflow;
      dom.modal.classList.add("legal-modal--open");
      dom.modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    } catch (error) {
      console.error(error);
    }
  }

  function bindLinks() {
    const links = [...document.querySelectorAll("[data-legal]")];
    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const key = link.getAttribute("data-legal");
        openModal(key);
      });
    });
  }

  function bindClose() {
    dom.closeTriggers.forEach((trigger) => {
      trigger.addEventListener("click", closeModal);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }

  function init() {
    buildModal();
    bindLinks();
    bindClose();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

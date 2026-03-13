(function () {
  const STORAGE_KEY = "kcPreferredLanguage";

  async function fetchMarkup(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error("No se pudo cargar el modal de idioma: " + path);
    }
    return response.text();
  }

  async function mountModal() {
    const mount = document.querySelector("[data-language-modal-mount]");
    if (!mount) return null;

    const path = mount.getAttribute("data-component-path");
    if (!path) return null;

    const markup = await fetchMarkup(path);
    mount.insertAdjacentHTML("beforebegin", markup);
    mount.remove();
    return document.querySelector("[data-language-modal]");
  }

  function setupModal(modal) {
    const openTriggers = [...document.querySelectorAll("[data-language-open]")];
    const closeTriggers = [...modal.querySelectorAll("[data-language-close]")];
    const form = modal.querySelector("[data-language-form]");
    const searchInput = modal.querySelector("[data-language-search]");
    const options = [...modal.querySelectorAll("[data-language-option]")];
    const feedback = modal.querySelector("[data-language-feedback]");
    const radios = [...modal.querySelectorAll('input[name="language"]')];
    let previousBodyOverflow = "";

    const currentValue = localStorage.getItem(STORAGE_KEY);
    if (currentValue) {
      const selected = radios.find((radio) => radio.value === currentValue);
      if (selected) selected.checked = true;
    }

    const openModal = () => {
      previousBodyOverflow = document.body.style.overflow;
      modal.classList.add("language-modal--open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (feedback) feedback.textContent = "";
      if (searchInput) {
        searchInput.value = "";
        onSearch();
      }
      searchInput?.focus();
    };

    const closeModal = () => {
      modal.classList.remove("language-modal--open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = previousBodyOverflow;
      searchInput?.blur();
    };

    const onSearch = () => {
      const term = String(searchInput?.value || "").trim().toLowerCase();
      options.forEach((option) => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(term) ? "flex" : "none";
      });
    };

    const onSubmit = (event) => {
      event.preventDefault();
      const selected = modal.querySelector('input[name="language"]:checked');
      if (!selected) {
        if (feedback) {
          feedback.textContent = "Selecciona un idioma antes de guardar.";
        }
        return;
      }

      localStorage.setItem(STORAGE_KEY, selected.value);
      if (feedback) {
        feedback.textContent = "Idioma actualizado correctamente.";
      }

      window.setTimeout(() => {
        closeModal();
      }, 450);
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

    searchInput?.addEventListener("input", onSearch);
    form?.addEventListener("submit", onSubmit);

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
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

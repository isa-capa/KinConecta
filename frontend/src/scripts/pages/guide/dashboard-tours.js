/* =========================================================
   Guía - Mis recorridos
   API-first con modal CRUD listo para integrar Spring Boot.
   ========================================================= */

const GuideToursApp = (() => {
  const state = {
    guideId: "guide_001", // TODO(AUTH): obtener desde sesión/JWT
    tours: [],
    isSaving: false,
  };

  const dom = {
    alertContainer: null,
    toursGrid: null,
    btnCreateTour: null,
    modal: null,
    modalTitle: null,
    form: null,
    btnCloseModal: null,
    btnCancelModal: null,
    fieldTourId: null,
    fieldTitle: null,
    fieldDescription: null,
    fieldPrice: null,
    fieldCategory: null,
    fieldDuration: null,
    fieldMaxGroup: null,
    fieldMeetingPoint: null,
    fieldIncluded: null,
    fieldStatus: null,
  };

  const createUid = () => Math.random().toString(36).slice(2, 10);

  const loadingMarkup = (label) => `
    <div class="guide-loading" role="status" aria-live="polite" aria-busy="true">
      <span class="guide-loading__spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `;

  function renderToursLoading() {
    if (!dom.toursGrid) return;
    dom.toursGrid.innerHTML = loadingMarkup("Cargando recorridos...");
  }

  function normalizeTour(raw) {
    return {
      id: raw.id ?? createUid(),
      title: raw.title || "Recorrido sin título",
      description: raw.description || "Sin descripción",
      price: Number(raw.price || 0),
      currency: raw.currency || "MXN",
      bookings: Number(raw.bookings || 0),
      rating: raw.rating === null || raw.rating === undefined ? null : Number(raw.rating),
      status: raw.status || "draft",
      imageClass: raw.imageClass || getRandomImageClass(),
      category: raw.category || "",
      duration: Number(raw.duration || 1),
      maxGroupSize: Number(raw.maxGroupSize || 1),
      includedItems: Array.isArray(raw.includedItems) ? raw.includedItems : [],
      meetingPoint: raw.meetingPoint || "",
    };
  }

  async function fetchFallbackTours() {
    const response = await fetch("../../../scripts/data/guide/tours.json");
    if (!response.ok) throw new Error("No fue posible cargar recorridos de respaldo");
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeTour) : [];
  }

  async function hydrateFromApi() {
    // TODO(BACKEND): aplicar paginación, filtros y ordenamiento en server-side.
    // TODO(BACKEND): mover guideId al contexto de autenticacion global.
    if (!window.KCGuideApi) {
      state.tours = await fetchFallbackTours();
      return;
    }

    try {
      const response = await window.KCGuideApi.tours.listByGuide(state.guideId, {
        page: 0,
        size: 100,
      });
      const items = response?.data?.items || response?.data || [];
      if (!Array.isArray(items)) throw new Error("Respuesta de tours inválida");
      state.tours = items.map(normalizeTour);
    } catch (error) {
      console.warn("Tours API fallback enabled:", error);
      state.tours = await fetchFallbackTours();
    }
  }

  function getStatusText(status) {
    const map = {
      active: "Activo",
      draft: "Borrador",
      pending: "Pendiente",
    };
    return map[status] || "Sin estado";
  }

  function getTourActionButtonsHtml(tour) {
    if (tour.status === "draft") {
      return `
        <button class="btn-continue" type="button" data-action="edit" data-tour-id="${tour.id}">
          <span class="material-symbols-outlined">edit_note</span> Continuar editando
        </button>
      `;
    }

    if (tour.status === "pending") {
      return `
        <button class="btn-edit" type="button" data-action="edit" data-tour-id="${tour.id}">
          <span class="material-symbols-outlined">edit</span> Editar
        </button>
        <button class="btn-disabled" type="button" disabled>
          <span class="material-symbols-outlined">hourglass_empty</span> En revisión
        </button>
      `;
    }

    return `
      <button class="btn-edit" type="button" data-action="edit" data-tour-id="${tour.id}">
        <span class="material-symbols-outlined">edit</span> Editar
      </button>
      <button class="btn-view" type="button" data-action="bookings" data-tour-id="${tour.id}">
        <span class="material-symbols-outlined">calendar_month</span> Ver reservas
      </button>
    `;
  }

  function createTourCard(tour) {
    const card = document.createElement("article");
    card.className = `tour-card ${tour.status === "draft" ? "draft" : ""}`;

    const ratingDisplay =
      tour.rating === null ? (tour.status === "pending" ? "Nuevo" : "--") : tour.rating.toFixed(1);
    const priceDisplay = tour.price > 0 ? `$${tour.price} ${tour.currency}` : "--";

    card.innerHTML = `
      <div class="tour-image ${tour.imageClass}">
        <div class="image-overlay"></div>
        <div class="tour-status ${tour.status}">
          <span class="status-indicator"></span> ${getStatusText(tour.status)}
        </div>
      </div>
      <div class="tour-content">
        <div class="tour-header">
          <h3 class="tour-title">${tour.title}</h3>
          <div class="tour-rating ${tour.rating === null ? "empty" : ""}">
            <span class="material-symbols-outlined">star</span> ${ratingDisplay}
          </div>
        </div>
        <p class="tour-description">${tour.description}</p>
        <div class="tour-stats ${tour.status === "draft" ? "dashed" : ""}">
          <div class="stat-item">
            <span class="stat-label">Reservas</span>
            <div class="stat-value ${tour.bookings === 0 ? "empty" : ""}">
              <span class="material-symbols-outlined">group</span>
              <span>${tour.bookings}</span>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-label">Precio</span>
            <div class="stat-value ${tour.price === 0 ? "empty" : ""}">
              <span class="material-symbols-outlined">payments</span>
              <span>${priceDisplay}</span>
            </div>
          </div>
        </div>
        <div class="tour-actions">
          ${getTourActionButtonsHtml(tour)}
        </div>
      </div>
    `;

    return card;
  }

  function renderTours() {
    if (!dom.toursGrid) return;
    dom.toursGrid.innerHTML = "";

    state.tours.forEach((tour) => {
      dom.toursGrid.appendChild(createTourCard(tour));
    });
  }

  function showAlert(message, type = "success") {
    if (!dom.alertContainer) return;
    const alertId = `alert-${Date.now()}`;
    const iconName = type === "danger" ? "error" : type === "info" ? "info" : "check_circle";

    const alert = document.createElement("div");
    alert.id = alertId;
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
      <div class="alert-content">
        <span class="material-symbols-outlined">${iconName}</span>
        <span>${message}</span>
      </div>
      <button class="alert-close" type="button" aria-label="Cerrar alerta">
        <span class="material-symbols-outlined">close</span>
      </button>
    `;

    const close = () => {
      alert.classList.remove("show");
      window.setTimeout(() => alert.remove(), 250);
    };

    alert.querySelector(".alert-close")?.addEventListener("click", close);
    dom.alertContainer.appendChild(alert);
    requestAnimationFrame(() => alert.classList.add("show"));
    window.setTimeout(close, 4500);
  }

  function clearFormErrors() {
    dom.form?.querySelectorAll(".field-error").forEach((element) => element.remove());
    dom.form?.querySelectorAll(".error").forEach((element) => element.classList.remove("error"));
  }

  function showFieldError(field, message) {
    if (!field) return;
    const formGroup = field.closest(".form-group");
    if (!formGroup) return;
    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.textContent = message;
    field.classList.add("error");
    formGroup.appendChild(errorDiv);
  }

  function validateForm() {
    clearFormErrors();
    let isValid = true;

    const title = dom.fieldTitle.value.trim();
    if (title.length < 5) {
      showFieldError(dom.fieldTitle, "El título debe tener al menos 5 caracteres.");
      isValid = false;
    }

    const description = dom.fieldDescription.value.trim();
    if (description.length < 20) {
      showFieldError(dom.fieldDescription, "La descripción debe tener al menos 20 caracteres.");
      isValid = false;
    }

    const price = Number(dom.fieldPrice.value);
    if (Number.isNaN(price) || price < 0) {
      showFieldError(dom.fieldPrice, "Ingresa un precio válido.");
      isValid = false;
    }

    const category = dom.fieldCategory.value.trim();
    if (!category) {
      showFieldError(dom.fieldCategory, "La categoría es obligatoria.");
      isValid = false;
    }

    const duration = Number(dom.fieldDuration.value);
    if (Number.isNaN(duration) || duration < 1 || duration > 12) {
      showFieldError(dom.fieldDuration, "La duración debe estar entre 1 y 12 horas.");
      isValid = false;
    }

    const maxGroup = Number(dom.fieldMaxGroup.value);
    if (Number.isNaN(maxGroup) || maxGroup < 1 || maxGroup > 50) {
      showFieldError(dom.fieldMaxGroup, "El grupo debe estar entre 1 y 50 personas.");
      isValid = false;
    }

    const meetingPoint = dom.fieldMeetingPoint.value.trim();
    if (meetingPoint.length < 5) {
      showFieldError(dom.fieldMeetingPoint, "Ingresa un punto de encuentro válido.");
      isValid = false;
    }

    const included = dom.fieldIncluded.value.trim();
    if (included.length < 5) {
      showFieldError(dom.fieldIncluded, "Agrega al menos un item incluido.");
      isValid = false;
    }

    if (!isValid) showAlert("Corrige los errores del formulario.", "danger");
    return isValid;
  }

  function getFormPayload() {
    return {
      title: dom.fieldTitle.value.trim(),
      description: dom.fieldDescription.value.trim(),
      price: Number(dom.fieldPrice.value),
      currency: "MXN",
      category: dom.fieldCategory.value.trim(),
      duration: Number(dom.fieldDuration.value),
      maxGroupSize: Number(dom.fieldMaxGroup.value),
      meetingPoint: dom.fieldMeetingPoint.value.trim(),
      includedItems: dom.fieldIncluded.value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      status: dom.fieldStatus.value,
    };
  }

  function fillFormWithTour(tour) {
    dom.fieldTourId.value = String(tour.id ?? "");
    dom.fieldTitle.value = tour.title;
    dom.fieldDescription.value = tour.description;
    dom.fieldPrice.value = String(tour.price);
    dom.fieldCategory.value = tour.category;
    dom.fieldDuration.value = String(tour.duration);
    dom.fieldMaxGroup.value = String(tour.maxGroupSize);
    dom.fieldMeetingPoint.value = tour.meetingPoint;
    dom.fieldIncluded.value = tour.includedItems.join(", ");
    dom.fieldStatus.value = tour.status;
  }

  function resetForm() {
    dom.form.reset();
    dom.fieldTourId.value = "";
    clearFormErrors();
  }

  function openModalForCreate() {
    dom.modalTitle.textContent = "Crear nuevo recorrido";
    resetForm();
    dom.modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function openModalForEdit(tourId) {
    const tour = state.tours.find((item) => String(item.id) === String(tourId));
    if (!tour) return;
    dom.modalTitle.textContent = "Editar recorrido";
    fillFormWithTour(tour);
    clearFormErrors();
    dom.modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    dom.modal.classList.remove("show");
    document.body.style.overflow = "";
    resetForm();
  }

  async function createTour(payload) {
    // TODO(BACKEND): endpoint real POST /guides/{guideId}/tours
    // TODO(BACKEND): soportar upload de portada via FormData y endpoint dedicado.
    if (window.KCGuideApi) {
      try {
        const response = await window.KCGuideApi.tours.create(state.guideId, payload);
        const created = response?.data || payload;
        return normalizeTour({
          ...created,
          bookings: created.bookings ?? 0,
          rating: created.rating ?? null,
          imageClass: created.imageClass || getRandomImageClass(),
        });
      } catch (error) {
        console.warn("Create tour pending backend implementation:", error);
      }
    }

    return normalizeTour({
      ...payload,
      id: uidFromTours(),
      bookings: 0,
      rating: null,
      imageClass: getRandomImageClass(),
    });
  }

  async function updateTour(tourId, payload) {
    // TODO(BACKEND): endpoint real PUT /guides/{guideId}/tours/{tourId}
    if (window.KCGuideApi) {
      try {
        const response = await window.KCGuideApi.tours.update(state.guideId, tourId, payload);
        const updated = response?.data || payload;
        return normalizeTour({
          ...updated,
          id: updated.id ?? tourId,
          imageClass: updated.imageClass || getRandomImageClass(),
        });
      } catch (error) {
        console.warn("Update tour pending backend implementation:", error);
      }
    }

    const previous = state.tours.find((tour) => String(tour.id) === String(tourId));
    return normalizeTour({
      ...previous,
      ...payload,
      id: tourId,
      imageClass: previous?.imageClass || getRandomImageClass(),
    });
  }

  function uidFromTours() {
    return state.tours.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    if (state.isSaving) return;
    if (!validateForm()) return;

    state.isSaving = true;
    const payload = getFormPayload();
    const existingTourId = dom.fieldTourId.value.trim();

    try {
      if (existingTourId) {
        const updated = await updateTour(existingTourId, payload);
        state.tours = state.tours.map((tour) =>
          String(tour.id) === String(existingTourId) ? updated : tour,
        );
        showAlert("Tour actualizado correctamente.", "success");
      } else {
        const created = await createTour(payload);
        state.tours.unshift(created);
        showAlert("Tour creado correctamente.", "success");
      }

      renderTours();
      closeModal();
    } finally {
      state.isSaving = false;
    }
  }

  function handleTourGridClick(event) {
    const trigger = event.target.closest("button[data-action]");
    if (!trigger) return;

    const action = trigger.getAttribute("data-action");
    const tourId = trigger.getAttribute("data-tour-id");
    if (!action || !tourId) return;

    if (action === "edit") {
      openModalForEdit(tourId);
      return;
    }

    if (action === "bookings") {
      // TODO(BACKEND): navegar a lista de reservas de ese tour.
      showAlert("Vista de reservas en preparación.", "info");
    }
  }

  function getRandomImageClass() {
    const classes = [
      "active-tour",
      "teotihuacan",
      "architecture",
      "coyoacan",
      "xochimilco",
      "street-art",
      "lucha-libre",
      "cantinas",
      "markets",
      "chapultepec",
    ];
    return classes[Math.floor(Math.random() * classes.length)];
  }

  function bind() {
    dom.alertContainer = document.getElementById("alertContainer");
    dom.toursGrid = document.getElementById("toursGrid");
    dom.btnCreateTour = document.getElementById("btnCreateTour");
    dom.modal = document.getElementById("tourModal");
    dom.modalTitle = document.getElementById("modalTitle");
    dom.form = document.getElementById("tourForm");
    dom.btnCloseModal = document.getElementById("btnCloseTourModal");
    dom.btnCancelModal = document.getElementById("btnCancelTourModal");

    dom.fieldTourId = document.getElementById("tourId");
    dom.fieldTitle = document.getElementById("tourTitle");
    dom.fieldDescription = document.getElementById("tourDescription");
    dom.fieldPrice = document.getElementById("tourPrice");
    dom.fieldCategory = document.getElementById("tourCategory");
    dom.fieldDuration = document.getElementById("tourDuration");
    dom.fieldMaxGroup = document.getElementById("tourMaxGroup");
    dom.fieldMeetingPoint = document.getElementById("tourMeetingPoint");
    dom.fieldIncluded = document.getElementById("tourIncluded");
    dom.fieldStatus = document.getElementById("tourStatus");

    dom.btnCreateTour?.addEventListener("click", openModalForCreate);
    dom.btnCloseModal?.addEventListener("click", closeModal);
    dom.btnCancelModal?.addEventListener("click", closeModal);
    dom.form?.addEventListener("submit", handleFormSubmit);
    dom.toursGrid?.addEventListener("click", handleTourGridClick);

    dom.modal?.addEventListener("click", (event) => {
      if (event.target === dom.modal) closeModal();
    });
  }

  async function init() {
    bind();
    renderToursLoading();
    await hydrateFromApi();
    renderTours();

    // TODO(BACKEND): agregar remove/publish/duplicate con endpoints dedicados.
    // TODO(BACKEND): rehidratacion al volver de pantallas de "reservas de tour".
  }

  return { init };
})();

const bootstrapGuideTours = () => {
  const run = () => GuideToursApp.init();
  const sidebarReady = window.__guideSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapGuideTours, { once: true });
} else {
  bootstrapGuideTours();
}

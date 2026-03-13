/* =========================================================
   Guia - Mis recorridos
   API-first con modal CRUD listo para integrar Spring Boot.
   ========================================================= */

const GuideToursApp = (() => {
  const openUnderConstructionModal = () => {
    if (window.KCUnderConstruction?.open) {
      window.KCUnderConstruction.open();
      return;
    }
    window.alert("Aun estamos trabajando en esto.");
  };

  const state = {
    guideId: null,
    currentUser: null,
    tours: [],
    isSaving: false,
    modalInitialSnapshot: "",
  };

  const dom = {
    alertContainer: null,
    pageTitle: null,
    pageSubtitle: null,
    sidebarUserName: null,
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
    categoryList: null,
  };

  const createUid = () => Math.random().toString(36).slice(2, 10);

  const loadingMarkup = (label) => `
    <div class="guide-loading" role="status" aria-live="polite" aria-busy="true">
      <span class="guide-loading__spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `;

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderToursLoading() {
    if (dom.pageTitle) dom.pageTitle.textContent = "Mis recorridos";
    if (dom.pageSubtitle) dom.pageSubtitle.textContent = "Cargando informacion del guia...";
    if (!dom.toursGrid) return;
    dom.toursGrid.innerHTML = loadingMarkup("Cargando recorridos...");
  }

  function getCurrentGuideId() {
    const direct = window.localStorage.getItem("kc_guide_id");
    const directDigits = String(direct || "").match(/\d+/g);
    const directParsed = Number(directDigits ? directDigits.join("") : direct);
    if (Number.isFinite(directParsed) && directParsed > 0) return directParsed;

    try {
      const rawSession = window.localStorage.getItem("kc_temp_auth_session_v1");
      const session = rawSession ? JSON.parse(rawSession) : null;
      const role = String(session?.role || "").trim().toLowerCase();
      const digits = String(session?.userId || "").match(/\d+/g);
      const parsed = Number(digits ? digits.join("") : session?.userId);
      if (role === "guide" && Number.isFinite(parsed) && parsed > 0) {
        window.localStorage.setItem("kc_guide_id", String(parsed));
        return parsed;
      }
    } catch (error) {
      console.warn("No se pudo resolver el guideId desde la sesion local.", error);
    }

    return null;
  }

  async function hydrateCurrentUser() {
    state.guideId = getCurrentGuideId();
    if (!window.KCGuideApi?.profile?.getPublicProfile || !state.guideId) return;

    try {
      const response = await window.KCGuideApi.profile.getPublicProfile(state.guideId);
      const profile = response?.data || {};
      const name = String(profile.fullName || profile.name || "").trim();
      if (!name) return;

      state.currentUser = {
        name,
        location: String(profile.locationLabel || profile.location || "").trim(),
      };

      try {
        const rawSession = window.localStorage.getItem("kc_temp_auth_session_v1");
        const session = rawSession ? JSON.parse(rawSession) : {};
        window.localStorage.setItem(
          "kc_temp_auth_session_v1",
          JSON.stringify({
            ...session,
            role: "guide",
            userId: String(state.guideId),
            fullName: name,
          }),
        );
      } catch (error) {
        console.warn("No se pudo actualizar la sesion local con el nombre del guia.", error);
      }
    } catch (error) {
      console.warn("No se pudo cargar el usuario actual en recorridos desde API.", error);
    }
  }

  function renderCurrentUser() {
    if (dom.sidebarUserName && state.currentUser?.name) {
      dom.sidebarUserName.textContent = state.currentUser.name;
    }
    if (dom.pageTitle) {
      dom.pageTitle.textContent = state.currentUser?.name
        ? `Recorridos de ${state.currentUser.name}`
        : "Mis recorridos";
    }
    if (dom.pageSubtitle) {
      dom.pageSubtitle.textContent = state.currentUser?.location
        ? `Administra tus experiencias publicadas desde ${state.currentUser.location}.`
        : "Administra tus experiencias publicadas y borradores.";
    }
  }

  function normalizeTour(raw) {
    return {
      id: raw.id ?? createUid(),
      title: raw.title || "Recorrido sin titulo",
      description: raw.description || "Sin descripcion",
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
    return [];
  }

  async function hydrateFromApi() {
    if (!window.KCGuideApi || !state.guideId) {
      state.tours = [];
      return;
    }

    try {
      const response = await window.KCGuideApi.tours.listByGuide(state.guideId, {
        page: 0,
        size: 100,
      });
      const items = response?.data?.items || response?.data || [];
      if (!Array.isArray(items)) throw new Error("Respuesta de tours invalida");
      state.tours = items.map(normalizeTour);
    } catch (error) {
      console.warn("No se pudieron cargar los recorridos desde la API.", error);
      state.tours = [];
    }
  }

  async function hydrateCategoryOptions() {
    if (!dom.categoryList || !window.KCGuideApi?.tours?.listCategories) return;

    try {
      const response = await window.KCGuideApi.tours.listCategories();
      const items = response?.data?.items || response?.data || [];
      if (!Array.isArray(items) || !items.length) return;

      dom.categoryList.innerHTML = items
        .map((item) => `<option value="${escapeHtml(item.name || "")}">`)
        .join("");
    } catch (error) {
      console.warn("No se pudieron cargar las categorias del backend.", error);
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
          <span class="material-symbols-outlined">hourglass_empty</span> En revision
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
      showFieldError(dom.fieldTitle, "El titulo debe tener al menos 5 caracteres.");
      isValid = false;
    }

    const description = dom.fieldDescription.value.trim();
    if (description.length < 20) {
      showFieldError(dom.fieldDescription, "La descripcion debe tener al menos 20 caracteres.");
      isValid = false;
    }

    const price = Number(dom.fieldPrice.value);
    if (Number.isNaN(price) || price < 0) {
      showFieldError(dom.fieldPrice, "Ingresa un precio valido.");
      isValid = false;
    }

    const category = dom.fieldCategory.value.trim();
    if (!category) {
      showFieldError(dom.fieldCategory, "La categoria es obligatoria.");
      isValid = false;
    }

    const duration = Number(dom.fieldDuration.value);
    if (Number.isNaN(duration) || duration < 1 || duration > 12) {
      showFieldError(dom.fieldDuration, "La duracion debe estar entre 1 y 12 horas.");
      isValid = false;
    }

    const maxGroup = Number(dom.fieldMaxGroup.value);
    if (Number.isNaN(maxGroup) || maxGroup < 1 || maxGroup > 50) {
      showFieldError(dom.fieldMaxGroup, "El grupo debe estar entre 1 y 50 personas.");
      isValid = false;
    }

    const meetingPoint = dom.fieldMeetingPoint.value.trim();
    if (meetingPoint.length < 5) {
      showFieldError(dom.fieldMeetingPoint, "Ingresa un punto de encuentro valido.");
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

  function getFormSnapshot() {
    return JSON.stringify({
      id: dom.fieldTourId.value.trim(),
      title: dom.fieldTitle.value.trim(),
      description: dom.fieldDescription.value.trim(),
      price: String(dom.fieldPrice.value).trim(),
      category: dom.fieldCategory.value.trim(),
      duration: String(dom.fieldDuration.value).trim(),
      maxGroup: String(dom.fieldMaxGroup.value).trim(),
      meetingPoint: dom.fieldMeetingPoint.value.trim(),
      included: dom.fieldIncluded.value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .join(","),
      status: dom.fieldStatus.value,
    });
  }

  function captureModalSnapshot() {
    state.modalInitialSnapshot = getFormSnapshot();
  }

  function hasUnsavedModalChanges() {
    return getFormSnapshot() !== state.modalInitialSnapshot;
  }

  function closeModalInternal() {
    dom.modal.classList.remove("show");
    document.body.style.overflow = "";
    resetForm();
    state.modalInitialSnapshot = "";
  }

  function requestModalClose() {
    if (state.isSaving) return;
    if (
      hasUnsavedModalChanges() &&
      !window.confirm(
        "Tienes cambios sin guardar. Pulsa Aceptar para salir sin guardar o Cancelar para continuar editando.",
      )
    ) {
      return;
    }
    closeModalInternal();
  }

  function openModalForCreate() {
    dom.modalTitle.textContent = "Crear nuevo recorrido";
    resetForm();
    dom.modal.classList.add("show");
    document.body.style.overflow = "hidden";
    captureModalSnapshot();
  }

  function openModalForEdit(tourId) {
    const tour = state.tours.find((item) => String(item.id) === String(tourId));
    if (!tour) return;
    dom.modalTitle.textContent = "Editar recorrido";
    fillFormWithTour(tour);
    clearFormErrors();
    dom.modal.classList.add("show");
    document.body.style.overflow = "hidden";
    captureModalSnapshot();
  }

  function closeModal() {
    closeModalInternal();
  }

  async function createTour(payload) {
    if (window.KCGuideApi && state.guideId) {
      const response = await window.KCGuideApi.tours.create(state.guideId, payload);
      const created = response?.data || payload;
      return normalizeTour({
        ...created,
        bookings: created.bookings ?? 0,
        rating: created.rating ?? created.ratingAvg ?? null,
        imageClass: created.imageClass || getRandomImageClass(),
      });
    }

    throw new Error("No hay API disponible para crear recorridos.");
  }

  async function updateTour(tourId, payload) {
    if (window.KCGuideApi && state.guideId) {
      const response = await window.KCGuideApi.tours.update(state.guideId, tourId, payload);
      const updated = response?.data || payload;
      return normalizeTour({
        ...updated,
        id: updated.id ?? updated.tourId ?? tourId,
        imageClass: updated.imageClass || getRandomImageClass(),
      });
    }

    throw new Error("No hay API disponible para actualizar recorridos.");
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
    } catch (error) {
      console.error("No se pudo persistir el recorrido.", error);
      showAlert("No fue posible guardar el recorrido en la base de datos.", "danger");
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
      openUnderConstructionModal();
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
    dom.pageTitle = document.querySelector(".guide-section__title");
    dom.pageSubtitle = document.querySelector(".guide-section__subtitle");
    dom.sidebarUserName = document.getElementById("userName");
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
    dom.categoryList = document.getElementById("categoryList");

    dom.btnCreateTour?.addEventListener("click", openModalForCreate);
    dom.btnCloseModal?.addEventListener("click", requestModalClose);
    dom.btnCancelModal?.addEventListener("click", requestModalClose);
    dom.form?.addEventListener("submit", handleFormSubmit);
    dom.toursGrid?.addEventListener("click", handleTourGridClick);

    dom.modal?.addEventListener("click", (event) => {
      if (event.target === dom.modal) requestModalClose();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!dom.modal?.classList.contains("show")) return;
      event.preventDefault();
      requestModalClose();
    });
  }

  async function init() {
    bind();
    renderToursLoading();
    await hydrateCurrentUser();
    renderCurrentUser();
    await hydrateCategoryOptions();
    await hydrateFromApi();
    renderTours();
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


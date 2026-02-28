/* ==========================================================
   profiles.js (Wizard) - Pantalla 2
   Requiere:
   - ProfilesController.js (crea window.profilesController)
   - storage.js (loadAppState / saveAppState)
   ========================================================== */

/* ---------------------------- Helpers DOM ----------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------------------------- State global ----------------------------- */
const state = {
  role: "traveler",
  stepIndex: 0,
  answers: { traveler: {}, guide: {} },
  currentProfileId: null
};

// Carga state + controller desde localStorage
if (typeof loadAppState === "function") {
  loadAppState(state, profilesController);
} else {
  console.warn("Advertencia: falta storage.js (loadAppState/saveAppState).");
}

const flowQueryParams = new URLSearchParams(window.location.search);
const isEmbeddedFlow = flowQueryParams.get("embed") === "1";

function resolveStartPath() {
  const path = String(window.location.pathname || "").replace(/\\/g, "/").toLowerCase();
  if (path.includes("/frontend/src/pages/")) {
    return "../../../../index.html";
  }
  return "./index.html";
}

function notifyParentToCloseModal() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "kc-onboarding-close" }, window.location.origin);
  }
}

function notifyParentToResize() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "kc-onboarding-resize" }, window.location.origin);
  }
}

function notifyParentBackToRegister() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "kc-onboarding-back-to-register" }, window.location.origin);
  }
}

function resolveDashboardPathByRole(role) {
  const normalizedRole = String(role || "").trim().toLowerCase();
  const dashboardPath =
    normalizedRole === "guide"
      ? "Dashboard/guia/mainUserGuide.html"
      : "Dashboard/turista/mainUserTourist.html";

  const path = String(window.location.pathname || "").replace(/\\/g, "/").toLowerCase();
  const pagesPrefix = path.includes("/frontend/src/pages/") ? "../" : "./frontend/src/pages/";
  return `${pagesPrefix}${dashboardPath}`;
}

function redirectToDashboardByRole() {
  if (isEmbeddedFlow && window.parent && window.parent !== window) {
    window.parent.postMessage(
      { type: "kc-onboarding-complete", role: state.role },
      window.location.origin,
    );
    return;
  }
  const dashboardPath = resolveDashboardPathByRole(state.role);
  window.location.href = dashboardPath;
}

/* ---------------------------- Constants ----------------------------- */
const LANGUAGES_WORLD = [
  "Español","Inglés","Francés","Alemán","Italiano","Portugués","Neerlandés","Sueco","Noruego","Danés",
  "Finés","Polaco","Checo","Eslovaco","Húngaro","Rumano","Búlgaro","Griego","Turco","Ruso","Ucraniano",
  "Serbio","Croata","Bosnio","Esloveno","Albanés","Macedonio","Lituano","Letón","Estonio","Irlandés",
  "Galés","Catalán","Euskera","Gallego",
  "Árabe","Hebreo","Persa (Farsi)","Kurdo","Urdu","Hindi","Bengalí","Punjabi","Gujarati","Maratí","Tamil",
  "Telugu","Kannada","Malayalam","Sinhala","Nepalí",
  "Chino (Mandarín)","Cantonés","Japonés","Coreano","Tailandés","Vietnamita","Indonesio","Malayo","Filipino (Tagalog)",
  "Birmano","Jemer (Camboyano)","Laosiano","Mongol",
  "Suajili","Amárico","Hausa","Yoruba","Igbo","Somalí","Zulu","Xhosa","Afrikáans",
  "Quechua","Guaraní","Náhuatl","Maya (Yucateco)","Aymara"
];

const FORMS = {
  traveler: {
    title: "Completa tu Perfil",
    subtitle: "Ayúdanos a personalizar tu experiencia",
    steps: [
      {
        id: "interests",
        title: "¿Cuáles son tus intereses?",
        hint: "Selecciona 6 intereses",
        type: "chips",
        key: "interests",
        multi: true,
        max: 6,
        options: ["Cultura", "Gastronomía", "Aventura", "Naturaleza", "Historia", "Arte", "Fotografía", "Vida nocturna", "Compras", "Bienestar/Relax"]
      },
      {
        id: "style_lang",
        title: "Tu estilo de viaje",
        hint: "",
        type: "group",
        fields: [
          { type: "select", key: "travelStyle", label: "Estilo de viaje", placeholder: "Selecciona tu estilo de viaje", options: ["Económico", "Mid-range", "Premium", "Lujo", "Me adapto"] },
          { type: "multiselect", key: "languages", label: "Idiomas que hablas", hint: "Selecciona uno o varios", placeholder: "Buscar idioma...", options: LANGUAGES_WORLD, max: 8 }
        ]
      },
      {
        id: "pace_social",
        title: "Ritmo y compañía",
        hint: "Así ajustamos el guía ideal",
        type: "group",
        fields: [
          { type: "range", key: "pace", label: "¿Qué tan activo quieres que sea el viaje?", minLabel: "Relax", maxLabel: "Muy activo", min: 0, max: 10, step: 1, default: 5 },
          { type: "select", key: "groupPreference", label: "¿Cómo prefieres viajar?", placeholder: "Selecciona una opción", options: ["Solo/Privado", "Pareja", "Familia", "Grupo pequeño (3-6)", "Grupo mediano (7-12)", "Me adapto"] }
        ]
      },
      {
        id: "food_planning",
        title: "Comida y planeación",
        hint: "Preferencias que cambian el match",
        type: "group",
        fields: [
          { type: "chips", key: "foodPrefs", label: "Preferencias de comida", hint: "Selecciona 5", multi: true, max: 5, options: ["Todo", "Vegetariano", "Vegano", "Sin gluten", "Sin lácteos", "Mariscos sí", "Mariscos no", "Picante sí", "Picante no"] },
          {
            type: "likert",
            key: "planningLevel",
            label: "Prefiero itinerario estructurado (vs improvisar)",
            options: [
              { value: 1, label: "Improvisar" },
              { value: 2, label: "Flexible" },
              { value: 3, label: "Balance" },
              { value: 4, label: "Planeado" },
              { value: 5, label: "Muy planeado" }
            ]
          }
        ]
      },
      {
        id: "comfort",
        title: "Comodidades",
        hint: "",
        type: "group",
        fields: [
          { type: "select", key: "transport", label: "Transporte preferido", placeholder: "Selecciona una opción", options: ["Caminar", "Transporte público", "Auto privado", "Taxi/Uber", "Me adapto"] },
          { type: "select", key: "photoVibe", label: "Fotos durante el tour", placeholder: "Selecciona una opción", options: ["Me encanta (muchas fotos)", "Algunas fotos", "Pocas fotos", "Prefiero no"] }
        ]
      },
      {
        id: "needs",
        title: "Necesidades y logística",
        hint: "Para una experiencia segura y cómoda",
        type: "group",
        fields: [
          { type: "chips", key: "accessibility", label: "Accesibilidad / Consideraciones", hint: "Selecciona si aplica", multi: true, max: 4, options: ["Movilidad reducida", "Rutas tranquilas", "Evitar multitudes", "Sombras/descansos", "Ninguna"] },
          { type: "textarea", key: "notes", label: "Algo importante a considerar (opcional)", placeholder: "Ej. prefiero empezar temprano, me gusta caminar poco, etc.", optional: true }
        ]
      }
    ]
  },

  guide: {
    title: "Completa tu Perfil",
    subtitle: "Cuéntale a los viajeros sobre tu experiencia",
    steps: [
      {
        id: "expertise",
        title: "Áreas de experiencia",
        hint: "Selecciona 6 experiencias",
        type: "chips",
        key: "expertise",
        multi: true,
        max: 6,
        options: ["Historia", "Tours gastronómicos", "Aventura", "Fotografía", "Arte y cultura", "Naturaleza", "Vida nocturna", "Experiencias premium", "Tours familiares"]
      },
      {
        id: "locations",
        title: "Ubicaciones donde guías",
        hint: "Selecciona varias",
        type: "chips",
        key: "locations",
        multi: true,
        max: 8,
        options: ["Ciudad de México", "Tulum", "Guadalajara", "Oaxaca", "Cancún", "Monterrey", "Querétaro", "Puebla", "Mérida", "San Miguel de Allende"]
      },
      {
        id: "level_lang",
        title: "Experiencia e idiomas",
        hint: "Para match por expectativas",
        type: "group",
        fields: [
          { type: "select", key: "experienceLevel", label: "Nivel de experiencia", placeholder: "Selecciona tu nivel", options: ["Nuevo (0-6 meses)", "Intermedio (6-24 meses)", "Avanzado (2+ años)", "Experto (5+ años)"] },
          { type: "multiselect", key: "languages", label: "Idiomas que hablas", hint: "Selecciona uno o varios", placeholder: "Buscar idioma...", options: LANGUAGES_WORLD, max: 8 }
        ]
      },
      {
        id: "style_group",
        title: "Tu estilo de guía",
        hint: "Para alinear vibras",
        type: "group",
        fields: [
          { type: "select", key: "guideStyle", label: "Estilo de guía", placeholder: "Selecciona una opción", options: ["Narrativo (muchas historias)", "Práctico (tips y logística)", "Flexible (me adapto)", "Aventura (reto/energía)", "Relax (sin prisa)"] },
          { type: "select", key: "groupSize", label: "Tamaño de grupo ideal", placeholder: "Selecciona una opción", options: ["1-2", "3-6", "7-12", "12+", "Me adapto"] }
        ]
      },
      {
        id: "pace_logistics",
        title: "Ritmo y logística",
        hint: "Preferencias operativas",
        type: "group",
        fields: [
          { type: "range", key: "pace", label: "Ritmo típico de tus tours", minLabel: "Tranquilo", maxLabel: "Intenso", min: 0, max: 10, step: 1, default: 5 },
          { type: "chips", key: "transportSupport", label: "¿Qué ofreces en transporte?", hint: "Selecciona si aplica", multi: true, max: 3, options: ["Caminar", "Transporte público", "Auto propio", "Coordino chofer", "No incluyo transporte"] }
        ]
      },
      {
        id: "safety_access",
        title: "Seguridad y accesibilidad",
        hint: "Mejora confianza del viajero",
        type: "group",
        fields: [
          { type: "chips", key: "certs", label: "Certificaciones / preparación", hint: "Selecciona si aplica", multi: true, max: 4, options: ["Primeros auxilios", "Guía certificado", "Protección civil", "Tour operator", "Ninguna"] },
          { type: "chips", key: "accessibility", label: "Accesibilidad que puedes cubrir", hint: "Selecciona varias", multi: true, max: 4, options: ["Movilidad reducida", "Rutas tranquilas", "Evitar multitudes", "Paradas frecuentes", "No especializado"] }
        ]
      },
      {
        id: "notes",
        title: "Detalles finales",
        hint: "Esto ayuda a cerrar el match",
        type: "group",
        fields: [
          { type: "select", key: "photoVibe", label: "Estilo con fotos", placeholder: "Selecciona una opción", options: ["Tomo fotos proactivamente", "Solo si me piden", "Pocas fotos", "No ofrezco fotos"] },
          { type: "textarea", key: "notes", label: "Notas (opcional)", placeholder: "Ej. disponibilidad, horarios, estilo personal, qué te encanta mostrar, etc.", optional: true }
        ]
      }
    ]
  }
};

/* ---------------------------- DOM refs ----------------------------- */
const stepperEl = $("#stepper");
const stepsContainer = $("#stepsContainer");
const formTitle = $("#formTitle");
const formSubtitle = $("#formSubtitle");

const btnBack = $("#btnBack");
const btnNext = $("#btnNext");
const btnSave = $("#btnSave");

const btnClose = $("#btnClose");
const stepFeedback = $("#stepFeedback");

/* ---------------------------- Basic guards ----------------------------- */
function ensureHasBaseProfileOrRedirect(){
  if (!state.currentProfileId) {
    alert("Primero completa el registro desde el formulario principal.");
    redirectToStartFlow();
    return false;
  }
  return true;
}

/* ---------------------------- State helpers ----------------------------- */
function currentForm(){ return FORMS[state.role]; }
function currentAnswers(){ return state.answers[state.role]; }

function showStepFeedback(message){
  if (!stepFeedback) return;
  stepFeedback.textContent = String(message || "");
  window.setTimeout(notifyParentToResize, 20);
}

function clearStepFeedback(){
  showStepFeedback("");
}

function setAnswer(key, value){
  currentAnswers()[key] = value;
  clearStepFeedback();
}
function getAnswer(key, fallback){
  const v = currentAnswers()[key];
  return (v === undefined ? fallback : v);
}

function hasMeaningfulValue(value){
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.trim() !== "";
  if (value && typeof value === "object") {
    return Object.values(value).some((item) => hasMeaningfulValue(item));
  }
  return Boolean(value);
}

function hasWizardProgress(){
  if (state.stepIndex > 0) return true;
  return hasMeaningfulValue(currentAnswers());
}

function confirmExitIfNeeded(){
  if (!hasWizardProgress()) return true;
  return window.confirm(
    "Ya tienes avances en tu perfil. Si sales ahora, podras retomarlo despues desde este punto. Deseas salir?",
  );
}

function setRole(role){
  state.role = role;
  state.stepIndex = 0;
  render();
  saveAppState(state, profilesController);
}

/* ---------------------------- Rendering ----------------------------- */
function render(){
  const form = currentForm();
  if (!form) return;

  formTitle.textContent = form.title;
  formSubtitle.textContent = form.subtitle;

  renderStepper(form.steps.length);
  renderStep(form.steps[state.stepIndex], state.stepIndex, form.steps.length);
  clearStepFeedback();

  btnBack.disabled = (state.stepIndex === 0 && !isEmbeddedFlow);
  btnNext.textContent = (state.stepIndex === form.steps.length - 1) ? "Finalizar Registro" : "Siguiente";
  window.setTimeout(notifyParentToResize, 20);
}

function renderStepper(total){
  stepperEl.innerHTML = "";
  for(let i=0; i<total; i++){
    const dot = document.createElement("div");
    dot.className = "step-dot";
    if(i === state.stepIndex) dot.classList.add("active");
    if(i < state.stepIndex) dot.classList.add("done");
    stepperEl.appendChild(dot);
  }
}

function renderStep(step, idx, total){
  stepsContainer.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "step active";

  const field = document.createElement("div");
  field.className = "field";

  const labelRow = document.createElement("div");
  labelRow.className = "label-row";

  const label = document.createElement("label");
  label.textContent = step.title;

  const hint = document.createElement("div");
  hint.className = "hint";
  hint.textContent = step.hint || `Paso ${idx + 1} de ${total}`;

  labelRow.appendChild(label);
  labelRow.appendChild(hint);
  field.appendChild(labelRow);

  if(step.type === "chips"){
    field.appendChild(renderChips(step.key, step.options, !!step.multi, step.max));
  } else if(step.type === "group"){
    const group = document.createElement("div");
    group.className = "field";
    step.fields.forEach(f => group.appendChild(renderField(f)));
    field.appendChild(group);
  } else {
    const p = document.createElement("p");
    p.textContent = "Tipo de pregunta no soportado.";
    field.appendChild(p);
  }

  wrap.appendChild(field);
  stepsContainer.appendChild(wrap);
}

/* ---------------------------- Field renderers ----------------------------- */
function renderField(f){
  const container = document.createElement("div");
  container.className = "field";

  const labelRow = document.createElement("div");
  labelRow.className = "label-row";

  const label = document.createElement("label");
  label.textContent = f.label || "";

  const hint = document.createElement("div");
  hint.className = "hint";
  hint.textContent = f.hint || "";

  labelRow.appendChild(label);
  labelRow.appendChild(hint);
  container.appendChild(labelRow);

  if(f.type === "select"){
    container.appendChild(renderModernSelect(f));
  }

  if(f.type === "textarea"){
    const ta = document.createElement("textarea");
    ta.className = "input";
    ta.rows = 4;
    ta.placeholder = f.placeholder || "";
    ta.value = getAnswer(f.key, "");
    ta.addEventListener("input", () => setAnswer(f.key, ta.value));
    container.appendChild(ta);
  }

  if(f.type === "range"){
    const rangeWrap = document.createElement("div");
    rangeWrap.className = "range-wrap";

    const meta = document.createElement("div");
    meta.className = "range-meta";
    const left = document.createElement("span");
    left.textContent = f.minLabel || "Min";
    const right = document.createElement("span");
    right.textContent = f.maxLabel || "Max";
    meta.appendChild(left);
    meta.appendChild(right);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = f.min;
    slider.max = f.max;
    slider.step = f.step || 1;

    const storedValue = getAnswer(f.key, undefined);
    const hasStoredNumericValue =
      storedValue !== null &&
      storedValue !== undefined &&
      String(storedValue).trim() !== "" &&
      Number.isFinite(Number(storedValue));
    const initialValue = Number(hasStoredNumericValue ? storedValue : (f.default ?? f.min));
    slider.value = initialValue;
    // El valor inicial del slider debe contar como respuesta valida aunque el usuario no lo mueva.
    if (!hasStoredNumericValue) {
      setAnswer(f.key, initialValue);
    }

    const setFill = () => {
      const percent = ((slider.value - slider.min) * 100) / (slider.max - slider.min);
      slider.style.setProperty("--fill", `${percent}%`);
    };
    setFill();

    const valueLine = document.createElement("div");
    valueLine.className = "hint";
    valueLine.textContent = `Valor: ${slider.value}`;

    slider.addEventListener("input", () => {
      setAnswer(f.key, Number(slider.value));
      valueLine.textContent = `Valor: ${slider.value}`;
      setFill();
    });

    rangeWrap.appendChild(meta);
    rangeWrap.appendChild(slider);
    rangeWrap.appendChild(valueLine);
    container.appendChild(rangeWrap);
  }

  if(f.type === "likert"){
    const wrap = document.createElement("div");
    wrap.className = "likert";

    const existing = getAnswer(f.key, null);

    (f.options || []).forEach(opt => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn ghost likert__button";
      b.textContent = opt.label;
      if(existing === opt.value) b.classList.add("is-selected");

      b.addEventListener("click", () => {
        setAnswer(f.key, opt.value);
        $$("button", wrap).forEach(x => x.classList.remove("is-selected"));
        b.classList.add("is-selected");
      });

      wrap.appendChild(b);
    });

    container.appendChild(wrap);
  }

  if(f.type === "chips"){
    container.appendChild(renderChips(f.key, f.options, !!f.multi, f.max));
  }

  if(f.type === "multiselect"){
    container.appendChild(renderModernMultiselect(f));
  }

  return container;
}


function createDropdownShell(extraClass){
  const ms = document.createElement("div");
  ms.className = extraClass ? `ms ${extraClass}` : "ms";

  const header = document.createElement("button");
  header.type = "button";
  header.className = "ms-header";
  header.setAttribute("aria-expanded", "false");

  const titleSpan = document.createElement("span");
  const count = document.createElement("span");
  count.className = "ms-count";

  const caret = document.createElement("span");
  caret.className = "ms-caret";
  caret.textContent = "v";

  header.appendChild(titleSpan);
  header.appendChild(count);
  header.appendChild(caret);

  const panel = document.createElement("div");
  panel.className = "ms-panel";

  const list = document.createElement("div");
  list.className = "ms-list";
  panel.appendChild(list);

  ms.appendChild(header);
  ms.appendChild(panel);

  const toggle = (open) => {
    ms.classList.toggle("open", open);
    header.setAttribute("aria-expanded", open ? "true" : "false");
    window.setTimeout(notifyParentToResize, 20);
  };

  header.addEventListener("click", () => toggle(!ms.classList.contains("open")));

  document.addEventListener("click", (event) => {
    if(!ms.contains(event.target)) toggle(false);
  });

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") toggle(false);
  });

  return { ms, header, panel, list, titleSpan, count, toggle };
}

function renderModernSelect(f){
  const { ms, panel, list, titleSpan, count, toggle } = createDropdownShell("ms--single");
  const options = Array.isArray(f.options) ? f.options : [];
  const enableSearch = options.length > 7;
  let search = null;

  if(enableSearch){
    search = document.createElement("input");
    search.type = "text";
    search.className = "ms-search";
    search.placeholder = "Buscar opcion...";
    panel.insertBefore(search, list);
  }

  function getCurrentValue(){
    return String(getAnswer(f.key, "") || "");
  }

  function updateHeader(){
    const current = getCurrentValue();
    titleSpan.textContent = current || (f.placeholder || "Selecciona una opcion");
    titleSpan.classList.toggle("ms-placeholder", !current);
    count.textContent = current ? "1/1" : "";
  }

  function renderList(){
    const query = (search?.value || "").trim().toLowerCase();
    const current = getCurrentValue();
    const filtered = options.filter((opt) => String(opt).toLowerCase().includes(query));

    list.innerHTML = "";
    if(!filtered.length){
      const empty = document.createElement("p");
      empty.className = "ms-empty";
      empty.textContent = "Sin resultados.";
      list.appendChild(empty);
      return;
    }

    filtered.forEach((opt) => {
      const value = String(opt);
      const option = document.createElement("button");
      option.type = "button";
      option.className = "ms-option";
      option.textContent = value;
      option.classList.toggle("is-selected", value === current);
      option.addEventListener("click", () => {
        setAnswer(f.key, value);
        updateHeader();
        renderList();
        toggle(false);
      });
      list.appendChild(option);
    });
  }

  if(search){
    search.addEventListener("input", renderList);
    ms.querySelector(".ms-header")?.addEventListener("click", () => {
      if(ms.classList.contains("open")){
        search.value = "";
        renderList();
        setTimeout(() => search.focus(), 0);
      }
    });
  }

  updateHeader();
  renderList();
  return ms;
}

function renderModernMultiselect(f){
  const existing = getAnswer(f.key, []);
  if(!Array.isArray(existing)) setAnswer(f.key, []);

  const { ms, list, titleSpan, count } = createDropdownShell("ms--multi");
  const search = document.createElement("input");
  search.type = "text";
  search.className = "ms-search";
  search.placeholder = f.placeholder || "Buscar...";
  ms.querySelector(".ms-panel")?.insertBefore(search, list);

  const max = f.max ?? Infinity;
  const options = Array.isArray(f.options) ? f.options : [];

  function getSelected(){
    const arr = getAnswer(f.key, []);
    return Array.isArray(arr) ? arr : [];
  }

  function updateHeader(){
    const arr = getSelected();
    if(arr.length){
      const summary = arr.slice(0, 2).join(", ");
      const extra = arr.length > 2 ? ` +${arr.length - 2}` : "";
      titleSpan.textContent = `${summary}${extra}`;
      titleSpan.classList.remove("ms-placeholder");
    } else {
      titleSpan.textContent = f.placeholderEmpty || "Selecciona opciones";
      titleSpan.classList.add("ms-placeholder");
    }
    count.textContent = arr.length ? `${arr.length}/${max === Infinity ? "*" : max}` : "";
  }

  function renderList(){
    const q = (search.value || "").trim().toLowerCase();
    const arr = getSelected();
    const filtered = options.filter((opt) => String(opt).toLowerCase().includes(q));
    list.innerHTML = "";

    if(!filtered.length){
      const empty = document.createElement("p");
      empty.className = "ms-empty";
      empty.textContent = "Sin resultados.";
      list.appendChild(empty);
      return;
    }

    filtered.forEach((opt) => {
      const value = String(opt);
      const row = document.createElement("label");
      row.className = "ms-item";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = arr.includes(value);

      cb.addEventListener("change", () => {
        const current = getSelected();
        const has = current.includes(value);

        if(cb.checked && !has){
          if(current.length >= max){
            cb.checked = false;
            return;
          }
          setAnswer(f.key, [...current, value]);
        } else if(!cb.checked && has){
          setAnswer(f.key, current.filter((x) => x !== value));
        }

        updateHeader();
      });

      const text = document.createElement("span");
      text.textContent = value;

      row.appendChild(cb);
      row.appendChild(text);
      list.appendChild(row);
    });
  }

  search.addEventListener("input", renderList);
  ms.querySelector(".ms-header")?.addEventListener("click", () => {
    if(ms.classList.contains("open")){
      search.value = "";
      renderList();
      setTimeout(() => search.focus(), 0);
    }
  });

  updateHeader();
  renderList();
  return ms;
}
/* ---------------------------- Chips ----------------------------- */
function renderChips(key, options, multi, max){
  const wrap = document.createElement("div");
  wrap.className = "chips";

  const existing = getAnswer(key, multi ? [] : "");
  if(multi && !Array.isArray(existing)) setAnswer(key, []);
  if(!multi && Array.isArray(existing)) setAnswer(key, "");

  (options || []).forEach(opt => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = opt;

    const selected = isChipSelected(key, opt, multi);
    if(selected) chip.classList.add("selected");

    chip.addEventListener("click", () => {
      if(multi){
        const arr = getAnswer(key, []);
        const already = arr.includes(opt);

        const isNone = (opt.toLowerCase() === "ninguna" || opt.toLowerCase() === "no especializado");
        if(isNone){
          setAnswer(key, [opt]);
        } else {
          const cleaned = arr.filter(x => x.toLowerCase() !== "ninguna" && x.toLowerCase() !== "no especializado");
          if(already){
            setAnswer(key, cleaned.filter(x => x !== opt));
          } else {
            if(max && cleaned.length >= max) return;
            setAnswer(key, [...cleaned, opt]);
          }
        }
      } else {
        const current = getAnswer(key, "");
        setAnswer(key, current === opt ? "" : opt);
      }

      render(); // rerender para pintar seleccionados
    });

    wrap.appendChild(chip);
  });

  return wrap;
}

function isChipSelected(key, opt, multi){
  const v = getAnswer(key, multi ? [] : "");
  return multi ? (Array.isArray(v) && v.includes(opt)) : (v === opt);
}

/* ---------------------------- Validation ----------------------------- */
function isOptionalField(field){
  return Boolean(field?.optional);
}

function fieldHasValue(field){
  const value = getAnswer(field.key, null);

  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value);

  return value !== null && value !== undefined && String(value).trim() !== "";
}

function getMissingFieldMessage(field){
  const fieldLabel = field?.label ? `"${field.label}"` : "este campo";
  if (field?.type === "select" || field?.type === "chips" || field?.type === "multiselect" || field?.type === "likert") {
    return `Selecciona una opción para ${fieldLabel}.`;
  }
  return `Completa ${fieldLabel} para continuar.`;
}

function validateStep(){
  const step = currentForm().steps[state.stepIndex];

  if(step.type === "chips"){
    const v = getAnswer(step.key, step.multi ? [] : "");
    const isValid = step.multi ? (Array.isArray(v) && v.length > 0) : !!v;
    if (!isValid) {
      return {
        isValid: false,
        message: "Selecciona al menos una opción para continuar.",
      };
    }
    return { isValid: true, message: "" };
  }

  if(step.type === "group"){
    const requiredFields = step.fields.filter((field) => !isOptionalField(field));
    const missingField = requiredFields.find((field) => !fieldHasValue(field));
    if (missingField) {
      return { isValid: false, message: getMissingFieldMessage(missingField) };
    }
    return { isValid: true, message: "" };
  }

  return { isValid: true, message: "" };
}

/* ---------------------------- Navigation ----------------------------- */
function next(){
  const form = currentForm();
  const validation = validateStep();

  if(!validation.isValid){
    showStepFeedback(validation.message || "Completa los datos de este paso para continuar.");
    $(".card").style.boxShadow = "0 12px 28px rgba(216,116,0,.20)";
    setTimeout(() => $(".card").style.boxShadow = "", 140);
    return;
  }

  if(state.stepIndex < form.steps.length - 1){
    state.stepIndex++;
    render();
    saveAppState(state, profilesController);
  } else {
    finish();
  }
}

function back(){
  if(state.stepIndex > 0){
    state.stepIndex--;
    render();
    saveAppState(state, profilesController);
    return;
  }

  clearStepFeedback();

  if (isEmbeddedFlow) {
    saveAppState(state, profilesController);
    if (!confirmExitIfNeeded()) return;
    notifyParentBackToRegister();
  }
}

/* ---------------------------- Finish ----------------------------- */
function finish(){
  // Si no hay perfil base, regresa a la pantalla 1
  if (!ensureHasBaseProfileOrRedirect()) return;

  // Guardar estado UI
  saveAppState(state, profilesController);

  // Actualizar el perfil creado en Pantalla 1 con answers del wizard
  const updated = profilesController.updateProfile(state.currentProfileId, {
    role: state.role,
    answers: currentAnswers()
  });

  saveAppState(state, profilesController);

  console.log("Perfil completo listo:", updated);
  redirectToDashboardByRole();
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------------------------- Events ----------------------------- */
btnNext?.addEventListener("click", next);
btnBack?.addEventListener("click", back);

btnSave?.addEventListener("click", () => {
  saveAppState(state, profilesController);
  btnSave.textContent = "Guardado ✓";
  setTimeout(() => btnSave.textContent = "Guardar", 900);
});

btnClose?.addEventListener("click", () => {
  saveAppState(state, profilesController);
  if (!confirmExitIfNeeded()) return;
  if (isEmbeddedFlow) {
    notifyParentToCloseModal();
    return;
  }
  alert("Guardado. Puedes cerrar esta pestaña.");
});

window.addEventListener("beforeunload", () => {
  saveAppState(state, profilesController);
});

/* Tabs
$$(".tab").forEach(t => {
  t.addEventListener("click", () => {
    $$(".tab").forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    $$(".tab").forEach(x => x.setAttribute("aria-selected", "false"));
    t.setAttribute("aria-selected", "true");
    setRole(t.dataset.role);
  });
});*/

function redirectToStartFlow(){
  if (isEmbeddedFlow) {
    notifyParentToCloseModal();
    return;
  }
  window.location.href = resolveStartPath();
}


/* ---------------------------- Init ----------------------------- */
(function init(){

  // 1️ Cargar estado desde storage
  if (typeof loadAppState === "function") {
    loadAppState(state, profilesController);
  }

  // 2️ Verificar que exista un profileId válido
  const profileId = state.currentProfileId;

  if (!profileId) {
    console.warn("Advertencia: no existe currentProfileId. Cerrando flujo.");
    redirectToStartFlow();
    return;
  }

  // 3️ Verificar que el perfil realmente exista en el controller
  const profileExists = profilesController.items?.some(p => p.id === profileId);

  if (!profileExists) {
    console.warn("Advertencia: el perfil guardado no existe en controller. Cerrando flujo.");
    redirectToStartFlow();
    return;
  }

  // 4️ Si todo está correcto, continuar
  //$$(".tab").forEach(x => 
  //  x.classList.toggle("active", x.dataset.role === state.role)
  //);

  //$$(".tab").forEach(x => 
  //  x.setAttribute("aria-selected", x.dataset.role === state.role ? "true" : "false")
  //);

  render();
  window.setTimeout(notifyParentToResize, 40);
})();






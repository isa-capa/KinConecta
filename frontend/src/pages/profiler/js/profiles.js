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
  console.warn("⚠️ Falta storage.js (loadAppState/saveAppState).");
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
          { type: "multiselect", key: "languages", label: "Idiomas que hablas", hint: "Selecciona uno o varios", placeholder: "Buscar idioma…", options: LANGUAGES_WORLD, max: 8 }
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
          { type: "textarea", key: "notes", label: "Algo importante a considerar (opcional)", placeholder: "Ej. prefiero empezar temprano, me gusta caminar poco, etc." }
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
          { type: "multiselect", key: "languages", label: "Idiomas que hablas", hint: "Selecciona uno o varios", placeholder: "Buscar idioma…", options: LANGUAGES_WORLD, max: 8 }
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
          { type: "textarea", key: "notes", label: "Notas (opcional)", placeholder: "Ej. disponibilidad, horarios, estilo personal, qué te encanta mostrar, etc." }
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

const resultPanel = $("#resultPanel");
const resultJson = $("#resultJson");

const btnClose = $("#btnClose");
const btnCloseResult = $("#btnCloseResult");
const btnCopy = $("#btnCopy");
const btnRestart = $("#btnRestart");

/* ---------------------------- Basic guards ----------------------------- */
function ensureHasBaseProfileOrRedirect(){
  if (!state.currentProfileId) {
    alert("Primero crea el perfil (nombre/imagen/descripcion).");
    window.location.href = "./profiles-setup.html";
    return false;
  }
  return true;
}

/* ---------------------------- State helpers ----------------------------- */
function currentForm(){ return FORMS[state.role]; }
function currentAnswers(){ return state.answers[state.role]; }

function setAnswer(key, value){
  currentAnswers()[key] = value;
}
function getAnswer(key, fallback){
  const v = currentAnswers()[key];
  return (v === undefined ? fallback : v);
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

  btnBack.disabled = (state.stepIndex === 0);
  btnNext.textContent = (state.stepIndex === form.steps.length - 1) ? "Finalizar Registro" : "Siguiente";
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
    const wrap = document.createElement("div");
    wrap.className = "select-wrap";

    const sel = document.createElement("select");
    sel.innerHTML =
      `<option value="">${escapeHtml(f.placeholder || "Selecciona una opción")}</option>` +
      (f.options || []).map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("");

    sel.value = getAnswer(f.key, "") || "";
    sel.addEventListener("change", () => setAnswer(f.key, sel.value));

    wrap.appendChild(sel);
    container.appendChild(wrap);
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

    const existing = getAnswer(f.key, (f.default ?? f.min));
    slider.value = existing;

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
      b.textContent = opt.label;
      if(existing === opt.value) b.classList.add("selected");

      b.addEventListener("click", () => {
        setAnswer(f.key, opt.value);
        $$("button", wrap).forEach(x => x.classList.remove("selected"));
        b.classList.add("selected");
      });

      wrap.appendChild(b);
    });

    container.appendChild(wrap);
  }

  if(f.type === "chips"){
    container.appendChild(renderChips(f.key, f.options, !!f.multi, f.max));
  }

  if(f.type === "multiselect"){
    const existing = getAnswer(f.key, []);
    if(!Array.isArray(existing)) setAnswer(f.key, []);

    const ms = document.createElement("div");
    ms.className = "ms";

    const header = document.createElement("button");
    header.type = "button";
    header.className = "ms-header";

    const titleSpan = document.createElement("span");
    const count = document.createElement("span");
    count.className = "ms-count";

    const caret = document.createElement("span");
    caret.className = "ms-caret";
    caret.textContent = "▾";

    header.appendChild(titleSpan);
    header.appendChild(count);
    header.appendChild(caret);

    const panel = document.createElement("div");
    panel.className = "ms-panel";

    const search = document.createElement("input");
    search.type = "text";
    search.className = "ms-search";
    search.placeholder = f.placeholder || "Buscar…";

    const list = document.createElement("div");
    list.className = "ms-list";

    panel.appendChild(search);
    panel.appendChild(list);

    ms.appendChild(header);
    ms.appendChild(panel);
    container.appendChild(ms);

    const max = f.max ?? Infinity;

    function updateHeader(){
      const arr = getAnswer(f.key, []);
      titleSpan.textContent = arr.length ? arr.join(", ") : (f.placeholderEmpty || "Selecciona idiomas");
      count.textContent = arr.length ? `(${arr.length})` : "";
    }

    function renderList(){
      const q = (search.value || "").trim().toLowerCase();
      const arr = getAnswer(f.key, []);
      list.innerHTML = "";

      const filtered = (f.options || []).filter(opt => opt.toLowerCase().includes(q));
      filtered.forEach(opt => {
        const row = document.createElement("label");
        row.className = "ms-item";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = arr.includes(opt);

        cb.addEventListener("change", () => {
          const current = getAnswer(f.key, []);
          const has = current.includes(opt);

          if(cb.checked && !has){
            if(current.length >= max){
              cb.checked = false;
              return;
            }
            setAnswer(f.key, [...current, opt]);
          } else if(!cb.checked && has){
            setAnswer(f.key, current.filter(x => x !== opt));
          }

          updateHeader();
        });

        const text = document.createElement("span");
        text.textContent = opt;

        row.appendChild(cb);
        row.appendChild(text);
        list.appendChild(row);
      });
    }

    function toggle(open){
      ms.classList.toggle("open", open);
      if(open){
        search.value = "";
        renderList();
        setTimeout(() => search.focus(), 0);
      }
    }

    header.addEventListener("click", () => toggle(!ms.classList.contains("open")));
    search.addEventListener("input", renderList);

    document.addEventListener("click", (e) => {
      if(!ms.contains(e.target)) toggle(false);
    });

    updateHeader();
  }

  return container;
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
function validateStep(){
  const step = currentForm().steps[state.stepIndex];

  if(step.type === "chips"){
    const v = getAnswer(step.key, step.multi ? [] : "");
    return step.multi ? (Array.isArray(v) && v.length > 0) : !!v;
  }

  if(step.type === "group"){
    return step.fields.some(f => {
      const v = getAnswer(f.key, null);
      if(Array.isArray(v)) return v.length > 0;
      if(typeof v === "number") return true;
      return v !== null && v !== undefined && String(v).trim() !== "";
    });
  }

  return true;
}

/* ---------------------------- Navigation ----------------------------- */
function next(){
  const form = currentForm();

  if(!validateStep()){
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
  }
}

/* ---------------------------- Finish (UNIR TODO) ----------------------------- */
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

  console.log("✅ PERFIL COMPLETO LISTO:", updated);

  const payload = { profile: updated, meta: { version: "v2" } };
  resultJson.textContent = JSON.stringify(payload, null, 2);

  resultPanel.classList.add("show");
  resultPanel.setAttribute("aria-hidden", "false");
}

/* ---------------------------- Result panel ----------------------------- */
function closeResult(){
  resultPanel.classList.remove("show");
  resultPanel.setAttribute("aria-hidden", "true");
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
  alert("Guardado. Puedes cerrar esta pestaña.");
});

btnCloseResult?.addEventListener("click", closeResult);

resultPanel?.addEventListener("click", (e) => {
  if(e.target === resultPanel) closeResult();
});

btnCopy?.addEventListener("click", async () => {
  try{
    await navigator.clipboard.writeText(resultJson.textContent);
    btnCopy.textContent = "Copiado ✓";
    setTimeout(() => btnCopy.textContent = "Copiar JSON", 900);
  }catch(e){
    alert("No se pudo copiar. Copia manualmente desde el recuadro.");
  }
});

btnRestart?.addEventListener("click", () => {
  closeResult();
  render();
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

function redirectToSetup(){
  alert("Primero debes crear tu perfil base.");
  window.location.href = "./profiles-setup.html";
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
    console.warn("⚠️ No existe currentProfileId. Redirigiendo a setup.");
    redirectToSetup();
    return;
  }

  // 3️ Verificar que el perfil realmente exista en el controller
  const profileExists = profilesController.items?.some(p => p.id === profileId);

  if (!profileExists) {
    console.warn("⚠️ El perfil guardado no existe en controller. Redirigiendo.");
    redirectToSetup();
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
})();


/* ==========================================================
   Match Forms (Traveler & Guide)
   - Chips multi-select
   - Tag input for languages
   - Slider + Likert
   - Steps + progress
   - LocalStorage save
   ========================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = {
  role: "traveler",
  stepIndex: 0,
  answers: {
    traveler: {},
    guide: {}
  }
};

const STORAGE_KEY = "match_profile_v1";

/* ----------------------------
   QUESTIONS (Neutral & safe)
   Excludes: religion, politics, gender, discriminatory
----------------------------- */
const FORMS = {
  traveler: {
    title: "Completa tu Perfil",
    subtitle: "Ayúdanos a personalizar tu experiencia",
    steps: [
      {
        id: "interests",
        title: "¿Cuáles son tus intereses?",
        hint: "Selecciona varios",
        type: "chips",
        key: "interests",
        multi: true,
        max: 6,
        options: ["Cultura", "Gastronomía", "Aventura", "Naturaleza", "Historia", "Arte", "Fotografía", "Vida nocturna", "Compras", "Bienestar/Relax"]
      },
      {
        id: "style_lang",
        title: "Tu estilo de viaje",
        hint: "Dos cosas rápidas",
        type: "group",
        fields: [
          {
            type: "select",
            key: "travelStyle",
            label: "Estilo de viaje",
            placeholder: "Selecciona tu estilo de viaje",
            options: ["Económico", "Mid-range", "Premium", "Lujo", "Me adapto"]
          },
          {
            type: "tags",
            key: "languages",
            label: "Idiomas que hablas",
            placeholder: "Ej. Español, Inglés, Francés"
          }
        ]
      },
      {
        id: "pace_social",
        title: "Ritmo y compañía",
        hint: "Así ajustamos el guía ideal",
        type: "group",
        fields: [
          {
            type: "range",
            key: "pace",
            label: "¿Qué tan activo quieres que sea el viaje?",
            minLabel: "Relax",
            maxLabel: "Muy activo",
            min: 0, max: 10, step: 1, default: 5
          },
          {
            type: "select",
            key: "groupPreference",
            label: "¿Cómo prefieres viajar?",
            placeholder: "Selecciona una opción",
            options: ["Solo/Privado", "Pareja", "Familia", "Grupo pequeño (3-6)", "Grupo mediano (7-12)", "Me adapto"]
          }
        ]
      },
      {
        id: "food_planning",
        title: "Comida y planeación",
        hint: "Preferencias que cambian el match",
        type: "group",
        fields: [
          {
            type: "chips",
            key: "foodPrefs",
            label: "Preferencias de comida",
            hint: "Selecciona varias",
            multi: true,
            max: 5,
            options: ["Todo", "Vegetariano", "Vegano", "Sin gluten", "Sin lácteos", "Mariscos sí", "Mariscos no", "Picante sí", "Picante no"]
          },
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
        hint: "Solo lo necesario",
        type: "group",
        fields: [
          {
            type: "select",
            key: "transport",
            label: "Transporte preferido",
            placeholder: "Selecciona una opción",
            options: ["Caminar", "Transporte público", "Auto privado", "Taxi/Uber", "Me adapto"]
          },
          {
            type: "select",
            key: "photoVibe",
            label: "Fotos durante el tour",
            placeholder: "Selecciona una opción",
            options: ["Me encanta (muchas fotos)", "Algunas fotos", "Pocas fotos", "Prefiero no"]
          }
        ]
      },
      {
        id: "needs",
        title: "Necesidades y logística",
        hint: "Para una experiencia segura y cómoda",
        type: "group",
        fields: [
          {
            type: "chips",
            key: "accessibility",
            label: "Accesibilidad / Consideraciones",
            hint: "Selecciona si aplica",
            multi: true,
            max: 4,
            options: ["Movilidad reducida", "Rutas tranquilas", "Evitar multitudes", "Sombras/descansos", "Ninguna"]
          },
          {
            type: "textarea",
            key: "notes",
            label: "Algo importante a considerar (opcional)",
            placeholder: "Ej. prefiero empezar temprano, me gusta caminar poco, etc."
          }
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
        hint: "Selecciona varias",
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
          {
            type: "select",
            key: "experienceLevel",
            label: "Nivel de experiencia",
            placeholder: "Selecciona tu nivel",
            options: ["Nuevo (0-6 meses)", "Intermedio (6-24 meses)", "Avanzado (2+ años)", "Experto (5+ años)"]
          },
          {
            type: "tags",
            key: "languages",
            label: "Idiomas que hablas",
            placeholder: "Ej. Español, Inglés, Francés"
          }
        ]
      },
      {
        id: "style_group",
        title: "Tu estilo de guía",
        hint: "Para alinear vibras",
        type: "group",
        fields: [
          {
            type: "select",
            key: "guideStyle",
            label: "Estilo de guía",
            placeholder: "Selecciona una opción",
            options: ["Narrativo (muchas historias)", "Práctico (tips y logística)", "Flexible (me adapto)", "Aventura (reto/energía)", "Relax (sin prisa)"]
          },
          {
            type: "select",
            key: "groupSize",
            label: "Tamaño de grupo ideal",
            placeholder: "Selecciona una opción",
            options: ["1-2", "3-6", "7-12", "12+", "Me adapto"]
          }
        ]
      },
      {
        id: "pace_logistics",
        title: "Ritmo y logística",
        hint: "Preferencias operativas",
        type: "group",
        fields: [
          {
            type: "range",
            key: "pace",
            label: "Ritmo típico de tus tours",
            minLabel: "Tranquilo",
            maxLabel: "Intenso",
            min: 0, max: 10, step: 1, default: 5
          },
          {
            type: "chips",
            key: "transportSupport",
            label: "¿Qué ofreces en transporte?",
            hint: "Selecciona si aplica",
            multi: true,
            max: 3,
            options: ["Caminar", "Transporte público", "Auto propio", "Coordino chofer", "No incluyo transporte"]
          }
        ]
      },
      {
        id: "safety_access",
        title: "Seguridad y accesibilidad",
        hint: "Mejora confianza del viajero",
        type: "group",
        fields: [
          {
            type: "chips",
            key: "certs",
            label: "Certificaciones / preparación",
            hint: "Selecciona si aplica",
            multi: true,
            max: 4,
            options: ["Primeros auxilios", "Guía certificado", "Protección civil", "Tour operator", "Ninguna"]
          },
          {
            type: "chips",
            key: "accessibility",
            label: "Accesibilidad que puedes cubrir",
            hint: "Selecciona varias",
            multi: true,
            max: 4,
            options: ["Movilidad reducida", "Rutas tranquilas", "Evitar multitudes", "Paradas frecuentes", "No especializado"]
          }
        ]
      },
      {
        id: "notes",
        title: "Detalles finales",
        hint: "Esto ayuda a cerrar el match",
        type: "group",
        fields: [
          {
            type: "select",
            key: "photoVibe",
            label: "Estilo con fotos",
            placeholder: "Selecciona una opción",
            options: ["Tomo fotos proactivamente", "Solo si me piden", "Pocas fotos", "No ofrezco fotos"]
          },
          {
            type: "textarea",
            key: "notes",
            label: "Notas (opcional)",
            placeholder: "Ej. disponibilidad, horarios, estilo personal, qué te encanta mostrar, etc."
          }
        ]
      }
    ]
  }
};

/* ----------------------------
   Rendering
----------------------------- */
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

function loadFromStorage(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;
    const parsed = JSON.parse(raw);
    if(parsed?.answers) state.answers = parsed.answers;
    if(parsed?.role) state.role = parsed.role;
  }catch(e){}
}

function saveToStorage(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    role: state.role,
    answers: state.answers
  }));
}

function setRole(role){
  state.role = role;
  state.stepIndex = 0;
  render();
}

function currentForm(){
  return FORMS[state.role];
}

function currentAnswers(){
  return state.answers[state.role];
}

function setAnswer(key, value){
  currentAnswers()[key] = value;
}

function getAnswer(key, fallback){
  const v = currentAnswers()[key];
  return (v === undefined ? fallback : v);
}

function render(){
  const form = currentForm();
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

  // Title row
  const field = document.createElement("div");
  field.className = "field";

  const labelRow = document.createElement("div");
  labelRow.className = "label-row";

  const label = document.createElement("label");
  label.textContent = step.title;

  const hint = document.createElement("div");
  hint.className = "hint";
  hint.textContent = step.hint || `Paso ${idx+1} de ${total}`;

  labelRow.appendChild(label);
  labelRow.appendChild(hint);
  field.appendChild(labelRow);

  if(step.type === "chips"){
    field.appendChild(renderChips(step.key, step.options, !!step.multi, step.max));
  } else if(step.type === "group"){
    const group = document.createElement("div");
    group.className = "field";

    // fields may include chips inside
    step.fields.forEach(f => {
      group.appendChild(renderField(f));
    });

    field.appendChild(group);
  } else {
    // fallback
    const p = document.createElement("p");
    p.textContent = "Tipo de pregunta no soportado.";
    field.appendChild(p);
  }

  wrap.appendChild(field);
  stepsContainer.appendChild(wrap);
}

function renderField(f){
  const container = document.createElement("div");
  container.className = "field";

  // label + hint
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
    sel.innerHTML = `<option value="">${f.placeholder || "Selecciona una opción"}</option>` +
      f.options.map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("");

    const existing = getAnswer(f.key, "");
    sel.value = existing || "";

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

  if(f.type === "tags"){
    const input = document.createElement("input");
    input.className = "input";
    input.placeholder = f.placeholder || "Escribe y presiona Enter";

    const tagsWrap = document.createElement("div");
    tagsWrap.className = "tags";

    const existing = getAnswer(f.key, []);
    if(!Array.isArray(existing)) setAnswer(f.key, []);
    renderTags(tagsWrap, f.key);

    input.addEventListener("keydown", (e) => {
      if(e.key === "Enter"){
        e.preventDefault();
        const val = input.value.trim();
        if(!val) return;
        addTag(f.key, val);
        input.value = "";
        renderTags(tagsWrap, f.key);
      }
      if(e.key === "," ){
        e.preventDefault();
        const val = input.value.replace(",", "").trim();
        if(!val) return;
        addTag(f.key, val);
        input.value = "";
        renderTags(tagsWrap, f.key);
      }
    });

    container.appendChild(input);
    container.appendChild(tagsWrap);
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

    const existing = getAnswer(f.key, f.default ?? f.min);
    slider.value = existing;

    const valueLine = document.createElement("div");
    valueLine.className = "hint";
    valueLine.textContent = `Valor: ${slider.value}`;

    slider.addEventListener("input", () => {
      setAnswer(f.key, Number(slider.value));
      valueLine.textContent = `Valor: ${slider.value}`;
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

    f.options.forEach(opt => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = opt.label;
      if(existing === opt.value) b.classList.add("selected");
      b.addEventListener("click", () => {
        setAnswer(f.key, opt.value);
        // rerender selection styles
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

  return container;
}

/* ----------------------------
   Chips
----------------------------- */
function renderChips(key, options, multi, max){
  const wrap = document.createElement("div");
  wrap.className = "chips";

  const existing = getAnswer(key, multi ? [] : "");
  if(multi && !Array.isArray(existing)) setAnswer(key, []);
  if(!multi && Array.isArray(existing)) setAnswer(key, "");

  options.forEach(opt => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = opt;

    const selected = isChipSelected(key, opt, multi);
    if(selected) chip.classList.add("selected");

    chip.addEventListener("click", () => {
      if(multi){
        const arr = getAnswer(key, []);
        const already = arr.includes(opt);

        // Special case: "Ninguna"
        const isNone = (opt.toLowerCase() === "ninguna" || opt.toLowerCase() === "no especializado");
        if(isNone){
          setAnswer(key, [opt]);
        } else {
          // if "Ninguna" selected, remove it
          const cleaned = arr.filter(x => x.toLowerCase() !== "ninguna" && x.toLowerCase() !== "no especializado");
          if(already){
            setAnswer(key, cleaned.filter(x => x !== opt));
          } else {
            if(max && cleaned.length >= max) return; // soft cap
            setAnswer(key, [...cleaned, opt]);
          }
        }
      } else {
        const current = getAnswer(key, "");
        setAnswer(key, current === opt ? "" : opt);
      }
      // rerender chips selection
      render();
    });

    wrap.appendChild(chip);
  });

  return wrap;
}

function isChipSelected(key, opt, multi){
  const v = getAnswer(key, multi ? [] : "");
  return multi ? (Array.isArray(v) && v.includes(opt)) : (v === opt);
}

/* ----------------------------
   Tags
----------------------------- */
function addTag(key, value){
  const arr = getAnswer(key, []);
  const norm = value.trim();
  if(!norm) return;
  // prevent duplicates (case-insensitive)
  const exists = arr.some(x => x.toLowerCase() === norm.toLowerCase());
  if(exists) return;
  setAnswer(key, [...arr, norm]);
}

function removeTag(key, value){
  const arr = getAnswer(key, []);
  setAnswer(key, arr.filter(x => x !== value));
}

function renderTags(tagsWrap, key){
  tagsWrap.innerHTML = "";
  const arr = getAnswer(key, []);
  arr.forEach(tag => {
    const el = document.createElement("span");
    el.className = "tag";
    el.innerHTML = `${escapeHtml(tag)} <button type="button" aria-label="Quitar ${escapeHtml(tag)}">✕</button>`;
    $("button", el).addEventListener("click", () => {
      removeTag(key, tag);
      renderTags(tagsWrap, key);
    });
    tagsWrap.appendChild(el);
  });
}

/* ----------------------------
   Navigation + validation
----------------------------- */
function validateStep(){
  // Soft validation: only enforce that at least one key in this step is answered
  const step = currentForm().steps[state.stepIndex];

  // If step is chips root
  if(step.type === "chips"){
    const v = getAnswer(step.key, step.multi ? [] : "");
    return step.multi ? (Array.isArray(v) && v.length > 0) : !!v;
  }

  if(step.type === "group"){
    // consider it valid if at least one field has data
    return step.fields.some(f => {
      const v = getAnswer(f.key, null);
      if(Array.isArray(v)) return v.length > 0;
      if(typeof v === "number") return true; // range always has a number once touched/default
      return v !== null && v !== undefined && String(v).trim() !== "";
    });
  }

  return true;
}

function next(){
  const form = currentForm();
  if(!validateStep()){
    // tiny shake feedback using focus ring
    $(".card").style.boxShadow = "0 12px 28px rgba(216,116,0,.20)";
    setTimeout(() => $(".card").style.boxShadow = "", 140);
    return;
  }

  if(state.stepIndex < form.steps.length - 1){
    state.stepIndex++;
    render();
  }else{
    finish();
  }
}

function back(){
  if(state.stepIndex > 0){
    state.stepIndex--;
    render();
  }
}

function finish(){
  saveToStorage();

  const payload = {
    role: state.role,
    answers: currentAnswers(),
    meta: {
      createdAt: new Date().toISOString(),
      version: "v1"
    }
  };

  resultJson.textContent = JSON.stringify(payload, null, 2);
  resultPanel.classList.add("show");
  resultPanel.setAttribute("aria-hidden", "false");
}

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

/* ----------------------------
   Events
----------------------------- */
btnNext.addEventListener("click", next);
btnBack.addEventListener("click", back);

btnSave.addEventListener("click", () => {
  saveToStorage();
  btnSave.textContent = "Guardado ✓";
  setTimeout(() => btnSave.textContent = "Guardar", 900);
});

btnClose.addEventListener("click", () => {
  // In una app real cerrarías modal o volverías a home
  // Aquí solo guardamos.
  saveToStorage();
  alert("Guardado. Puedes cerrar esta pestaña.");
});

btnCloseResult.addEventListener("click", closeResult);
resultPanel.addEventListener("click", (e) => {
  if(e.target === resultPanel) closeResult();
});

btnCopy.addEventListener("click", async () => {
  try{
    await navigator.clipboard.writeText(resultJson.textContent);
    btnCopy.textContent = "Copiado ✓";
    setTimeout(() => btnCopy.textContent = "Copiar JSON", 900);
  }catch(e){
    alert("No se pudo copiar. Copia manualmente desde el recuadro.");
  }
});

btnRestart.addEventListener("click", () => {
  closeResult();
  render();
});

// Tabs
$$(".tab").forEach(t => {
  t.addEventListener("click", () => {
    $$(".tab").forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    $$(".tab").forEach(x => x.setAttribute("aria-selected", "false"));
    t.setAttribute("aria-selected", "true");
    setRole(t.dataset.role);
  });
});

/* ----------------------------
   Init
----------------------------- */
loadFromStorage();

// Mark active tab by storage role
$$(".tab").forEach(x => x.classList.toggle("active", x.dataset.role === state.role));
$$(".tab").forEach(x => x.setAttribute("aria-selected", x.dataset.role === state.role ? "true" : "false"));

render();

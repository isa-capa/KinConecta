(() => {
  const form = document.getElementById("createModelForm");
  if (!form) return;

  const roleInput = document.getElementById("roleInput");
  const nameInput = document.getElementById("nameInput");
  const imgInput = document.getElementById("imgInput");
  const descInput = document.getElementById("descInput");

  const roleError = document.getElementById("roleError");
  const nameError = document.getElementById("nameError");
  const imgError = document.getElementById("imgError");
  const descError = document.getElementById("descError");

  const isEmpty = (v) => v === null || v === undefined || String(v).trim() === "";

  const isValidUrl = (url) => {
    try { new URL(url); return true; } catch { return false; }
  };

  function showError(input, errorEl, message) {
    input.classList.add("error");
    errorEl.textContent = message;
    errorEl.classList.add("show");
  }

  function clearError(input, errorEl) {
    input.classList.remove("error");
    errorEl.textContent = "";
    errorEl.classList.remove("show");
  }

  function clearAllErrors() {
    clearError(roleInput, roleError);
    clearError(nameInput, nameError);
    clearError(imgInput, imgError);
    clearError(descInput, descError);
  }

  function validate() {
    clearAllErrors();
    let ok = true;

    const role = roleInput.value;
    const name = nameInput.value.trim();
    const img = imgInput.value.trim();
    const desc = descInput.value.trim();

    if (isEmpty(role)) {
      showError(roleInput, roleError, "Selecciona el tipo de perfil.");
      ok = false;
    }

    if (isEmpty(name) || name.length < 3) {
      showError(nameInput, nameError, "El nombre debe tener al menos 3 caracteres.");
      ok = false;
    }

    if (isEmpty(img)) {
      showError(imgInput, imgError, "La URL de imagen es obligatoria.");
      ok = false;
    } else if (!isValidUrl(img)) {
      showError(imgInput, imgError, "La URL no es válida. Ej: https://sitio.com/img.jpg");
      ok = false;
    }

    // Descripción NO obligatoria
    // Solo validamos si el usuario escribió algo muy corto
    if (!isEmpty(desc) && desc.length < 5) {
      showError(descInput, descError, "Si agregas descripción, usa al menos 5 caracteres.");
      ok = false;
    }

    return ok;
  }

  function buildJsonFromForm() {
    return {
      role: roleInput.value,
      model: {
        name: nameInput.value.trim(),
        img: imgInput.value.trim(),
        description: descInput.value.trim(), // puede ir vacío
        createdAt: new Date().toISOString()
      }
    };
  }

  // Limpia el error al escribir/cambiar
  [roleInput, nameInput, imgInput, descInput].forEach((el) => {
    el.addEventListener("input", () => {
      // borra solo el error del campo editado
      if (el === roleInput) clearError(roleInput, roleError);
      if (el === nameInput) clearError(nameInput, nameError);
      if (el === imgInput) clearError(imgInput, imgError);
      if (el === descInput) clearError(descInput, descError);
    });
    el.addEventListener("change", () => el.dispatchEvent(new Event("input")));
  });

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validate()) return;

  const { role, model } = buildJsonFromForm();

  // 1) crear perfil base
  const created = profilesController.createProfile(role, model);

  state.currentProfileId = created.id;
saveToStorage();

console.log("✅ Perfil base creado:", created);
console.log("🆔 currentProfileId:", state.currentProfileId);
console.log("🧠 state:", state);
console.table(profilesController.items);

  // 3) cambiar al wizard de ese rol
  if (typeof setRole === "function") {
    document.querySelectorAll(".tab").forEach(t => {
      const isActive = t.dataset.role === role;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    setRole(role);
  } else {
    state.role = role;
    state.stepIndex = 0;
    render();
  }

  saveToStorage();
  form.reset();
  clearAllErrors();
});

  // Guardar en controller
  const created = profilesController.createProfile(role, model);
  state.currentProfileId = created.id;   //  guardamos el perfil que estamos armando
  saveToStorage(); //ID

  console.log("✅ JSON creado:", model);
  console.log("✅ Guardado:", saved);
  console.table(profilesController.items);

  // Cambiar al formulario correcto (tabs + render)
  // role: "traveler" o "guide"
  if (typeof setRole === "function") {
    // activar tab visualmente
    document.querySelectorAll(".tab").forEach(t => {
      const isActive = t.dataset.role === role;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    setRole(role); // esto hace render del wizard en ese rol
  } else {
    // fallback por si setRole no está globa
    state.role = role;
    state.stepIndex = 0;
    render();
  }

  form.reset();
  clearAllErrors();
});




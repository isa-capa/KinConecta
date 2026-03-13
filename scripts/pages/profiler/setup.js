/* ==========================================================
   setup.js - Pantalla 1 (Crear perfil base)
   Requiere:
   - ProfilesController.js  -> window.profilesController
   - storage.js            -> loadAppState(state, profilesController)
                           -> saveAppState(state, profilesController)
   ========================================================== */

// Estado mínimo compartido (mismo shape que wizard)
const state = {
  role: "traveler",
  stepIndex: 0,
  answers: { traveler: {}, guide: {} },
  currentProfileId: null
};

// Carga estado previo si existe
if (typeof loadAppState === "function") {
  loadAppState(state, profilesController);
} else {
  console.warn("⚠️ Falta storage.js (loadAppState/saveAppState).");
}

(() => {
  const form = document.getElementById("createModelForm");
  if (!form) return;

  function requestParentResize() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "kc-onboarding-resize" }, window.location.origin);
    }
  }

  // Inputs base
  const roleInput = document.getElementById("roleInput");
  const nameInput = document.getElementById("nameInput");
  const imgInput = document.getElementById("imgInput");
  const descInput = document.getElementById("descInput");

  // Nuevos inputs
  const emailInput = document.getElementById("emailInput");
  const dobInput = document.getElementById("dobInput");

  const countryCodeInput = document.getElementById("countryCodeInput");
  const phoneInput = document.getElementById("phoneInput");

  const passwordInput = document.getElementById("passwordInput");
  const confirmPasswordInput = document.getElementById("confirmPasswordInput");

  function normalizeIncomingRole(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === "guide") return "guide";
    if (raw === "traveler" || raw === "tourist") return "traveler";
    return "";
  }

  function getInitialRolePreference() {
    const urlParams = new URLSearchParams(window.location.search);
    const fromQuery = normalizeIncomingRole(urlParams.get("role"));
    if (fromQuery) return fromQuery;

    const fromStorage = normalizeIncomingRole(localStorage.getItem("kcOnboardingRole"));
    if (fromStorage) {
      localStorage.removeItem("kcOnboardingRole");
      return fromStorage;
    }

    return "";
  }

  const initialRole = getInitialRolePreference();
  if (initialRole && roleInput) {
    roleInput.value = initialRole;
    state.role = initialRole;
  }

  const queryParams = new URLSearchParams(window.location.search);
  const isEmbeddedFlow = queryParams.get("embed") === "1";

  function buildWizardUrl(roleValue) {
    const params = new URLSearchParams();
    if (isEmbeddedFlow) params.set("embed", "1");
    const normalized = normalizeIncomingRole(roleValue);
    if (normalized) params.set("role", normalized);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return `./profiles-wizard.html${suffix}`;
  }

  // Errores
  const roleError = document.getElementById("roleError");
  const nameError = document.getElementById("nameError");
  const imgError = document.getElementById("imgError");
  const descError = document.getElementById("descError");

  const emailError = document.getElementById("emailError");
  const dobError = document.getElementById("dobError");

  const countryCodeError = document.getElementById("countryCodeError");
  const phoneError = document.getElementById("phoneError");

  const passwordError = document.getElementById("passwordError");
  const confirmPasswordError = document.getElementById("confirmPasswordError");

  // UI password (ojito + fuerza)
  const togglePassword = document.getElementById("togglePassword");
  const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
  const pwBar = document.getElementById("pwBar");
  const pwStrengthText = document.getElementById("pwStrengthText");

  // Helpers
  const isEmpty = (v) => v === null || v === undefined || String(v).trim() === "";

  const isValidUrl = (url) => {
    try { new URL(url); return true; } catch { return false; }
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const normalizeDigits = (s) => String(s || "").replace(/\D/g, "");
  const isValidPhoneDigits = (digits) => digits.length >= 7 && digits.length <= 15;

  const isAdult = (isoDate) => {
    if (!isoDate) return false;
    const dob = new Date(isoDate);
    if (Number.isNaN(dob.getTime())) return false;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 18; // ajusta si necesitas 16/13
  };

  function showError(input, errorEl, message) {
    if (input) input.classList.add("error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("show");
    }
  }

  function clearError(input, errorEl) {
    if (input) input.classList.remove("error");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("show");
    }
  }

  function clearAllErrors() {
    clearError(roleInput, roleError);
    clearError(nameInput, nameError);
    clearError(imgInput, imgError);
    clearError(descInput, descError);

    clearError(emailInput, emailError);
    clearError(dobInput, dobError);

    clearError(countryCodeInput, countryCodeError);
    clearError(phoneInput, phoneError);

    clearError(passwordInput, passwordError);
    clearError(confirmPasswordInput, confirmPasswordError);
  }

  /* ---------------- Password strength ---------------- */
  function scorePassword(pw) {
    const s = String(pw || "");
    let score = 0;

    if (s.length >= 8) score++;
    if (s.length >= 12) score++;
    if (/[a-z]/.test(s) && /[A-Z]/.test(s)) score++;
    if (/\d/.test(s)) score++;
    if (/[^A-Za-z0-9]/.test(s)) score++;

    return score; // 0..5
  }

  function passwordStrength(score) {
    // devuelve { label, width, color }
    if (score <= 1) return { label: "Débil", width: 20, color: "#b91c1c" };
    if (score === 2) return { label: "Media", width: 45, color: "#b45309" };
    if (score === 3) return { label: "Buena", width: 70, color: "#0f766e" };
    return { label: "Fuerte", width: 100, color: "#166534" };
  }

  function updatePasswordUI() {
    if (!pwBar || !pwStrengthText) return;

    const pw = passwordInput?.value || "";
    const score = scorePassword(pw);
    const { label, width, color } = passwordStrength(score);

    pwBar.style.width = pw ? `${width}%` : "0%";
    pwBar.style.background = pw ? color : "transparent";
    pwStrengthText.textContent = `Fuerza: ${pw ? label : "—"}`;
  }

  function updatePasswordMatchUI() {
    const pw = passwordInput?.value || "";
    const cpw = confirmPasswordInput?.value || "";

    if (!cpw) {
      clearError(confirmPasswordInput, confirmPasswordError);
      return;
    }

    if (pw === cpw) {
      clearError(confirmPasswordInput, confirmPasswordError);
    } else {
      showError(confirmPasswordInput, confirmPasswordError, "Las contraseñas no coinciden.");
    }
  }

  function toggleVisibility(input, btn) {
    if (!input || !btn) return;
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    btn.textContent = isHidden ? "🙈" : "👁";
  }

  /* ---------------- Validation ---------------- */
  function validate() {
    clearAllErrors();
    let ok = true;

    const role = roleInput?.value;
    const name = nameInput?.value.trim();
    const img = imgInput?.value.trim();
    const desc = descInput?.value.trim();

    const email = emailInput?.value.trim();
    const dob = dobInput?.value;

    const lada = countryCodeInput?.value;
    const phoneDigits = normalizeDigits(phoneInput?.value);

    const password = passwordInput?.value || "";
    const confirmPassword = confirmPasswordInput?.value || "";

    // Rol
    if (isEmpty(role)) {
      showError(roleInput, roleError, "Selecciona el tipo de perfil.");
      ok = false;
    }

    // Nombre
    if (isEmpty(name) || name.length < 3) {
      showError(nameInput, nameError, "El nombre debe tener al menos 3 caracteres.");
      ok = false;
    }

    // Imagen URL
    if (isEmpty(img)) {
      showError(imgInput, imgError, "La URL de imagen es obligatoria.");
      ok = false;
    } else if (!isValidUrl(img)) {
      showError(imgInput, imgError, "La URL no es válida. Ej: https://sitio.com/img.jpg");
      ok = false;
    }

    // Descripción opcional
    if (!isEmpty(desc) && desc.length < 5) {
      showError(descInput, descError, "Si agregas descripción, usa al menos 5 caracteres.");
      ok = false;
    }

    // Email
    if (isEmpty(email) || !isValidEmail(email)) {
      showError(emailInput, emailError, "Ingresa un correo válido.");
      ok = false;
    }

    // Fecha nacimiento
    if (isEmpty(dob)) {
      showError(dobInput, dobError, "Selecciona tu fecha de nacimiento.");
      ok = false;
    } else if (!isAdult(dob)) {
      showError(dobInput, dobError, "Debes ser mayor de edad.");
      ok = false;
    }

    // Teléfono
    if (isEmpty(lada)) {
      showError(countryCodeInput, countryCodeError, "Selecciona la clave LADA.");
      ok = false;
    }

    if (isEmpty(phoneDigits)) {
      showError(phoneInput, phoneError, "Ingresa tu número de teléfono.");
      ok = false;
    } else if (!isValidPhoneDigits(phoneDigits)) {
      showError(phoneInput, phoneError, "Teléfono inválido. Usa entre 7 y 15 dígitos.");
      ok = false;
    }

    // Password
    if (isEmpty(password) || password.length < 8) {
      showError(passwordInput, passwordError, "La contraseña debe tener al menos 8 caracteres.");
      ok = false;
    }

    // Confirmación
    if (isEmpty(confirmPassword)) {
      showError(confirmPasswordInput, confirmPasswordError, "Confirma tu contraseña.");
      ok = false;
    }

    // Igualdad
    if (!isEmpty(password) && !isEmpty(confirmPassword) && password !== confirmPassword) {
      showError(confirmPasswordInput, confirmPasswordError, "Las contraseñas no coinciden.");
      ok = false;
    }

    return ok;
  }

  /* ---------------- Build meta ---------------- */
  function buildMeta() {
    const lada = countryCodeInput.value;
    const phoneDigits = normalizeDigits(phoneInput.value);

    return {
      name: nameInput.value.trim(),
      img: imgInput.value.trim(),
      description: descInput.value.trim(),

      email: emailInput.value.trim().toLowerCase(),
      dateOfBirth: dobInput.value,

      phone: {
        countryCode: lada,
        number: phoneDigits,
        e164: `${lada}${phoneDigits}`
      }

      // ⚠️ Importante: NO guardamos password en localStorage.
      // En producción esto se manda al backend para hash.
      // password: passwordInput.value
    };
  }

  /* ---------------- Live UX ---------------- */

  // Solo dígitos en teléfono
  phoneInput?.addEventListener("input", () => {
    phoneInput.value = normalizeDigits(phoneInput.value);
    clearError(phoneInput, phoneError);
  });

  // Limpieza de errores al escribir
  const inputPairs = [
    [roleInput, roleError],
    [nameInput, nameError],
    [imgInput, imgError],
    [descInput, descError],
    [emailInput, emailError],
    [dobInput, dobError],
    [countryCodeInput, countryCodeError],
    [passwordInput, passwordError],
    [confirmPasswordInput, confirmPasswordError]
  ];

  inputPairs.forEach(([el, err]) => {
    el?.addEventListener("input", () => clearError(el, err));
    el?.addEventListener("change", () => clearError(el, err));
  });

  // Ojitos
  togglePassword?.addEventListener("click", () => toggleVisibility(passwordInput, togglePassword));
  toggleConfirmPassword?.addEventListener("click", () => toggleVisibility(confirmPasswordInput, toggleConfirmPassword));

  // Fuerza + match en vivo
  passwordInput?.addEventListener("input", () => {
    updatePasswordUI();
    updatePasswordMatchUI();
  });

  confirmPasswordInput?.addEventListener("input", updatePasswordMatchUI);

  updatePasswordUI();

  /* ---------------- Submit ---------------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validate()) {
      updatePasswordUI();
      updatePasswordMatchUI();
      requestParentResize();
      return;
    }

    const role = roleInput.value;
    const meta = buildMeta();

    // Crear perfil base
    const created = profilesController.createProfile(role, meta);

    // Marcar como perfil actual
    state.role = role;
    state.currentProfileId = created.id;

    // Guardar a storage (state + controller)
    saveAppState(state, profilesController);

    console.log("✅ Perfil base creado:", created);

    // Ir al wizard (si viene embebido desde modal, conserva embed=1)
    window.location.href = buildWizardUrl(role);
  });

  window.setTimeout(requestParentResize, 40);
})();


(function () {
  const ONBOARDING_STORAGE_KEY = "match_profile_v2";

  // TODO(BACKEND): poner en false cuando /auth/register este disponible y estable.
  const ALLOW_REGISTER_FLOW_WITHOUT_BACKEND = true;
  // TEMPORAL: sesión local para acceso con usuarios de prueba.
  const TEMP_AUTH_SESSION_STORAGE_KEY = "kc_temp_auth_session_v1";
  // TEMPORAL: credenciales de acceso local para pruebas de flujo de login.
  const TEMP_LOGIN_USERS = [
    {
      id: "tourist_temp_001",
      role: "tourist",
      fullName: "Turista Temporal",
      email: "turista@prueba.com",
      password: "contrase\u00f1a123",
      passwordAscii: "contrasena123",
    },
    {
      id: "guide_temp_001",
      role: "guide",
      fullName: "Guía Temporal",
      email: "guia@prueba.com",
      password: "contrase\u00f1a123",
      passwordAscii: "contrasena123",
    },
  ];
  const VALIDATION_RULES = {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    fullNameRegex: /^[A-Za-z\u00C0-\u017F' -]+$/u,
    phoneDigits: 10,
    minPasswordLength: 8,
    minimumAge: 18,
  };

  const dom = {
    modal: null,
    title: null,
    tabs: [],
    views: new Map(),
    closeTriggers: [],
  };

  let previousBodyOverflow = "";
  let activeType = "login";
  let registerFormRef = null;

  async function fetchMarkup(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error("No se pudo cargar el formulario: " + path);
    }
    return response.text();
  }

  function extractFragment(markup) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(markup, "text/html");
    const fragment = doc.querySelector("[data-auth-fragment]");
    return fragment ? fragment.outerHTML : markup;
  }

  function buildModal() {
    const wrapper = document.createElement("div");
    wrapper.className = "auth-modal";
    wrapper.setAttribute("data-auth-modal", "");
    wrapper.setAttribute("aria-hidden", "true");
    wrapper.innerHTML = `
      <div class="auth-modal__backdrop" data-auth-close></div>
      <section class="auth-modal__panel" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <header class="auth-modal__header">
          <h2 class="auth-modal__title" id="auth-modal-title">Accede a Kin Conecta</h2>
          <button class="auth-modal__close" type="button" aria-label="Cerrar" data-auth-close>
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <nav class="auth-modal__tabs" aria-label="Tipo de acceso">
          <button class="auth-modal__tab is-active" type="button" data-auth-tab="login">Iniciar sesi&oacute;n</button>
          <button class="auth-modal__tab" type="button" data-auth-tab="register">Registrarse</button>
        </nav>

        <div class="auth-modal__body">
          <div class="auth-modal__view" data-auth-view="login"></div>
          <div class="auth-modal__view" data-auth-view="register" hidden></div>
        </div>
      </section>
    `;

    document.body.appendChild(wrapper);
    dom.modal = wrapper;
    dom.title = wrapper.querySelector("#auth-modal-title");
    dom.tabs = [...wrapper.querySelectorAll("[data-auth-tab]")];
    dom.closeTriggers = [...wrapper.querySelectorAll("[data-auth-close]")];
    dom.views.set("login", wrapper.querySelector('[data-auth-view="login"]'));
    dom.views.set("register", wrapper.querySelector('[data-auth-view="register"]'));
  }

  function showFeedback(form, message, isSuccess) {
    const feedback = form.querySelector("[data-auth-feedback]");
    if (!feedback) return;
    feedback.textContent = message || "";
    feedback.classList.toggle("is-success", Boolean(isSuccess));
  }

  function getFieldErrorElement(form, fieldName) {
    return form?.querySelector(`[data-auth-error-for="${fieldName}"]`) || null;
  }

  function setFieldError(form, fieldName, message) {
    const errorText = String(message || "");
    const errorElement = getFieldErrorElement(form, fieldName);
    if (errorElement) errorElement.textContent = errorText;

    if (fieldName === "accountRole") {
      const roleStep = form?.querySelector(".auth-role-step");
      if (roleStep) roleStep.classList.toggle("is-invalid", Boolean(errorText));
      return;
    }

    const input = form?.querySelector(`[name="${fieldName}"]`);
    const wrapper = input?.closest(".auth-form__field");
    if (wrapper) wrapper.classList.toggle("auth-form__field--invalid", Boolean(errorText));
    if (input) input.setAttribute("aria-invalid", errorText ? "true" : "false");
  }

  function clearFieldError(form, fieldName) {
    setFieldError(form, fieldName, "");
  }

  function clearAllFieldErrors(form) {
    if (!form) return;
    const errorElements = [...form.querySelectorAll("[data-auth-error-for]")];
    errorElements.forEach((element) => {
      const fieldName = element.getAttribute("data-auth-error-for");
      if (!fieldName) return;
      setFieldError(form, fieldName, "");
    });
  }

  function sanitizeFullNameInput(value) {
    return String(value || "")
      .replace(/[^A-Za-z\u00C0-\u017F' -]/gu, "")
      .replace(/\s{2,}/g, " ")
      .replace(/^\s+/, "");
  }

  function sanitizePhoneInput(value) {
    return normalizePhone(value).slice(0, VALIDATION_RULES.phoneDigits);
  }

  function formatDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseDateOnly(value) {
    const raw = String(value || "").trim();
    if (!raw) return null;
    const parsed = new Date(`${raw}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function calculateAgeFromDate(date) {
    if (!(date instanceof Date)) return NaN;
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age -= 1;
    }
    return age;
  }

  function validateDateOfBirthField(dateOfBirth) {
    const parsedDate = parseDateOnly(dateOfBirth);
    if (!parsedDate) return "Ingresa una fecha de nacimiento válida.";

    const today = new Date();
    const todayAtMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0,
    );

    if (parsedDate > todayAtMidnight) {
      return "La fecha de nacimiento no puede estar en el futuro.";
    }

    const age = calculateAgeFromDate(parsedDate);
    if (!Number.isFinite(age) || age < VALIDATION_RULES.minimumAge) {
      return `Debes ser mayor de edad (${VALIDATION_RULES.minimumAge}+).`;
    }

    return "";
  }

  function validateEmailField(email) {
    const normalized = String(email || "").trim();
    if (!normalized) return "El correo es obligatorio.";
    if (!VALIDATION_RULES.emailRegex.test(normalized)) {
      return "Ingresa un correo valido (ejemplo@dominio.com).";
    }
    return "";
  }

  function validatePasswordField(password) {
    const normalized = String(password || "");
    if (!normalized) return "La contrase\u00f1a es obligatoria.";
    if (normalized.length < VALIDATION_RULES.minPasswordLength) {
      return `La contrase\u00f1a debe tener al menos ${VALIDATION_RULES.minPasswordLength} caracteres.`;
    }
    return "";
  }

  function validateLoginPayload(form, payload) {
    let isValid = true;

    const emailError = validateEmailField(payload.email);
    if (emailError) {
      setFieldError(form, "email", emailError);
      isValid = false;
    }

    const passwordError = validatePasswordField(payload.password);
    if (passwordError) {
      setFieldError(form, "password", passwordError);
      isValid = false;
    }

    return isValid;
  }

  function validateRegisterPayload(form, payload) {
    let isValid = true;

    if (!payload.accountRole) {
      setFieldError(form, "accountRole", "Selecciona si te registras como turista o guía.");
      isValid = false;
    }

    if (!payload.fullName) {
      setFieldError(form, "fullName", "El nombre completo es obligatorio.");
      isValid = false;
    } else if (payload.fullName.length < 3) {
      setFieldError(form, "fullName", "El nombre debe tener al menos 3 caracteres.");
      isValid = false;
    } else if (!VALIDATION_RULES.fullNameRegex.test(payload.fullName)) {
      setFieldError(form, "fullName", "Solo se permiten letras, espacios, apostrofe y guion.");
      isValid = false;
    }

    if (!payload.dateOfBirth) {
      setFieldError(form, "dateOfBirth", "La fecha de nacimiento es obligatoria.");
      isValid = false;
    } else {
      const dateOfBirthError = validateDateOfBirthField(payload.dateOfBirth);
      if (dateOfBirthError) {
        setFieldError(form, "dateOfBirth", dateOfBirthError);
        isValid = false;
      }
    }

    if (!payload.countryCode) {
      setFieldError(form, "countryCode", "Selecciona tu clave LADA.");
      isValid = false;
    }

    if (!payload.phoneNumber) {
      setFieldError(form, "phoneNumber", "El teléfono es obligatorio.");
      isValid = false;
    } else if (!/^\d{10}$/.test(payload.phoneNumber)) {
      setFieldError(form, "phoneNumber", "Ingresa exactamente 10 digitos numericos.");
      isValid = false;
    }

    const emailError = validateEmailField(payload.email);
    if (emailError) {
      setFieldError(form, "email", emailError);
      isValid = false;
    }

    const passwordError = validatePasswordField(payload.password);
    if (passwordError) {
      setFieldError(form, "password", passwordError);
      isValid = false;
    }

    if (!payload.confirmPassword) {
      setFieldError(form, "confirmPassword", "Confirma tu contrase\u00f1a.");
      isValid = false;
    } else if (payload.password !== payload.confirmPassword) {
      setFieldError(form, "confirmPassword", "Las contrase\u00f1as no coinciden.");
      isValid = false;
    }

    return isValid;
  }

  function applyFieldInputRestrictions(form) {
    if (!form) return;

    const fullNameInput = form.querySelector('input[name="fullName"]');
    const dateOfBirthInput = form.querySelector('input[name="dateOfBirth"]');
    const phoneInput = form.querySelector('input[name="phoneNumber"]');
    const emailInput = form.querySelector('input[name="email"]');
    const passwordInput = form.querySelector('input[name="password"]');

    if (fullNameInput) {
      fullNameInput.addEventListener("input", () => {
        const sanitized = sanitizeFullNameInput(fullNameInput.value);
        if (fullNameInput.value !== sanitized) fullNameInput.value = sanitized;
        clearFieldError(form, "fullName");
        showFeedback(form, "");
      });
    }

    if (phoneInput) {
      phoneInput.addEventListener("input", () => {
        const sanitized = sanitizePhoneInput(phoneInput.value);
        if (phoneInput.value !== sanitized) phoneInput.value = sanitized;
        clearFieldError(form, "phoneNumber");
        showFeedback(form, "");
      });
    }

    if (dateOfBirthInput) {
      const legalBirthDateLimit = new Date();
      legalBirthDateLimit.setFullYear(
        legalBirthDateLimit.getFullYear() - VALIDATION_RULES.minimumAge,
      );
      dateOfBirthInput.max = formatDateInputValue(legalBirthDateLimit);

      const clearDobError = () => {
        clearFieldError(form, "dateOfBirth");
        showFeedback(form, "");
      };

      const validateDobOnField = () => {
        const value = String(dateOfBirthInput.value || "").trim();
        if (!value) {
          clearDobError();
          return;
        }
        const error = validateDateOfBirthField(value);
        if (error) {
          setFieldError(form, "dateOfBirth", error);
        } else {
          clearFieldError(form, "dateOfBirth");
        }
        showFeedback(form, "");
      };

      dateOfBirthInput.addEventListener("input", clearDobError);
      dateOfBirthInput.addEventListener("change", validateDobOnField);
      dateOfBirthInput.addEventListener("blur", validateDobOnField);
    }

    if (emailInput) {
      emailInput.addEventListener("input", () => {
        clearFieldError(form, "email");
        showFeedback(form, "");
      });

      emailInput.addEventListener("blur", () => {
        emailInput.value = normalizeLoginEmail(emailInput.value);
      });
    }

    if (passwordInput) {
      passwordInput.addEventListener("input", () => {
        clearFieldError(form, "password");
        if (form.querySelector('input[name="confirmPassword"]')) {
          clearFieldError(form, "confirmPassword");
        }
        showFeedback(form, "");
      });
    }

    const confirmPasswordInput = form.querySelector('input[name="confirmPassword"]');
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener("input", () => {
        clearFieldError(form, "confirmPassword");
        showFeedback(form, "");
      });
    }

    const countryCodeInput = form.querySelector('select[name="countryCode"]');
    if (countryCodeInput) {
      countryCodeInput.addEventListener("change", () => {
        clearFieldError(form, "countryCode");
        showFeedback(form, "");
      });
    }
  }

  function clearRegisterRoleSelection(form) {
    if (!form) return;
    const roleButtons = [...form.querySelectorAll("[data-register-role]")];
    const hiddenRoleInput = form.querySelector('input[name="accountRole"]');
    if (hiddenRoleInput) hiddenRoleInput.value = "";
    roleButtons.forEach((button) => button.classList.remove("is-selected"));
  }

  function resetRegisterForm(form) {
    if (!form) return;
    form.reset();
    clearRegisterRoleSelection(form);
    clearAllFieldErrors(form);
    showFeedback(form, "");
  }

  function setView(type, options) {
    const config = options || {};
    activeType = type === "register" ? "register" : "login";

    dom.tabs.forEach((tab) => {
      const selected = tab.getAttribute("data-auth-tab") === activeType;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
    });

    dom.views.forEach((view, key) => {
      view.hidden = key !== activeType;
    });

    if (dom.title) {
      dom.title.textContent =
        activeType === "register" ? "Crear cuenta en Kin Conecta" : "Accede a Kin Conecta";
    }

    if (activeType === "register" && config.resetRegisterForm) {
      resetRegisterForm(registerFormRef);
    }
  }

  function openModal(type, options) {
    const config = options || {};
    const shouldResetRegisterForm =
      typeof config.resetRegisterForm === "boolean"
        ? config.resetRegisterForm
        : type === "register";

    setView(type, { resetRegisterForm: shouldResetRegisterForm });
    previousBodyOverflow = document.body.style.overflow;
    dom.modal.classList.add("auth-modal--open");
    dom.modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!dom.modal) return;
    dom.modal.classList.remove("auth-modal--open");
    dom.modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousBodyOverflow;
  }

  function getAuthService() {
    return window.KCAuthApi?.auth || null;
  }

  function getTempAuthService() {
    return window.KCTempAuth || null;
  }

  function normalizeLoginEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function normalizeLoginPassword(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      return raw.normalize("NFC");
    } catch (_error) {
      return raw;
    }
  }

  function stripDiacritics(value) {
    try {
      return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    } catch (_error) {
      return String(value || "");
    }
  }

  function resolveTemporaryLoginUser(email, password) {
    const normalizedEmail = normalizeLoginEmail(email);
    const normalizedPassword = normalizeLoginPassword(password);
    const asciiPassword = stripDiacritics(normalizedPassword).toLowerCase();

    return (
      TEMP_LOGIN_USERS.find(
        (user) =>
          user.email === normalizedEmail &&
          (user.password === normalizedPassword || user.passwordAscii === asciiPassword),
      ) || null
    );
  }

  function normalizeAccountRole(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === "guide") return "guide";
    if (raw === "tourist" || raw === "traveler") return "tourist";
    return "";
  }

  function mapAccountRoleToProfilerRole(role) {
    return role === "guide" ? "guide" : "traveler";
  }

  function normalizePhone(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function resolveProfilerWizardPath() {
    const path = String(window.location.pathname || "").replace(/\\/g, "/").toLowerCase();
    if (path.includes("/frontend/src/pages/")) {
      return "./profiler/profiles-wizard.html";
    }
    return "./frontend/src/pages/profiler/profiles-wizard.html";
  }

  function seedProfilerState(payload) {
    const role = mapAccountRoleToProfilerRole(payload.accountRole);
    const phoneNumber = normalizePhone(payload.phoneNumber);

    let parsed = null;
    try {
      parsed = JSON.parse(localStorage.getItem(ONBOARDING_STORAGE_KEY) || "null");
    } catch (_error) {
      parsed = null;
    }

    const currentId = Number(parsed?.controller?.currentId || 0);
    const items = Array.isArray(parsed?.controller?.items) ? parsed.controller.items : [];
    const answers =
      parsed?.answers && typeof parsed.answers === "object"
        ? {
            traveler:
              parsed.answers.traveler && typeof parsed.answers.traveler === "object"
                ? parsed.answers.traveler
                : {},
            guide:
              parsed.answers.guide && typeof parsed.answers.guide === "object"
                ? parsed.answers.guide
                : {},
          }
        : { traveler: {}, guide: {} };

    answers[role] = {};

    const nextId = currentId + 1;
    const now = new Date().toISOString();
    const profile = {
      id: nextId,
      role,
      meta: {
        name: payload.fullName,
        img: "",
        description: "",
        email: payload.email,
        dateOfBirth: payload.dateOfBirth,
        phoneCountryCode: payload.countryCode,
        phoneNumber,
        phoneE164: `${payload.countryCode}${phoneNumber}`,
      },
      answers: {},
      createdAt: now,
      updatedAt: now,
    };

    localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({
        role,
        stepIndex: 0,
        answers,
        currentProfileId: nextId,
        controller: {
          currentId: nextId,
          items: [...items, profile],
        },
      }),
    );
  }

  function openOnboardingFlow(payload) {
    const profilerRole = mapAccountRoleToProfilerRole(payload.accountRole);
    localStorage.setItem("kcOnboardingRole", profilerRole);
    seedProfilerState(payload);
    closeModal();

    if (window.KCOnboardingModal?.open) {
      window.KCOnboardingModal.open(profilerRole);
      return;
    }

    const wizardPath = resolveProfilerWizardPath();
    window.location.href = `${wizardPath}?embed=1&role=${encodeURIComponent(profilerRole)}`;
  }

  function resolveDashboardPath(accountRole) {
    const role = normalizeAccountRole(accountRole);
    const dashboardPath =
      role === "guide" ? "Dashboard/guia/mainUserGuide.html" : "Dashboard/turista/mainUserTourist.html";

    const currentPath = String(window.location.pathname || "").replace(/\\/g, "/").toLowerCase();
    const pagesPrefix = currentPath.includes("/frontend/src/pages/") ? "./" : "./frontend/src/pages/";
    return `${pagesPrefix}${dashboardPath}`;
  }

  function persistTemporarySession(user) {
    const role = normalizeAccountRole(user?.role);
    if (!role) return;

    const session = {
      mode: "temporary",
      role,
      userId: String(user?.id || ""),
      fullName: String(user?.fullName || ""),
      email: String(user?.email || ""),
      loginAt: new Date().toISOString(),
    };

    // TEMPORAL: datos locales de sesión para navegación sin backend.
    localStorage.setItem(TEMP_AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem("kcAuthMode", "temporary");
    localStorage.setItem("kcAuthToken", `temp-token-${role}-${Date.now()}`);
    localStorage.setItem("kcUserRole", role);

    if (role === "guide") {
      localStorage.setItem("kc_guide_id", session.userId || "guide_temp_001");
    } else if (role === "tourist") {
      localStorage.setItem("kc_tourist_id", session.userId || "tourist_temp_001");
    }
  }

  function setupRegisterRoleSelection(form) {
    if (!form) return;
    const roleButtons = [...form.querySelectorAll("[data-register-role]")];
    const hiddenRoleInput = form.querySelector('input[name="accountRole"]');
    if (!hiddenRoleInput || !roleButtons.length) return;

    roleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const selectedRole = normalizeAccountRole(button.getAttribute("data-register-role"));
        hiddenRoleInput.value = selectedRole;
        roleButtons.forEach((item) => {
          item.classList.toggle("is-selected", item === button);
        });
        clearFieldError(form, "accountRole");
        showFeedback(form, "");
      });
    });
  }

  async function handleLogin(form) {
    const data = new FormData(form);
    const payload = {
      email: normalizeLoginEmail(data.get("email")),
      password: normalizeLoginPassword(data.get("password")),
    };

    clearAllFieldErrors(form);
    showFeedback(form, "");

    if (!validateLoginPayload(form, payload)) {
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      // TEMPORAL: valida credenciales locales para acceso de prueba sin backend.
      const tempAuth = getTempAuthService();
      const tempUser =
        resolveTemporaryLoginUser(payload.email, payload.password) ||
        tempAuth?.validateLogin?.(payload.email, payload.password);
      if (tempUser) {
        persistTemporarySession(tempUser);
        showFeedback(form, "Acceso temporal concedido. Redirigiendo...", true);
        window.setTimeout(() => {
          closeModal();
          window.location.href = resolveDashboardPath(tempUser.role);
        }, 240);
        return;
      }

      const service = getAuthService();
      if (!service?.login) {
        throw new Error("login-api-unavailable");
      }

      const result = await service.login(payload);
      const token = result?.data?.token;
      if (token) localStorage.setItem("kcAuthToken", token);

      showFeedback(form, "Sesión iniciada correctamente.", true);
      window.setTimeout(closeModal, 420);
    } catch (error) {
      if (error?.message === "login-api-unavailable") {
        console.warn("KCAuthApi.auth.login no esta disponible.");
      } else {
        console.error(error);
      }
      showFeedback(form, "No fue posible iniciar sesi\u00f3n. Verifica tus datos.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  async function handleRegister(form) {
    const data = new FormData(form);
    const payload = {
      accountRole: normalizeAccountRole(data.get("accountRole")),
      fullName: sanitizeFullNameInput(data.get("fullName")).trim(),
      dateOfBirth: String(data.get("dateOfBirth") || "").trim(),
      countryCode: String(data.get("countryCode") || "").trim(),
      phoneNumber: sanitizePhoneInput(data.get("phoneNumber")),
      email: normalizeLoginEmail(data.get("email")),
      password: String(data.get("password") || ""),
      confirmPassword: String(data.get("confirmPassword") || ""),
    };

    clearAllFieldErrors(form);
    showFeedback(form, "");

    if (!validateRegisterPayload(form, payload)) {
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      // TODO(BACKEND): este bloque debe registrar al usuario en la API real.
      const service = getAuthService();
      if (!service?.register) {
        throw new Error("register-api-unavailable");
      }

      await service.register({
        role: payload.accountRole,
        fullName: payload.fullName,
        dateOfBirth: payload.dateOfBirth,
        countryCode: payload.countryCode,
        phoneNumber: payload.phoneNumber,
        email: payload.email,
        password: payload.password,
      });

      showFeedback(form, "Cuenta creada correctamente.", true);
      window.setTimeout(() => openOnboardingFlow(payload), 280);
    } catch (error) {
      if (!ALLOW_REGISTER_FLOW_WITHOUT_BACKEND) {
        if (error?.message === "register-api-unavailable") {
          console.warn("KCAuthApi.auth.register no esta disponible.");
        } else {
          console.error(error);
        }
        showFeedback(form, "No fue posible completar el registro.");
      } else {
        // TODO(BACKEND): eliminar este fallback cuando el endpoint real de registro este activo.
        console.warn("Registro en modo prueba (sin backend).", error);
        showFeedback(form, "Modo prueba: continuando sin registro real.", true);
        window.setTimeout(() => openOnboardingFlow(payload), 280);
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function setupFormHandlers() {
    const loginForm = dom.views.get("login")?.querySelector('[data-auth-form="login"]');
    const registerForm = dom.views.get("register")?.querySelector('[data-auth-form="register"]');

    registerFormRef = registerForm || null;
    setupRegisterRoleSelection(registerFormRef);
    applyFieldInputRestrictions(loginForm);
    applyFieldInputRestrictions(registerFormRef);

    loginForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      handleLogin(loginForm);
    });

    registerForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      handleRegister(registerForm);
    });
  }

  function bindModalEvents() {
    dom.tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const type = tab.getAttribute("data-auth-tab");
        setView(type, { resetRegisterForm: type === "register" });
      });
    });

    dom.closeTriggers.forEach((trigger) => {
      trigger.addEventListener("click", closeModal);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });

    const openTriggers = [...document.querySelectorAll("[data-auth-open]")];
    openTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        const type = trigger.getAttribute("data-auth-open");
        openModal(type);
      });
    });
  }

  async function mountAndInit() {
    const mount = document.querySelector("[data-auth-modal-mount]");
    if (!mount) return;

    const loginPath = mount.getAttribute("data-login-path");
    const registerPath = mount.getAttribute("data-register-path");
    if (!loginPath || !registerPath) return;

    try {
      const [loginMarkup, registerMarkup] = await Promise.all([
        fetchMarkup(loginPath),
        fetchMarkup(registerPath),
      ]);

      buildModal();
      dom.views.get("login").innerHTML = extractFragment(loginMarkup);
      dom.views.get("register").innerHTML = extractFragment(registerMarkup);
      setupFormHandlers();
      bindModalEvents();
    } catch (error) {
      console.error(error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAndInit, { once: true });
  } else {
    mountAndInit();
  }

  window.KCAuthModal = {
    openLogin(options) {
      openModal("login", options);
    },
    openRegister(options) {
      openModal("register", options);
    },
    close: closeModal,
  };
})();


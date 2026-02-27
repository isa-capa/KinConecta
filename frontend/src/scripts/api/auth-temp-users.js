(function () {
  // TEMPORAL: usuarios locales de prueba para navegar sin backend de autenticacion.
  // TODO(BACKEND): eliminar este archivo cuando el login real este activo.
  const TEMP_USERS_STORAGE_KEY = "kc_temp_auth_users_v1";
  const LAST_VALIDATED_USER_STORAGE_KEY = "kc_temp_auth_last_validated_v1";

  const TEMP_USERS_SOURCE = [
    {
      id: "tourist_temp_001",
      role: "tourist",
      fullName: "Turista Temporal",
      email: "turista@prueba.com",
      password: "contrase\u00f1a123",
    },
    {
      id: "guide_temp_001",
      role: "guide",
      fullName: "Guia Temporal",
      email: "guia@prueba.com",
      password: "contrase\u00f1a123",
    },
  ];

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function normalizePassword(value) {
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

  function encodeCredential(value) {
    const normalized = normalizePassword(value);
    try {
      const bytes = new TextEncoder().encode(normalized);
      let binary = "";
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      return btoa(binary);
    } catch (_error) {
      try {
        return btoa(unescape(encodeURIComponent(normalized)));
      } catch (_secondError) {
        return "";
      }
    }
  }

  function normalizeRole(value) {
    const role = String(value || "").trim().toLowerCase();
    return role === "guide" ? "guide" : "tourist";
  }

  function sanitizeStoredUser(user) {
    if (!user || typeof user !== "object") return null;
    const username = normalizeEmail(user.username || user.email);
    const passwordCode = String(user.passwordCode || "").trim();
    const passwordCodeAscii = String(user.passwordCodeAscii || "").trim();
    if (!username || !passwordCode) return null;
    return {
      id: String(user.id || ""),
      role: normalizeRole(user.role),
      fullName: String(user.fullName || ""),
      username,
      email: normalizeEmail(user.email || username),
      passwordCode,
      passwordCodeAscii,
    };
  }

  function buildSeedUsers() {
    return TEMP_USERS_SOURCE.map((user) => {
      const normalizedPassword = normalizePassword(user.password);
      return {
        id: String(user.id || ""),
        role: normalizeRole(user.role),
        fullName: String(user.fullName || ""),
        username: normalizeEmail(user.email),
        email: normalizeEmail(user.email),
        passwordCode: encodeCredential(normalizedPassword),
        passwordCodeAscii: encodeCredential(stripDiacritics(normalizedPassword).toLowerCase()),
      };
    });
  }

  function readStoredUsers() {
    let parsed;
    try {
      parsed = JSON.parse(localStorage.getItem(TEMP_USERS_STORAGE_KEY) || "[]");
    } catch (_error) {
      parsed = [];
    }
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => sanitizeStoredUser(item)).filter(Boolean);
  }

  function ensureSeededUsers() {
    const existingUsers = readStoredUsers();
    if (existingUsers.length) return existingUsers;

    const seededUsers = buildSeedUsers();
    localStorage.setItem(TEMP_USERS_STORAGE_KEY, JSON.stringify(seededUsers));
    console.info("[KCTempAuth] Usuarios de prueba precargados en localStorage.", {
      key: TEMP_USERS_STORAGE_KEY,
      users: seededUsers.map((user) => user.username),
    });
    return seededUsers;
  }

  function persistValidatedUser(user) {
    const payload = {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      validatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LAST_VALIDATED_USER_STORAGE_KEY, JSON.stringify(payload));
    console.info("[KCTempAuth] Usuario validado correctamente.", payload);
  }

  function validateLogin(email, password) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = normalizePassword(password);
    const asciiPassword = stripDiacritics(normalizedPassword).toLowerCase();
    const encodedPassword = encodeCredential(normalizedPassword);
    const encodedPasswordAscii = encodeCredential(asciiPassword);

    const users = ensureSeededUsers();
    const match = users.find(
      (user) =>
        user.username === normalizedEmail &&
        (user.passwordCode === encodedPassword || user.passwordCodeAscii === encodedPasswordAscii),
    );

    if (!match) {
      console.warn("[KCTempAuth] Credenciales invalidas.", { username: normalizedEmail });
      return null;
    }

    persistValidatedUser(match);
    return {
      id: match.id,
      role: match.role,
      fullName: match.fullName,
      email: match.email,
      username: match.username,
    };
  }

  ensureSeededUsers();

  window.KCTempAuth = {
    validateLogin,
    ensureSeededUsers,
    getStoredUsers: readStoredUsers,
    storageKey: TEMP_USERS_STORAGE_KEY,
    lastValidatedUserStorageKey: LAST_VALIDATED_USER_STORAGE_KEY,
  };
})();

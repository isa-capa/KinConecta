(function () {
  // TEMPORAL: Usuarios locales de prueba para navegar sin backend de autenticación.
  // TODO(BACKEND): eliminar este archivo cuando el login real esté activo.
  const TEMP_USERS = [
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
      fullName: "Guía Temporal",
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

  function validateLogin(email, password) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = normalizePassword(password);
    const asciiPassword = stripDiacritics(normalizedPassword).toLowerCase();

    const match = TEMP_USERS.find(
      (user) =>
        user.email === normalizedEmail &&
        (user.password === normalizedPassword || stripDiacritics(user.password).toLowerCase() === asciiPassword),
    );

    if (!match) return null;

    return {
      id: match.id,
      role: match.role,
      fullName: match.fullName,
      email: match.email,
    };
  }

  window.KCTempAuth = {
    validateLogin,
  };
})();

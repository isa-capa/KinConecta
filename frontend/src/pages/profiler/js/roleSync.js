(() => {
  const roleInput = document.getElementById("roleInput");
  const tabs = document.querySelectorAll(".tab");

  if (!roleInput || !tabs.length) return;

  function activateTab(role) {
    tabs.forEach(t => {
      const isActive = t.dataset.role === role;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  // 1) Cuando cambias el SELECT -> cambia tabs y wizard
  roleInput.addEventListener("change", () => {
    const role = roleInput.value;
    if (!role) return;
    activateTab(role);
    if (typeof setRole === "function") setRole(role);
  });

  // 2) Cuando cambias TAB -> cambia el select
  tabs.forEach(t => {
    t.addEventListener("click", () => {
      const role = t.dataset.role;
      roleInput.value = role;        // sincroniza el select
      activateTab(role);
    });
  });

  // init: si un tab ya está activo al cargar, setea select
  const active = document.querySelector(".tab.active")?.dataset.role;
  if (active) roleInput.value = active;
})();

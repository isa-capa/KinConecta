//Carga JSON e inyecta al controller

async function seedProfilesFromJson(url = "../../scripts/data/profiler/seedProfiles.json") {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo cargar ${url} (status ${res.status})`);

    const data = await res.json();

    // Evita duplicar si ya hay items (por storage, etc.)
    if (profilesController.items.length > 0) return;

    const travelers = Array.isArray(data.traveler) ? data.traveler : [];
    const guides = Array.isArray(data.guide) ? data.guide : [];

    travelers.forEach(a => profilesController.addItem("traveler", a));
    guides.forEach(a => profilesController.addItem("guide", a));

    console.log("✅ Seed cargado:", profilesController.items.length);
    console.table(profilesController.items);
  } catch (err) {
    console.warn("⚠️ Seed error:", err.message);
  }
}

// corre al cargar
seedProfilesFromJson();

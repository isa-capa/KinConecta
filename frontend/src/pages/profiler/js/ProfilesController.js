/* ==========================================================
   ProfilesController
   - Administra "items" de la app (perfiles)
   - Guarda un arreglo this.items
   - Genera IDs incrementales con this.currentId
   ========================================================== */

class ProfilesController {
  constructor(currentId = 0) {
    // 1) Estado principal
    this.currentId = currentId;
    this.items = [];
  }

  // 2) Crear un nuevo perfil (item) con ID único
  addItem(role, answers, createdAt = new Date().toISOString()) {
    // Incrementa ID para asegurar unicidad
    this.currentId += 1;

    const newProfile = {
      id: this.currentId,
      role,          // "traveler" | "guide"
      answers,       // objeto con respuestas (tu estructura actual)
      createdAt
    };

    this.items.push(newProfile);
    return newProfile;
  }

  // 3) Helpers útiles (opcional, pero muy práctico)
  getItems() {
    return [...this.items];
  }

  getLastItem() {
    return this.items[this.items.length - 1] || null;
  }
}

//test
const profilesController = new ProfilesController();
console.log("ProfilesController.items (debe iniciar vacío):", profilesController.items);


/* ==========================================================
   TAREA 7
   5 Turistas + 5 Guías
   ========================================================== */

// ===== TURISTAS =====

profilesController.addItem("traveler", {
  interests: ["Naturaleza", "Fotografía"],
  travelStyle: "Premium",
  languages: ["Español", "Francés"],
  pace: 7,
  groupPreference: "Pareja",
  foodPrefs: ["Vegetariano"],
  planningLevel: 4,
  transport: "Auto privado",
  photoVibe: "Me encanta (muchas fotos)",
  accessibility: ["Evitar multitudes"],
  notes: "Viaje romántico"
});

profilesController.addItem("traveler", {
  interests: ["Historia", "Arte"],
  travelStyle: "Mid-range",
  languages: ["Inglés"],
  pace: 4,
  groupPreference: "Grupo pequeño (3-6)",
  foodPrefs: ["Todo"],
  planningLevel: 3,
  transport: "Caminar",
  photoVibe: "Algunas fotos",
  accessibility: ["Rutas tranquilas"],
  notes: "Interesado en museos"
});

profilesController.addItem("traveler", {
  interests: ["Vida nocturna", "Gastronomía"],
  travelStyle: "Lujo",
  languages: ["Español", "Inglés"],
  pace: 8,
  groupPreference: "Grupo mediano (7-12)",
  foodPrefs: ["Mariscos sí", "Picante sí"],
  planningLevel: 2,
  transport: "Taxi/Uber",
  photoVibe: "Muchas fotos",
  accessibility: ["Ninguna"],
  notes: "Celebración de cumpleaños"
});

profilesController.addItem("traveler", {
  interests: ["Aventura", "Naturaleza"],
  travelStyle: "Económico",
  languages: ["Español"],
  pace: 9,
  groupPreference: "Solo/Privado",
  foodPrefs: ["Todo"],
  planningLevel: 1,
  transport: "Transporte público",
  photoVibe: "Pocas fotos",
  accessibility: ["Sombras/descansos"],
  notes: "Backpacker"
});

profilesController.addItem("traveler", {
  interests: ["Cultura", "Gastronomía"],
  travelStyle: "Mid-range",
  languages: ["Español", "Inglés"],
  pace: 6,
  groupPreference: "Grupo pequeño (3-6)",
  foodPrefs: ["Todo", "Picante sí"],
  planningLevel: 3,
  transport: "Caminar",
  photoVibe: "Algunas fotos",
  accessibility: ["Ninguna"],
  notes: "Prefiero empezar temprano"
});

// ===== GUIAS =====

profilesController.addItem("guide", {
  expertise: ["Historia", "Arte y cultura"],
  locations: ["Ciudad de México", "Puebla"],
  experienceLevel: "Experto (5+ años)",
  languages: ["Español", "Inglés", "Francés"],
  guideStyle: "Narrativo (muchas historias)",
  groupSize: "3-6",
  pace: 5,
  transportSupport: ["Caminar", "Transporte público"],
  certs: ["Guía certificado"],
  accessibility: ["Rutas tranquilas"],
  photoVibe: "Tomo fotos proactivamente",
  notes: "Especialista en centro histórico"
});

profilesController.addItem("guide", {
  expertise: ["Aventura", "Naturaleza"],
  locations: ["Tulum", "Cancún"],
  experienceLevel: "Avanzado (2+ años)",
  languages: ["Español", "Inglés"],
  guideStyle: "Aventura (reto/energía)",
  groupSize: "7-12",
  pace: 8,
  transportSupport: ["Auto propio"],
  certs: ["Primeros auxilios"],
  accessibility: ["Paradas frecuentes"],
  photoVibe: "Solo si me piden",
  notes: "Tours de selva y cenotes"
});

profilesController.addItem("guide", {
  expertise: ["Tours gastronómicos"],
  locations: ["Oaxaca"],
  experienceLevel: "Intermedio (6-24 meses)",
  languages: ["Español"],
  guideStyle: "Práctico (tips y logística)",
  groupSize: "1-2",
  pace: 4,
  transportSupport: ["Caminar"],
  certs: ["Tour operator"],
  accessibility: ["Evitar multitudes"],
  photoVibe: "Pocas fotos",
  notes: "Especialista en mercados locales"
});

profilesController.addItem("guide", {
  expertise: ["Experiencias premium"],
  locations: ["San Miguel de Allende"],
  experienceLevel: "Experto (5+ años)",
  languages: ["Español", "Inglés"],
  guideStyle: "Flexible (me adapto)",
  groupSize: "Me adapto",
  pace: 6,
  transportSupport: ["Coordino chofer"],
  certs: ["Protección civil"],
  accessibility: ["Movilidad reducida"],
  photoVibe: "Tomo fotos proactivamente",
  notes: "Experiencias privadas de lujo"
});

profilesController.addItem("guide", {
  expertise: ["Historia", "Tours gastronómicos"],
  locations: ["Ciudad de México", "Oaxaca"],
  experienceLevel: "Avanzado (2+ años)",
  languages: ["Español", "Inglés"],
  guideStyle: "Narrativo (muchas historias)",
  groupSize: "3-6",
  pace: 5,
  transportSupport: ["Caminar", "Transporte público"],
  certs: ["Primeros auxilios"],
  accessibility: ["Rutas tranquilas"],
  photoVibe: "Tomo fotos proactivamente",
  notes: "Disponible fines de semana"
});

// Mostrar resultado final en consola
console.log("TOTAL ITEMS CREADOS:", profilesController.items.length);
console.table(profilesController.items);

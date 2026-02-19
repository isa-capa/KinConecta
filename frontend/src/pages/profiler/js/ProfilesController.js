class ProfilesController {
  constructor(currentId = 0) {
    this.currentId = currentId;
    this.items = [];
  }

  // Crea el perfil con su "meta" (nombre, img, description) y answers vacíos
  createProfile(role, meta, createdAt = new Date().toISOString()) {
    this.currentId += 1;

    const newProfile = {
      id: this.currentId,
      role,              // "traveler" | "guide"
      meta: {
        name: meta?.name ?? "",
        img: meta?.img ?? "",
        description: meta?.description ?? "",
        email: meta?.email ?? "",
        dateOfBirth: meta?.dateOfBirth ?? ""
      },
      answers: {},        // aquí se llenará al final del wizard
      createdAt,
      updatedAt: createdAt
    };

    this.items.push(newProfile);
    return newProfile;
  }

  // Actualiza (merge) un perfil existente
  updateProfile(id, patch) {
    const item = this.items.find(p => p.id === id);
    if (!item) return null;

    // Merge seguro
    if (patch.role) item.role = patch.role;

    if (patch.meta) {
      item.meta = { ...(item.meta || {}), ...patch.meta };
    }

    if (patch.answers) {
      item.answers = { ...(item.answers || {}), ...patch.answers };
    }

    item.updatedAt = new Date().toISOString();
    return item;
  }

  getItems() { return [...this.items]; }
  getLastItem() { return this.items[this.items.length - 1] || null; }
}

const profilesController = new ProfilesController();
console.log("ProfilesController.items (debe iniciar vacío):", profilesController.items);


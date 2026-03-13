(function () {
  if (!window.KCApiClient) {
    console.error("KCApiClient is required before tourist-api-services.js");
    return;
  }

  const api = window.KCApiClient;
  const TOURIST_AVATAR_ASSET = "../../../assets/users/user_tourist.png";
  const TOURIST_COVER_ASSET = "../../../assets/users/user_tourist_background.png";
  const GUIDE_AVATAR_ASSET = "../../../assets/users/user_guide.png";
  const normalizeLookup = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const TOUR_IMAGE_BY_CATEGORY = [
    {
      match: ["gastronomia", "food", "culin", "mercado", "cantina"],
      url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    },
    {
      match: ["aventur", "sender", "montan", "hiking", "nature", "naturaleza", "cenote", "ecotur"],
      url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    },
    {
      match: ["hist", "cultura", "arque", "architecture", "arquitect", "museo", "centro"],
      url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
    },
    {
      match: ["arte", "art", "street", "mural", "fotografia", "photo"],
      url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    },
    {
      match: ["playa", "beach", "mar", "coast", "isla"],
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    },
    {
      match: ["ciudad", "city", "urban", "walking", "tour"],
      url: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const unwrap = (response) => {
    const data = response?.data?.items || response?.data || [];
    return Array.isArray(data) ? data : [];
  };

  const id = (value, fallback = 1) => {
    const digits = String(value ?? "").match(/\d+/g);
    const parsed = Number(digits ? digits.join("") : value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  const page = (items, query) => {
    const rows = Array.isArray(items) ? items : [];
    const current = Math.max(0, Number(query?.page || 0));
    const size = Math.max(1, Number(query?.size || rows.length || 1));
    return rows.slice(current * size, current * size + size);
  };

  const touristId = (value) => id(value ?? window.localStorage.getItem("kc_tourist_id"), 1);
  const monthKey = (value) => {
    const parsed = value ? new Date(value) : null;
    return parsed && !Number.isNaN(parsed.getTime())
      ? `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`
      : "";
  };
  const formatMoney = (amount) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  const dateLabel = (value, fallback = "") => {
    const parsed = value ? new Date(value) : null;
    return parsed && !Number.isNaN(parsed.getTime())
      ? parsed.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })
      : fallback;
  };
  const resolveTourImage = (...candidates) => {
    const direct = candidates.find((value) => String(value || "").trim());
    if (direct) return String(direct).trim();

    const haystack = normalizeLookup(candidates.join(" "));
    const matched = TOUR_IMAGE_BY_CATEGORY.find((entry) =>
      entry.match.some((token) => haystack.includes(token)),
    );
    return matched
      ? matched.url
      : "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80";
  };

  async function usersMap() {
    return new Map(unwrap(await api.get("/users")).map((item) => [id(item.userId, 0), item]));
  }

  async function toursMap() {
    return new Map(unwrap(await api.get("/tours")).map((item) => [id(item.tourId, 0), item]));
  }

  async function guideProfilesMap() {
    return new Map(unwrap(await api.get("/guide_profiles")).map((item) => [id(item.userId, 0), item]));
  }

  async function touristProfile(value) {
    const currentTouristId = touristId(value);
    const [
      profileRes,
      users,
      interestsRes,
      profileInterestsRes,
      languagesRes,
      profileLanguagesRes,
    ] = await Promise.all([
      api.get(`/tourist_profiles/${encodeURIComponent(currentTouristId)}`),
      usersMap(),
      api.get("/interests"),
      api.get("/tourist_profile_interests"),
      api.get("/languages"),
      api.get("/tourist_profile_languages"),
    ]);

    const base = profileRes?.data || {};
    const user = users.get(currentTouristId) || {};
    const interestsMap = new Map(unwrap(interestsRes).map((item) => [Number(item.interestId), item.name]));
    const languagesMap = new Map(unwrap(languagesRes).map((item) => [String(item.languageCode), item.name]));

    return {
      userId: currentTouristId,
      name: user.fullName || "",
      location: base.location || "",
      memberSince: base.memberSince || user.createdAt || "",
      badge: base.badge || "",
      bio: base.bio || "",
      interests: unwrap(profileInterestsRes)
        .filter((item) => id(item.userId, 0) === currentTouristId)
        .map((item) => interestsMap.get(Number(item.interestId)))
        .filter(Boolean),
      travelStyle: base.travelStyle || "",
      tripType: base.tripType || "",
      languages: unwrap(profileLanguagesRes)
        .filter((item) => id(item.userId, 0) === currentTouristId)
        .map((item) => languagesMap.get(String(item.languageCode)) || item.languageCode)
        .filter(Boolean),
      paceAndCompany: base.paceAndCompany || "",
      activityLevel: base.activityLevel || "",
      groupPreference: base.groupPreference || "",
      dietaryPreferences: base.dietaryPreferences || "",
      planningLevel: base.planningLevel || "",
      amenities: base.amenities || "",
      transport: base.transport || "",
      photoPreference: base.photoPreference || "",
      accessibility: base.accessibility || "",
      additionalNotes: base.additionalNotes || "",
      avatarUrl: TOURIST_AVATAR_ASSET,
      coverUrl: TOURIST_COVER_ASSET,
      updatedAt: base.updatedAt || user.updatedAt || "",
    };
  }

  async function bookingsByTourist(value) {
    const currentTouristId = touristId(value);
    return unwrap(await api.get("/trip_bookings")).filter((item) => id(item.touristId, 0) === currentTouristId);
  }

  async function reviewsByTourist(value) {
    const currentTouristId = touristId(value);
    return unwrap(await api.get("/reviews")).filter((item) => id(item.touristId, 0) === currentTouristId);
  }

  async function favoriteGuidesByTourist(value) {
    const currentTouristId = touristId(value);
    return unwrap(await api.get("/favorite_guides")).filter((item) => id(item.touristId, 0) === currentTouristId);
  }

  async function favoriteToursByTourist(value) {
    const currentTouristId = touristId(value);
    return unwrap(await api.get("/favorite_tours")).filter((item) => id(item.touristId, 0) === currentTouristId);
  }

  async function syncTouristRelations(currentTouristId, interests, languages) {
    const [interestRows, languageRows, allInterests, allLanguages] = await Promise.all([
      api.get("/tourist_profile_interests"),
      api.get("/tourist_profile_languages"),
      api.get("/interests"),
      api.get("/languages"),
    ]);

    const currentInterests = unwrap(interestRows).filter((item) => id(item.userId, 0) === currentTouristId);
    const currentLanguages = unwrap(languageRows).filter((item) => id(item.userId, 0) === currentTouristId);
    const interestMap = new Map(unwrap(allInterests).map((item) => [String(item.name || "").trim().toLowerCase(), Number(item.interestId)]));
    const languageMap = new Map(unwrap(allLanguages).map((item) => [String(item.name || "").trim().toLowerCase(), String(item.languageCode)]));

    await Promise.all(
      currentInterests.map((item) =>
        api.delete(`/tourist_profile_interests/${encodeURIComponent(item.userId)}/${encodeURIComponent(item.interestId)}`),
      ),
    );
    await Promise.all(
      currentLanguages.map((item) =>
        api.delete(`/tourist_profile_languages/${encodeURIComponent(item.userId)}/${encodeURIComponent(item.languageCode)}`),
      ),
    );

    await Promise.all(
      (Array.isArray(interests) ? interests : [])
        .map((item) => interestMap.get(String(item || "").trim().toLowerCase()))
        .filter(Boolean)
        .map((interestId) =>
          api.post("/tourist_profile_interests", {
            userId: currentTouristId,
            interestId,
          })),
    );

    await Promise.all(
      (Array.isArray(languages) ? languages : [])
        .map((item) => languageMap.get(String(item || "").trim().toLowerCase()) || String(item || "").trim())
        .filter(Boolean)
        .map((languageCode) =>
          api.post("/tourist_profile_languages", {
            userId: currentTouristId,
            languageCode,
          })),
    );
  }

  async function favoriteGuideCards(value) {
    const [favorites, users, guideProfiles] = await Promise.all([
      favoriteGuidesByTourist(value),
      usersMap(),
      guideProfilesMap(),
    ]);

    return favorites.map((item) => {
      const currentGuideId = id(item.guideId, 0);
      const user = users.get(currentGuideId) || {};
      const profile = guideProfiles.get(currentGuideId) || {};
      return {
        id: currentGuideId,
        title: user.fullName || "Guia",
        name: user.fullName || "Guia",
        location: profile.locationLabel || "Mexico",
        place: profile.locationLabel || "Mexico",
        description: profile.summary || "Guia registrado en backend.",
        priceLabel: profile.hourlyRate ? `${formatMoney(profile.hourlyRate)} / hora` : "Disponible",
        tags: [],
        imageUrl: GUIDE_AVATAR_ASSET,
        avatarUrl: GUIDE_AVATAR_ASSET,
      };
    });
  }

  async function favoriteTourCards(value) {
    const [favorites, tours, destinationsRes, tourDestinationsRes] = await Promise.all([
      favoriteToursByTourist(value),
      toursMap(),
      api.get("/destinations"),
      api.get("/tour_destinations"),
    ]);
    const destinations = new Map(
      unwrap(destinationsRes).map((item) => [
        id(item.destinationId, 0),
        `${item.city || ""}${item.state ? `, ${item.state}` : ""}`.trim(),
      ]),
    );
    const tourDestinations = unwrap(tourDestinationsRes);

    return favorites.map((item) => {
      const tour = tours.get(id(item.tourId, 0)) || {};
      const link = tourDestinations.find((entry) => id(entry.tourId, 0) === id(item.tourId, 0));
      return {
        id: tour.tourId || item.tourId,
        title: tour.title || "Experiencia",
        location: destinations.get(id(link?.destinationId, 0)) || tour.meetingPoint || "Mexico",
        description: tour.description || "",
        priceLabel: `${formatMoney(tour.price)} / persona`,
        tags: [],
        imageUrl: resolveTourImage(
          tour.coverImageUrl,
          tour.categoryName,
          tour.title,
          tour.description,
          tour.meetingPoint,
        ),
      };
    });
  }

  async function allTourCards() {
    const [tours, destinationsRes, tourDestinationsRes, reviewsRes] = await Promise.all([
      toursMap(),
      api.get("/destinations"),
      api.get("/tour_destinations"),
      api.get("/reviews"),
    ]);
    const destinations = new Map(
      unwrap(destinationsRes).map((item) => [
        id(item.destinationId, 0),
        {
          title: `${item.city || ""}${item.state ? `, ${item.state}` : ""}`.trim() || "Destino",
          subtitle: item.description || "Destino en backend",
          imageUrl: item.imageUrl || "",
          wide: Boolean(item.isFeatured),
        },
      ]),
    );
    const tourDestinations = unwrap(tourDestinationsRes);
    const reviews = unwrap(reviewsRes);

    return [...tours.values()].map((tour) => {
      const link = tourDestinations.find((item) => id(item.tourId, 0) === id(tour.tourId, 0));
      const destination = destinations.get(id(link?.destinationId, 0));
      const tourReviews = reviews.filter((item) => id(item.tourId, 0) === id(tour.tourId, 0));
      return {
        id: tour.tourId,
        title: tour.title || "Experiencia",
        location: destination?.title || tour.meetingPoint || "Mexico",
        category: String(tour.categoryName || "all").toLowerCase(),
        tags: [],
        rating: tourReviews.length
          ? tourReviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / tourReviews.length
          : Number(tour.ratingAvg || 0),
        priceLabel: `${formatMoney(tour.price)} / persona`,
        imageUrl: resolveTourImage(
          tour.coverImageUrl,
          destination?.imageUrl,
          tour.categoryName,
          tour.title,
          tour.description,
          destination?.title,
          tour.meetingPoint,
        ),
      };
    });
  }

  const dashboard = {
    async getSummary(value) {
      const profile = await touristProfile(value);
      return {
        ok: true,
        status: 200,
        data: {
          name: profile.name,
          fullName: profile.name,
          activeTrips: (await bookingsByTourist(value)).filter((item) => String(item.status || "").toUpperCase() !== "CANCELLED").length,
        },
      };
    },
    async getNextTrip(value) {
      const [bookings, tours, users, guides] = await Promise.all([
        bookingsByTourist(value),
        toursMap(),
        usersMap(),
        guideProfilesMap(),
      ]);
      const next = bookings
        .slice()
        .sort((a, b) => String(a.startDatetime || "").localeCompare(String(b.startDatetime || "")))
        .find((item) => new Date(item.startDatetime) >= new Date()) || bookings[0] || null;
      if (!next) return { ok: true, status: 200, data: null };
      const tour = tours.get(id(next.tourId, 0)) || {};
      const user = users.get(id(next.guideId, 0)) || {};
      const guide = guides.get(id(next.guideId, 0)) || {};
      return {
        ok: true,
        status: 200,
        data: {
          id: next.tripId,
          destination: guide.locationLabel || tour.meetingPoint || "Mexico",
          title: tour.title || "Viaje",
          datesLabel: `${dateLabel(next.startDatetime, "Sin fecha")} - ${dateLabel(next.endDatetime, "Sin fecha")}`,
          statusLabel: next.status || "PENDING",
          imageUrl: resolveTourImage(
            tour.coverImageUrl,
            tour.categoryName,
            tour.title,
            tour.description,
            guide.locationLabel,
            tour.meetingPoint,
          ),
          guide: {
            id: next.guideId,
            name: user.fullName || "Guia",
            avatarUrl: GUIDE_AVATAR_ASSET,
          },
        },
      };
    },
    async getRecommendedGuides(query) {
      const [users, profiles] = await Promise.all([usersMap(), guideProfilesMap()]);
      const items = [...profiles.values()].map((profile) => {
        const user = users.get(id(profile.userId, 0)) || {};
        return {
          id: profile.userId,
          name: user.fullName || "Guia",
          fullName: user.fullName || "Guia",
          description: profile.summary || "Guia registrado en backend.",
          bio: profile.summary || "Guia registrado en backend.",
          price: Number(profile.hourlyRate || 0),
          rating: Number(profile.ratingAvg || 0),
          location: profile.locationLabel || "Mexico",
          place: profile.locationLabel || "Mexico",
          imageUrl: GUIDE_AVATAR_ASSET,
          avatarUrl: GUIDE_AVATAR_ASSET,
        };
      });
      return { ok: true, status: 200, data: { items: page(items, query) } };
    },
    async getPopularDestinations(query) {
      const items = unwrap(await api.get("/destinations")).map((item) => ({
        id: item.destinationId,
        title: `${item.city || ""}${item.state ? `, ${item.state}` : ""}`.trim() || "Destino",
        subtitle: item.description || "Destino disponible",
        description: item.description || "",
        isFeatured: Boolean(item.isFeatured),
        imageUrl: item.imageUrl || "",
      }));
      return { ok: true, status: 200, data: { items: page(items, query) } };
    },
    async getSavedGuides(query, value) {
      return { ok: true, status: 200, data: { items: page(await favoriteGuideCards(value), query) } };
    },
  };

  const explore = {
    async listExperiences(query) {
      let items = await allTourCards();
      if (query?.city) {
        const city = String(query.city).trim().toLowerCase();
        items = items.filter((item) => String(item.location || "").toLowerCase().includes(city));
      }
      return { ok: true, status: 200, data: { items: page(items, query) } };
    },
    async listGuides(query) {
      let items = unwrap(await dashboard.getRecommendedGuides(query));
      if (query?.city) {
        const city = String(query.city).trim().toLowerCase();
        items = items.filter((item) => String(item.location || item.place || "").toLowerCase().includes(city));
      }
      return { ok: true, status: 200, data: { items: page(items, query) } };
    },
    listCategories: () => api.get("/tour_categories"),
    async toggleFavorite(tourId, value) {
      const currentTouristId = touristId(value);
      const existing = (await favoriteToursByTourist(currentTouristId)).find((item) => id(item.tourId, 0) === id(tourId, 0));
      if (existing) {
        return api.delete(`/favorite_tours/${encodeURIComponent(currentTouristId)}/${encodeURIComponent(tourId)}`);
      }
      return api.post("/favorite_tours", {
        touristId: currentTouristId,
        tourId: id(tourId, 0),
        createdAt: new Date().toISOString(),
      });
    },
  };

  const favorites = {
    async listGuides(query, value) {
      return { ok: true, status: 200, data: { items: page(await favoriteGuideCards(value), query) } };
    },
    async listExperiences(query, value) {
      return { ok: true, status: 200, data: { items: page(await favoriteTourCards(value), query) } };
    },
    removeGuide: (guideUserId, value) =>
      api.delete(`/favorite_guides/${encodeURIComponent(touristId(value))}/${encodeURIComponent(id(guideUserId, 0))}`),
    removeExperience: (tourId, value) =>
      api.delete(`/favorite_tours/${encodeURIComponent(touristId(value))}/${encodeURIComponent(id(tourId, 0))}`),
  };

  const trips = {
    async list(query, value) {
      const [bookings, tours, users, guides] = await Promise.all([
        bookingsByTourist(value),
        toursMap(),
        usersMap(),
        guideProfilesMap(),
      ]);
      const items = bookings.map((item) => {
        const tour = tours.get(id(item.tourId, 0)) || {};
        const user = users.get(id(item.guideId, 0)) || {};
        const guide = guides.get(id(item.guideId, 0)) || {};
        return {
          id: item.tripId,
          title: tour.title || "Viaje",
          destination: guide.locationLabel || tour.meetingPoint || "Mexico",
          location: guide.locationLabel || tour.meetingPoint || "Mexico",
          date: dateLabel(item.startDatetime, "Sin fecha"),
          dateLabel: dateLabel(item.startDatetime, "Sin fecha"),
          status: String(item.status || "").toLowerCase(),
          statusLabel: item.status || "PENDING",
          guideId: item.guideId,
          guideName: user.fullName || "Guia",
          guideAvatar: GUIDE_AVATAR_ASSET,
          imageUrl: resolveTourImage(
            tour.coverImageUrl,
            tour.categoryName,
            tour.title,
            tour.description,
            guide.locationLabel,
            tour.meetingPoint,
          ),
          image: resolveTourImage(
            tour.coverImageUrl,
            tour.categoryName,
            tour.title,
            tour.description,
            guide.locationLabel,
            tour.meetingPoint,
          ),
        };
      });
      return { ok: true, status: 200, data: { items: page(items, query) } };
    },
    async detail(tripId) {
      const [bookingRes, tours, users, guides] = await Promise.all([
        api.get(`/trip_bookings/${encodeURIComponent(tripId)}`),
        toursMap(),
        usersMap(),
        guideProfilesMap(),
      ]);
      const item = bookingRes?.data || {};
      const tour = tours.get(id(item.tourId, 0)) || {};
      const user = users.get(id(item.guideId, 0)) || {};
      const guide = guides.get(id(item.guideId, 0)) || {};
      return {
        ok: true,
        status: 200,
        data: {
          id: item.tripId,
          title: tour.title || "Viaje",
          destination: guide.locationLabel || tour.meetingPoint || "Mexico",
          location: guide.locationLabel || tour.meetingPoint || "Mexico",
          dateLabel: dateLabel(item.startDatetime, "Sin fecha"),
          status: String(item.status || "").toLowerCase(),
          statusLabel: item.status || "PENDING",
          guideId: item.guideId,
          guideName: user.fullName || "Guia",
          guideAvatar: GUIDE_AVATAR_ASSET,
          imageUrl: resolveTourImage(
            tour.coverImageUrl,
            tour.categoryName,
            tour.title,
            tour.description,
            guide.locationLabel,
            tour.meetingPoint,
          ),
          image: resolveTourImage(
            tour.coverImageUrl,
            tour.categoryName,
            tour.title,
            tour.description,
            guide.locationLabel,
            tour.meetingPoint,
          ),
        },
      };
    },
    create(payload, value) {
      return api.post("/trip_bookings", {
        tourId: id(payload?.tourId, 0),
        touristId: touristId(value),
        guideId: id(payload?.guideId, 0),
        startDatetime: payload?.startDatetime || payload?.startDate,
        endDatetime: payload?.endDatetime || payload?.endDate,
        status: payload?.status || "PENDING",
        notes: payload?.notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    async update(tripId, payload) {
      const current = (await api.get(`/trip_bookings/${encodeURIComponent(tripId)}`))?.data || {};
      return api.put(`/trip_bookings/${encodeURIComponent(tripId)}`, {
        ...current,
        ...payload,
        status: payload?.status ? String(payload.status).toUpperCase() : current.status,
        updatedAt: new Date().toISOString(),
      });
    },
    async cancel(tripId, payload) {
      return trips.update(tripId, {
        status: "CANCELLED",
        cancelReason: payload?.reason || "",
      });
    },
  };

  const reviews = {
    async getSummary(value) {
      const items = await reviewsByTourist(value);
      const average = items.length ? items.reduce((sum, item) => sum + Number(item.rating || 0), 0) / items.length : 0;
      return {
        ok: true,
        status: 200,
        data: {
          totalReviews: items.length,
          averageRating: average,
          fiveStarsRate: items.length ? `${Math.round((items.filter((item) => Number(item.rating || 0) === 5).length / items.length) * 100)}%` : "0%",
          monthCount: items.filter((item) => monthKey(item.createdAt) === monthKey(new Date().toISOString())).length,
        },
      };
    },
    async list(query, value) {
      const [items, users, tours] = await Promise.all([reviewsByTourist(value), usersMap(), toursMap()]);
      return {
        ok: true,
        status: 200,
        data: {
          items: page(
            items.map((item) => ({
              id: item.reviewId,
              guideId: item.guideId,
              guideName: users.get(id(item.guideId, 0))?.fullName || "Guia",
              tourName: tours.get(id(item.tourId, 0))?.title || "Experiencia",
              dateLabel: dateLabel(item.createdAt, "Reciente"),
              rating: Number(item.rating || 0),
              comment: item.comment || "",
              body: item.comment || "",
              likesCount: Number(item.likesCount || 0),
              repliesCount: Number(item.repliesCount || 0),
            })),
            query,
          ),
        },
      };
    },
    create: (payload, value) =>
      api.post("/reviews", {
        tripId: id(payload?.tripId, 0),
        tourId: id(payload?.tourId, 0),
        guideId: id(payload?.guideId, 0),
        touristId: touristId(value),
        rating: Number(payload?.rating || 0),
        comment: payload?.comment || "",
        likesCount: 0,
        repliesCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    async update(reviewId, payload) {
      const current = (await api.get(`/reviews/${encodeURIComponent(reviewId)}`))?.data || {};
      return api.put(`/reviews/${encodeURIComponent(reviewId)}`, {
        ...current,
        ...payload,
        updatedAt: new Date().toISOString(),
      });
    },
    remove: (reviewId) => api.delete(`/reviews/${encodeURIComponent(reviewId)}`),
  };

  const profile = {
    async getMe(value) {
      return { ok: true, status: 200, data: await touristProfile(value) };
    },
    async updateMe(payload, value) {
      const currentTouristId = touristId(value);
      const activityLevelMap = {
        bajo: "LOW",
        low: "LOW",
        moderado: "MODERATE",
        moderate: "MODERATE",
        alto: "HIGH",
        high: "HIGH",
      };
      const planningLevelMap = {
        bajo: "LOW",
        low: "LOW",
        intermedio: "INTERMEDIATE",
        intermediate: "INTERMEDIATE",
        alto: "HIGH",
        high: "HIGH",
      };
      const normalizedActivity =
        activityLevelMap[String(payload?.activityLevel || "").trim().toLowerCase()] || "MODERATE";
      const normalizedPlanning =
        planningLevelMap[String(payload?.planningLevel || "").trim().toLowerCase()] || "INTERMEDIATE";
      const response = await api.put(`/tourist_profiles/${encodeURIComponent(currentTouristId)}`, {
        location: payload?.location || "",
        bio: payload?.bio || "",
        memberSince: payload?.memberSince || null,
        badge: payload?.badge || "",
        travelStyle: payload?.travelStyle || "",
        tripType: payload?.tripType || "",
        paceAndCompany: payload?.paceAndCompany || "",
        activityLevel: normalizedActivity,
        groupPreference: payload?.groupPreference || "",
        dietaryPreferences: payload?.dietaryPreferences || "",
        planningLevel: normalizedPlanning,
        amenities: payload?.amenities || "",
        transport: payload?.transport || "",
        photoPreference: payload?.photoPreference || "",
        accessibility: payload?.accessibility || "",
        additionalNotes: payload?.additionalNotes || "",
        avatarUrl: TOURIST_AVATAR_ASSET,
        coverUrl: TOURIST_COVER_ASSET,
        updatedAt: new Date().toISOString(),
      });
      await syncTouristRelations(currentTouristId, payload?.interests, payload?.languages);
      return response;
    },
    updateSecurity: () => Promise.resolve({ ok: true, status: 200, data: { updated: true } }),
    uploadAvatar: () => Promise.resolve({ ok: true, status: 200, data: { uploaded: false } }),
    uploadCover: () => Promise.resolve({ ok: true, status: 200, data: { uploaded: false } }),
  };

  const help = {
    async getFaq() {
      const [categories, items] = await Promise.all([api.get("/faq_categories"), api.get("/faq_items")]);
      return { ok: true, status: 200, data: { categories: unwrap(categories), items: unwrap(items) } };
    },
    sendTicket(payload) {
      return api.post("/support_tickets", {
        userId: touristId(),
        roleContext: "TOURIST",
        fullName: payload?.fullName || "",
        email: payload?.email || "",
        subject: payload?.subject || "",
        category: payload?.category || "GENERAL",
        message: payload?.message || "",
        status: "OPEN",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
  };

  const notifications = {
    async list(query, value) {
      const currentTouristId = touristId(value);
      const items = unwrap(await api.get("/notifications"))
        .filter((item) => id(item.userId, 0) === currentTouristId)
        .map((item) => ({
          id: item.notificationId,
          title: item.title || item.type || "Notificacion",
          body: item.body || "",
          isRead: Boolean(item.isRead),
          createdAt: item.createdAt,
        }));
      return { ok: true, status: 200, data: { items: page(items, query) } };
    },
    async markAsRead(notificationId) {
      const current = (await api.get(`/notifications/${encodeURIComponent(notificationId)}`))?.data || {};
      return api.put(`/notifications/${encodeURIComponent(notificationId)}`, {
        ...current,
        isRead: true,
        readAt: new Date().toISOString(),
      });
    },
    async markAllAsRead(value) {
      const currentTouristId = touristId(value);
      const items = unwrap(await api.get("/notifications")).filter((item) => id(item.userId, 0) === currentTouristId && !item.isRead);
      await Promise.all(items.map((item) => notifications.markAsRead(item.notificationId)));
      return { ok: true, status: 200, data: { updated: true } };
    },
  };

  const chat = {
    async listThreads(value) {
      const currentTouristId = touristId(value);
      const [threads, users] = await Promise.all([
        unwrap(await api.get("/chat_threads")).filter((item) => id(item.touristId, 0) === currentTouristId),
        usersMap(),
      ]);
      return {
        ok: true,
        status: 200,
        data: {
          items: threads.map((item) => ({
            id: item.threadId,
            threadId: item.threadId,
            guideId: item.guideId,
            touristId: item.touristId,
            tripId: item.tripId,
            title: users.get(id(item.guideId, 0))?.fullName || "Guia",
            lastMessageAt: item.lastMessageAt,
          })),
        },
      };
    },
    async listMessages(threadId, query) {
      const users = await usersMap();
      const items = unwrap(await api.get("/chat_messages"))
        .filter((item) => id(item.threadId, 0) === id(threadId, 0))
        .sort((a, b) => String(a.sentAt || "").localeCompare(String(b.sentAt || "")))
        .map((item) => ({
          id: item.messageId,
          messageId: item.messageId,
          threadId: item.threadId,
          senderUserId: item.senderUserId,
          senderName: users.get(id(item.senderUserId, 0))?.fullName || "Usuario",
          body: item.body,
          sentAt: item.sentAt,
        }));
      return { ok: true, status: 200, data: { items: page(items, query) } };
    },
    sendMessage(threadId, payload) {
      return api.post("/chat_messages", {
        threadId: id(threadId, 0),
        senderUserId: touristId(),
        body: payload?.message || payload?.body || "",
        messageType: "TEXT",
        sentAt: new Date().toISOString(),
      });
    },
  };

  window.KCTouristApi = {
    dashboard,
    explore,
    favorites,
    trips,
    reviews,
    profile,
    help,
    notifications,
    chat,
    messages: {
      async getUnreadCount(value) {
        const threads = unwrap(await chat.listThreads(value));
        return { ok: true, status: 200, data: { count: threads.length } };
      },
    },
  };
})();

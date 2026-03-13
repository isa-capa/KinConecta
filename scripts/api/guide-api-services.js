(function () {
  if (!window.KCApiClient) {
    console.error("KCApiClient is required before guide-api-services.js");
    return;
  }

  const api = window.KCApiClient;
  const GUIDE_AVATAR_ASSET = "../../../assets/users/user_guide.png";
  const GUIDE_COVER_ASSET = "../../../assets/users/user_guide_background.png";
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
      imageClass: "markets",
    },
    {
      match: ["aventur", "sender", "montan", "nature", "naturaleza", "cenote", "ecotur"],
      url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      imageClass: "xochimilco",
    },
    {
      match: ["hist", "cultura", "arque", "architecture", "arquitect", "museo", "centro"],
      url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
      imageClass: "architecture",
    },
    {
      match: ["arte", "art", "street", "mural", "fotografia", "photo"],
      url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
      imageClass: "street-art",
    },
    {
      match: ["playa", "beach", "mar", "coast", "isla"],
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      imageClass: "chapultepec",
    },
    {
      match: ["ciudad", "city", "urban", "walking", "tour"],
      url: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
      imageClass: "active-tour",
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

  const guideId = (value) => id(value ?? window.localStorage.getItem("kc_guide_id"), 1);
  const isoDay = (value) => {
    const parsed = value ? new Date(value) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : "";
  };
  const timeLabel = (value) => {
    const parsed = value ? new Date(value) : null;
    return parsed && !Number.isNaN(parsed.getTime())
      ? parsed.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
      : "";
  };
  const dateLabel = (value, fallback = "") => {
    const parsed = value ? new Date(value) : null;
    return parsed && !Number.isNaN(parsed.getTime())
      ? parsed.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })
      : fallback;
  };
  const tourImagePreset = (...candidates) => {
    const direct = candidates.find((value) => String(value || "").trim());
    const haystack = normalizeLookup(candidates.join(" "));
    const matched = TOUR_IMAGE_BY_CATEGORY.find((entry) =>
      entry.match.some((token) => haystack.includes(token)),
    );
    return {
      imageUrl: direct
        ? String(direct).trim()
        : matched?.url || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80",
      imageClass: matched?.imageClass || "active-tour",
    };
  };

  async function usersMap() {
    return new Map(unwrap(await api.get("/users")).map((item) => [id(item.userId, 0), item]));
  }

  async function toursByGuide(value) {
    const currentGuideId = guideId(value);
    return unwrap(await api.get("/tours")).filter((item) => id(item.guideId, 0) === currentGuideId);
  }

  async function bookingsByGuide(value) {
    const currentGuideId = guideId(value);
    return unwrap(await api.get("/trip_bookings")).filter((item) => id(item.guideId, 0) === currentGuideId);
  }

  async function reviewsByGuide(value) {
    const currentGuideId = guideId(value);
    return unwrap(await api.get("/reviews")).filter((item) => id(item.guideId, 0) === currentGuideId);
  }

  async function buildGuideProfile(value) {
    const currentGuideId = guideId(value);
    const [
      profileRes,
      userRows,
      locationRows,
      adaptationRows,
      certificationRows,
      languageRows,
      profileLanguageRows,
      expertiseRows,
      profileExpertiseRows,
      reviewRows,
    ] = await Promise.all([
      api.get(`/guide_profiles/${encodeURIComponent(currentGuideId)}`),
      usersMap(),
      api.get("/guide_locations"),
      api.get("/guide_adaptations"),
      api.get("/guide_certifications"),
      api.get("/languages"),
      api.get("/guide_profile_languages"),
      api.get("/guide_expertise_areas"),
      api.get("/guide_profile_expertise"),
      reviewsByGuide(currentGuideId),
    ]);

    const base = profileRes?.data || {};
    const user = userRows.get(currentGuideId) || {};
    const languageMap = new Map(unwrap(languageRows).map((item) => [String(item.languageCode), item.name]));
    const expertiseMap = new Map(unwrap(expertiseRows).map((item) => [Number(item.expertiseId), item.name]));
    const average =
      reviewRows.length > 0
        ? reviewRows.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviewRows.length
        : Number(base.ratingAvg || 0);

    return {
      userId: currentGuideId,
      fullName: user.fullName || "",
      summary: base.summary || "",
      story: base.story || "",
      statusText: base.statusText || "",
      hourlyRate: base.hourlyRate || 0,
      currency: base.currency || "MXN",
      rating: average,
      reviewsCount: Number(base.reviewsCount ?? reviewRows.length),
      locationLabel:
        base.locationLabel ||
        unwrap(locationRows)
          .filter((item) => id(item.userId, 0) === currentGuideId)
          .map((item) => item.locationName)
          .join(", "),
      areasExperience: unwrap(profileExpertiseRows)
        .filter((item) => id(item.userId, 0) === currentGuideId)
        .map((item) => expertiseMap.get(Number(item.expertiseId)))
        .filter(Boolean),
      locations: unwrap(locationRows)
        .filter((item) => id(item.userId, 0) === currentGuideId)
        .map((item) => item.locationName)
        .filter(Boolean),
      experienceLevel: base.experienceLevel || "",
      languages: unwrap(profileLanguageRows)
        .filter((item) => id(item.userId, 0) === currentGuideId)
        .map((item) => languageMap.get(String(item.languageCode)) || item.languageCode)
        .filter(Boolean),
      style: base.style || "",
      groupSize: base.groupSize || "",
      tourIntensity: base.tourIntensity || "",
      transportOffered: base.transportOffered || "",
      certifications: unwrap(certificationRows)
        .filter((item) => id(item.userId, 0) === currentGuideId)
        .map((item) => item.name)
        .filter(Boolean),
      adaptations: unwrap(adaptationRows)
        .filter((item) => id(item.userId, 0) === currentGuideId)
        .map((item) => item.name)
        .filter(Boolean),
      photoStyle: base.photoStyle || "",
      additionalNotes: base.additionalNotes || "",
      coverImageUrl: GUIDE_COVER_ASSET,
      avatarUrl: GUIDE_AVATAR_ASSET,
      post: {
        text: base.postText || "",
        image: base.postImageUrl || "",
        caption: base.postCaption || "",
        publishedAt: base.postPublishedAt || "",
      },
      updatedAt: base.updatedAt || user.updatedAt || "",
    };
  }

  async function tourCards(value) {
    const [tourRows, bookingRows, reviewRows, categoryRows, includedRows] = await Promise.all([
      toursByGuide(value),
      bookingsByGuide(value),
      reviewsByGuide(value),
      api.get("/tour_categories"),
      api.get("/tour_included_items"),
    ]);
    const categories = new Map(unwrap(categoryRows).map((item) => [Number(item.categoryId), item.name]));
    const includedMap = new Map();
    unwrap(includedRows).forEach((item) => {
      const key = id(item.tourId, 0);
      const bucket = includedMap.get(key) || [];
      bucket.push(item);
      includedMap.set(key, bucket);
    });

    return tourRows.map((tour) => {
      const tourId = id(tour.tourId, 0);
      const itemReviews = reviewRows.filter((item) => id(item.tourId, 0) === tourId);
      const imagePreset = tourImagePreset(
        tour.coverImageUrl,
        categories.get(Number(tour.categoryId)) || "",
        tour.title,
        tour.description,
        tour.meetingPoint,
      );
      return {
        id: tour.tourId,
        tourId: tour.tourId,
        guideId: tour.guideId,
        title: tour.title || "Tour",
        description: tour.description || "",
        price: Number(tour.price || 0),
        currency: tour.currency || "MXN",
        duration: Number(tour.durationHours || 0),
        durationHours: Number(tour.durationHours || 0),
        maxGroupSize: Number(tour.maxGroupSize || 0),
        meetingPoint: tour.meetingPoint || "",
        status: String(tour.status || "DRAFT").toLowerCase(),
        imageClass: tour.imageClass || imagePreset.imageClass,
        imageUrl: imagePreset.imageUrl,
        coverImageUrl: imagePreset.imageUrl,
        rating:
          itemReviews.length > 0
            ? itemReviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / itemReviews.length
            : Number(tour.ratingAvg || 0),
        bookings: bookingRows.filter((item) => id(item.tourId, 0) === tourId).length,
        category: categories.get(Number(tour.categoryId)) || "",
        categoryId: tour.categoryId,
        includedItems: (includedMap.get(tourId) || [])
          .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
          .map((item) => item.itemText),
      };
    });
  }

  async function categoryIdByName(name) {
    const normalized = normalizeLookup(name);
    if (!normalized) return null;
    const categories = unwrap(await api.get("/tour_categories"));
    const found =
      categories.find((item) => normalizeLookup(item.name) === normalized) ||
      categories.find((item) => normalizeLookup(item.name).includes(normalized)) ||
      categories.find((item) => normalized.includes(normalLookup(item.name)));
    return found ? Number(found.categoryId) : null;
  }

  async function syncIncludedItems(tourId, items) {
    const rows = unwrap(await api.get("/tour_included_items")).filter((item) => id(item.tourId, 0) === id(tourId, 0));
    await Promise.all(rows.map((item) => api.delete(`/tour_included_items/${encodeURIComponent(item.itemId)}`)));
    await Promise.all(
      (Array.isArray(items) ? items : []).map((itemText, index) =>
        api.post("/tour_included_items", {
          tourId: id(tourId, 0),
          itemText,
          sortOrder: index + 1,
        })),
    );
  }

  async function threadRows(value) {
    const currentGuideId = guideId(value);
    return unwrap(await api.get("/chat_threads")).filter((item) => id(item.guideId, 0) === currentGuideId);
  }

  const dashboard = {
    async getSummary(value) {
      const currentGuideId = guideId(value);
      const [profile, bookings, transactionsRes, threads] = await Promise.all([
        buildGuideProfile(currentGuideId),
        bookingsByGuide(currentGuideId),
        api.get("/income_transactions"),
        threadRows(currentGuideId),
      ]);
      const income = unwrap(transactionsRes)
        .filter((item) => id(item.userId, 0) === currentGuideId && String(item.sign || "").toUpperCase() !== "NEGATIVE")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      return {
        ok: true,
        status: 200,
        data: {
          guideName: profile.fullName,
          unreadMessages: threads.length,
          averageRating: Number(profile.rating || 0),
          completedTours: bookings.filter((item) => String(item.status || "").toUpperCase() === "COMPLETED").length,
          monthlyIncomeMXN: income,
          ratingDeltaLabel: "Backend real",
          completedToursDeltaLabel: "Reservas reales",
          monthlyIncomeDeltaLabel: "Transacciones reales",
        },
      };
    },
    async getTodaySchedule(value) {
      const currentGuideId = guideId(value);
      const [bookings, tours, users] = await Promise.all([bookingsByGuide(currentGuideId), toursByGuide(currentGuideId), usersMap()]);
      const tourMap = new Map(tours.map((item) => [id(item.tourId, 0), item]));
      const today = new Date().toISOString().slice(0, 10);
      const items = bookings
        .filter((item) => isoDay(item.startDatetime) === today)
        .map((item) => ({
          id: item.tripId,
          status: new Date(item.startDatetime) <= new Date() ? "in_progress" : "upcoming",
          start: timeLabel(item.startDatetime),
          end: timeLabel(item.endDatetime),
          title: tourMap.get(id(item.tourId, 0))?.title || "Tour",
          guests: 1,
          organizer: users.get(id(item.touristId, 0))?.fullName || "Turista",
        }));
      return { ok: true, status: 200, data: items };
    },
    async getReservationsTrend(range, value) {
      const months = String(range || "6m") === "12m" ? 12 : 6;
      const bookings = await bookingsByGuide(value);
      const now = new Date();
      const points = [];
      for (let index = months - 1; index >= 0; index -= 1) {
        const cursor = new Date(now.getFullYear(), now.getMonth() - index, 1);
        const total = bookings.filter((item) => {
          const parsed = item.startDatetime ? new Date(item.startDatetime) : null;
          return (
            parsed &&
            !Number.isNaN(parsed.getTime()) &&
            parsed.getFullYear() === cursor.getFullYear() &&
            parsed.getMonth() === cursor.getMonth()
          );
        }).length;
        const label = cursor.toLocaleDateString("es-MX", { month: "short" });
        points.push({ label: label.charAt(0).toUpperCase() + label.slice(1, 3), value: total, highlight: index === 0 });
      }
      return { ok: true, status: 200, data: { points } };
    },
    async getPopularTours(value) {
      const items = (await tourCards(value)).sort((a, b) => b.bookings - a.bookings);
      return { ok: true, status: 200, data: items };
    },
    async getSpotlightTours(value) {
      return { ok: true, status: 200, data: (await tourCards(value)).slice(0, 2) };
    },
  };

  const tours = {
    listCategories: () => api.get("/tour_categories"),
    async listByGuide(value, filters) {
      let items = await tourCards(value);
      if (filters?.status) {
        items = items.filter((item) => String(item.status) === String(filters.status).toLowerCase());
      }
      return { ok: true, status: 200, data: page(items, filters) };
    },
    async create(value, payload) {
      const imagePreset = tourImagePreset(
        payload?.coverImageUrl,
        payload?.category,
        payload?.title,
        payload?.description,
        payload?.meetingPoint,
      );
      const response = await api.post("/tours", {
        guideId: guideId(value),
        categoryId: await categoryIdByName(payload?.category),
        title: payload?.title,
        description: payload?.description,
        price: Number(payload?.price || 0),
        currency: payload?.currency || "MXN",
        durationHours: Number(payload?.duration || payload?.durationHours || 0),
        maxGroupSize: Number(payload?.maxGroupSize || 0),
        meetingPoint: payload?.meetingPoint || "",
        status: String(payload?.status || "DRAFT").toUpperCase(),
        coverImageUrl: imagePreset.imageUrl,
        imageClass: payload?.imageClass || imagePreset.imageClass,
        ratingAvg: 0,
        bookingsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      const created = response?.data || {};
      if (created?.tourId && Array.isArray(payload?.includedItems)) {
        await syncIncludedItems(created.tourId, payload.includedItems);
      }
      return response;
    },
    async update(value, tourId, payload) {
      const current = (await api.get(`/tours/${encodeURIComponent(tourId)}`))?.data || {};
      const imagePreset = tourImagePreset(
        payload?.coverImageUrl ?? current.coverImageUrl,
        payload?.category || current.categoryName || current.categoryId,
        payload?.title ?? current.title,
        payload?.description ?? current.description,
        payload?.meetingPoint ?? current.meetingPoint,
      );
      const response = await api.put(`/tours/${encodeURIComponent(tourId)}`, {
        guideId: current.guideId || guideId(value),
        categoryId: payload?.category ? await categoryIdByName(payload.category) : current.categoryId,
        title: payload?.title ?? current.title,
        description: payload?.description ?? current.description,
        price: payload?.price ?? current.price,
        currency: payload?.currency ?? current.currency,
        durationHours: payload?.duration ?? payload?.durationHours ?? current.durationHours,
        maxGroupSize: payload?.maxGroupSize ?? current.maxGroupSize,
        meetingPoint: payload?.meetingPoint ?? current.meetingPoint,
        status: String(payload?.status || current.status || "DRAFT").toUpperCase(),
        coverImageUrl: imagePreset.imageUrl,
        imageClass: payload?.imageClass ?? current.imageClass ?? imagePreset.imageClass,
        ratingAvg: current.ratingAvg ?? 0,
        bookingsCount: current.bookingsCount ?? 0,
        createdAt: current.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      if (Array.isArray(payload?.includedItems)) {
        await syncIncludedItems(tourId, payload.includedItems);
      }
      return response;
    },
    remove: (_value, tourId) => api.delete(`/tours/${encodeURIComponent(tourId)}`),
    publish: (value, tourId) => tours.update(value, tourId, { status: "ACTIVE" }),
  };

  const calendar = {
    async getEventsByRange(value, range) {
      const currentGuideId = guideId(value);
      const [eventRows, bookingRows, tours] = await Promise.all([api.get("/guide_calendar_events"), bookingsByGuide(currentGuideId), toursByGuide(currentGuideId)]);
      const start = range?.start ? new Date(range.start) : null;
      const end = range?.end ? new Date(range.end) : null;
      const tourMap = new Map(tours.map((item) => [id(item.tourId, 0), item]));
      const items = [];

      unwrap(eventRows)
        .filter((item) => id(item.userId, 0) === currentGuideId)
        .forEach((item) => {
          const rawStart = item.startDatetime || item.startDateTime || item.startDate || item.start;
          const parsed = rawStart ? new Date(rawStart) : null;
          if (parsed && !Number.isNaN(parsed.getTime())) {
            if (start && parsed < start) return;
            if (end && parsed > end) return;
          }
          items.push({
            id: item.eventId || item.guideCalendarEventId,
            title: item.title || item.name || "Bloqueo",
            start: rawStart,
            end: item.endDatetime || item.endDateTime || item.endDate || item.end,
            startDate: isoDay(rawStart),
            source: "manual",
          });
        });

      bookingRows.forEach((item) => {
        const parsed = item.startDatetime ? new Date(item.startDatetime) : null;
        if (parsed && !Number.isNaN(parsed.getTime())) {
          if (start && parsed < start) return;
          if (end && parsed > end) return;
        }
        items.push({
          id: `booking_${item.tripId}`,
          title: tourMap.get(id(item.tourId, 0))?.title || "Reserva",
          start: item.startDatetime,
          end: item.endDatetime,
          startDate: isoDay(item.startDatetime),
          source: "booking",
        });
      });

      return { ok: true, status: 200, data: items };
    },
    createBlock(value, payload) {
      return api.post("/guide_calendar_events", {
        userId: guideId(value),
        title: payload?.title || "Bloqueo manual",
        startDatetime: payload?.start || payload?.startDatetime || payload?.startDate,
        endDatetime: payload?.end || payload?.endDatetime || payload?.endDate,
        eventType: payload?.eventType || "BLOCK",
        status: payload?.status || "CONFIRMED",
        source: payload?.source || "MANUAL",
      });
    },
    removeBlock: (_value, blockId) => api.delete(`/guide_calendar_events/${encodeURIComponent(blockId)}`),
    syncGoogle: () => Promise.resolve({ ok: true, status: 200, data: { connected: false } }),
    getGoogleStatus: () => Promise.resolve({ ok: true, status: 200, data: { connected: false } }),
    getGoogleOAuthUrl: () => Promise.resolve({ ok: true, status: 200, data: { url: "" } }),
    exchangeGoogleOAuthCode: () => Promise.resolve({ ok: true, status: 200, data: { connected: false } }),
    disconnectGoogle: () => Promise.resolve({ ok: true, status: 200, data: { connected: false } }),
  };

  const incomes = {
    async getKpis(value) {
      const currentGuideId = guideId(value);
      const [transactionsRes, withdrawalsRes] = await Promise.all([api.get("/income_transactions"), api.get("/withdrawal_requests")]);
      const transactions = unwrap(transactionsRes).filter((item) => id(item.userId, 0) === currentGuideId);
      const withdrawals = unwrap(withdrawalsRes).filter((item) => id(item.userId, 0) === currentGuideId);
      return {
        ok: true,
        status: 200,
        data: {
          monthlyIncome: transactions
            .filter((item) => String(item.sign || "").toUpperCase() !== "NEGATIVE")
            .reduce((sum, item) => sum + Number(item.amount || 0), 0),
          monthlyIncomeDelta: "Backend real",
          pendingPayouts: withdrawals
            .filter((item) => String(item.status || "").toUpperCase() !== "COMPLETED")
            .reduce((sum, item) => sum + Number(item.amount || 0), 0),
          totalWithdrawn: withdrawals
            .filter((item) => String(item.status || "").toUpperCase() === "COMPLETED")
            .reduce((sum, item) => sum + Number(item.amount || 0), 0),
        },
      };
    },
    async getChart(value) {
      const currentGuideId = guideId(value);
      const rows = unwrap(await api.get("/income_transactions")).filter((item) => id(item.userId, 0) === currentGuideId);
      const now = new Date();
      const points = [];
      for (let index = 5; index >= 0; index -= 1) {
        const cursor = new Date(now.getFullYear(), now.getMonth() - index, 1);
        const total = rows.reduce((sum, item) => {
          const parsed = item.createdAt ? new Date(item.createdAt) : null;
          if (!parsed || Number.isNaN(parsed.getTime())) return sum;
          if (parsed.getFullYear() !== cursor.getFullYear() || parsed.getMonth() !== cursor.getMonth()) return sum;
          return sum + Number(item.amount || 0);
        }, 0);
        points.push({
          label: cursor.toLocaleDateString("es-MX", { month: "short" }).slice(0, 3),
          value: Math.round(total / 1000),
          active: index === 0,
        });
      }
      return { ok: true, status: 200, data: { points } };
    },
    async getTransactions(value, filters) {
      const currentGuideId = guideId(value);
      const items = unwrap(await api.get("/income_transactions"))
        .filter((item) => id(item.userId, 0) === currentGuideId)
        .map((item) => ({
          id: item.transactionId || item.incomeTransactionId,
          name: item.referenceLabel || item.txnType || "Transaccion",
          details: item.description || item.reference || "Movimiento registrado en backend",
          dateLabel: dateLabel(item.createdAt, "Sin fecha"),
          typeLabel: item.txnType || item.type || "Movimiento",
          statusLabel: item.status || "PENDING",
          amountLabel: `${String(item.sign || "").toUpperCase() === "NEGATIVE" ? "- " : ""}MXN ${Number(item.amount || 0).toFixed(2)}`,
          icon: "payments",
          iconClass: String(item.sign || "").toUpperCase() === "NEGATIVE" ? "green" : "orange",
        }));
      return { ok: true, status: 200, data: { items: page(items, filters) } };
    },
    requestWithdraw(value, payload) {
      return api.post("/withdrawal_requests", {
        userId: guideId(value),
        amount: Number(payload?.amount || 0),
        status: payload?.status || "PENDING",
        requestedAt: new Date().toISOString(),
      });
    },
    exportReport: (value, filters) => incomes.getTransactions(value, filters),
  };

  const reviews = {
    async getOverview(value) {
      const items = await reviewsByGuide(value);
      const average = items.length ? items.reduce((sum, item) => sum + Number(item.rating || 0), 0) / items.length : 0;
      return {
        ok: true,
        status: 200,
        data: {
          totalReviews: items.length,
          averageRating: average,
          fiveStarRateLabel: items.length ? `${Math.round((items.filter((item) => Number(item.rating || 0) === 5).length / items.length) * 100)}%` : "0%",
          thisMonthCount: items.filter((item) => isoDay(item.createdAt).slice(0, 7) === new Date().toISOString().slice(0, 7)).length,
        },
      };
    },
    async list(value, filters) {
      const currentGuideId = guideId(value);
      const [items, tours, users, repliesRes] = await Promise.all([reviewsByGuide(currentGuideId), toursByGuide(currentGuideId), usersMap(), api.get("/review_replies")]);
      const tourMap = new Map(tours.map((item) => [id(item.tourId, 0), item]));
      const replySet = new Set(unwrap(repliesRes).map((item) => id(item.reviewId, 0)));
      return {
        ok: true,
        status: 200,
        data: {
          items: page(
            items.map((item) => ({
              id: item.reviewId,
              author: users.get(id(item.touristId, 0))?.fullName || "Turista",
              tourName: tourMap.get(id(item.tourId, 0))?.title || "Tour",
              dateLabel: dateLabel(item.createdAt, "Reciente"),
              rating: Number(item.rating || 0),
              comment: item.comment || "",
              replied: replySet.has(id(item.reviewId, 0)),
            })),
            filters,
          ),
        },
      };
    },
    async reply(value, reviewId, payload) {
      const currentGuideId = guideId(value);
      const existing = unwrap(await api.get("/review_replies")).find((item) => id(item.reviewId, 0) === id(reviewId, 0));
      if (existing?.replyId) {
        return api.put(`/review_replies/${encodeURIComponent(existing.replyId)}`, {
          ...existing,
          message: payload?.message || "",
          updatedAt: new Date().toISOString(),
        });
      }
      return api.post("/review_replies", {
        reviewId: id(reviewId, 0),
        guideId: currentGuideId,
        message: payload?.message || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
  };

  const profile = {
    getSettings: (value) => profile.getPublicProfile(value),
    async updateSettings(value, payload) {
      const currentGuideId = guideId(value);
      const current = await buildGuideProfile(currentGuideId);
      return api.put(`/guide_profiles/${encodeURIComponent(currentGuideId)}`, {
        summary: payload?.summary ?? current.summary,
        story: payload?.story ?? current.story,
        statusText: payload?.statusText ?? current.statusText,
        hourlyRate: payload?.hourlyRate ?? current.hourlyRate ?? 0,
        currency: payload?.currency ?? current.currency ?? "MXN",
        ratingAvg: payload?.ratingAvg ?? current.rating ?? 0,
        reviewsCount: payload?.reviewsCount ?? current.reviewsCount ?? 0,
        locationLabel: payload?.locationLabel ?? current.locationLabel,
        experienceLevel: payload?.experienceLevel ?? current.experienceLevel,
        style: payload?.style ?? current.style,
        groupSize: payload?.groupSize ?? current.groupSize,
        tourIntensity: payload?.tourIntensity ?? current.tourIntensity,
        transportOffered: payload?.transportOffered ?? current.transportOffered,
        photoStyle: payload?.photoStyle ?? current.photoStyle,
        additionalNotes: payload?.additionalNotes ?? current.additionalNotes,
        avatarUrl: payload?.avatarUrl ?? current.avatarUrl,
        coverUrl: payload?.coverImage ?? payload?.coverUrl ?? current.coverImageUrl,
        postText: payload?.postText ?? current.post?.text ?? "",
        postImageUrl: payload?.postImageUrl ?? current.post?.image ?? "",
        postCaption: payload?.postCaption ?? current.post?.caption ?? "",
        postPublishedAt: payload?.postPublishedAt ?? current.post?.publishedAt ?? null,
        updatedAt: new Date().toISOString(),
      });
    },
    updateSecurity: () => Promise.resolve({ ok: true, status: 200, data: { updated: true } }),
    async getPublicProfile(value) {
      return { ok: true, status: 200, data: await buildGuideProfile(value) };
    },
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
        userId: guideId(),
        roleContext: "GUIDE",
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
    async list(value) {
      const currentGuideId = guideId(value);
      const items = unwrap(await api.get("/notifications"))
        .filter((item) => id(item.userId, 0) === currentGuideId)
        .map((item) => ({
          id: item.notificationId,
          title: item.title || item.type || "Notificacion",
          body: item.body || "",
          isRead: Boolean(item.isRead),
          createdAt: item.createdAt,
        }));
      return { ok: true, status: 200, data: { items } };
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
      const currentGuideId = guideId(value);
      const items = unwrap(await api.get("/notifications")).filter((item) => id(item.userId, 0) === currentGuideId && !item.isRead);
      await Promise.all(items.map((item) => notifications.markAsRead(item.notificationId)));
      return { ok: true, status: 200, data: { updated: true } };
    },
  };

  const chat = {
    async listThreads(value) {
      const currentGuideId = guideId(value);
      const [threads, users] = await Promise.all([threadRows(currentGuideId), usersMap()]);
      return {
        ok: true,
        status: 200,
        data: {
          items: threads.map((item) => ({
            id: item.threadId,
            threadId: item.threadId,
            touristId: item.touristId,
            guideId: item.guideId,
            tripId: item.tripId,
            title: users.get(id(item.touristId, 0))?.fullName || "Turista",
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
        senderUserId: guideId(),
        body: payload?.message || payload?.body || "",
        messageType: "TEXT",
        sentAt: new Date().toISOString(),
      });
    },
  };

  window.KCGuideApi = {
    dashboard,
    tours,
    calendar,
    incomes,
    reviews,
    profile,
    help,
    notifications,
    chat,
  };
})();

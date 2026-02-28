(function () {
  if (!window.KCApiClient) {
    console.error("KCApiClient is required before tourist-api-services.js");
    return;
  }

  const api = window.KCApiClient;

  /**
   * TODO(BACKEND): Replace all endpoint paths with final Spring Boot routes.
   * TODO(BACKEND): Align DTO contracts and enums with backend.
   * TODO(BACKEND): Add pagination and server-side filters where needed.
   */
  const endpoints = {
    dashboard: {
      summary: "/tourist/dashboard/summary",
      nextTrip: "/tourist/dashboard/next-trip",
      recommendedGuides: "/tourist/dashboard/guides/recommended",
      destinations: "/tourist/dashboard/destinations/popular",
      savedGuides: "/tourist/dashboard/guides/saved",
    },
    explore: {
      experiences: "/tourist/explore/experiences",
      guides: "/tourist/explore/guides",
      categories: "/tourist/explore/categories",
      toggleFavorite: "/tourist/explore/favorites/{itemId}/toggle",
    },
    favorites: {
      listGuides: "/tourist/favorites/guides",
      listExperiences: "/tourist/favorites/experiences",
      removeGuide: "/tourist/favorites/guides/{guideId}",
      removeExperience: "/tourist/favorites/experiences/{experienceId}",
    },
    trips: {
      list: "/tourist/trips",
      detail: "/tourist/trips/{tripId}",
      create: "/tourist/trips",
      update: "/tourist/trips/{tripId}",
      cancel: "/tourist/trips/{tripId}/cancel",
    },
    reviews: {
      summary: "/tourist/reviews/summary",
      list: "/tourist/reviews",
      create: "/tourist/reviews",
      update: "/tourist/reviews/{reviewId}",
      remove: "/tourist/reviews/{reviewId}",
    },
    profile: {
      me: "/tourist/profile/me",
      update: "/tourist/profile/me",
      updateSecurity: "/tourist/profile/me/security",
      uploadAvatar: "/tourist/profile/me/avatar",
      uploadCover: "/tourist/profile/me/cover",
    },
    help: {
      faq: "/support/faq",
      sendTicket: "/support/tickets",
    },
    notifications: {
      list: "/tourist/notifications",
      markAsRead: "/tourist/notifications/{notificationId}/read",
      markAllAsRead: "/tourist/notifications/read-all",
    },
    messages: {
      unreadCount: "/tourist/messages/unread-count",
    },
  };

  function path(template, params) {
    const payload = params || {};
    return template.replace(/\{(\w+)\}/g, (_, key) => encodeURIComponent(payload[key] ?? ""));
  }

  function withQuery(basePath, query) {
    if (!query || typeof query !== "object") return basePath;
    const search = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      search.append(key, String(value));
    });
    const raw = search.toString();
    return raw ? `${basePath}?${raw}` : basePath;
  }

  const dashboard = {
    getSummary: () => api.get(endpoints.dashboard.summary),
    getNextTrip: () => api.get(endpoints.dashboard.nextTrip),
    getRecommendedGuides: (query) =>
      api.get(withQuery(endpoints.dashboard.recommendedGuides, query)),
    getPopularDestinations: (query) =>
      api.get(withQuery(endpoints.dashboard.destinations, query)),
    getSavedGuides: (query) =>
      api.get(withQuery(endpoints.dashboard.savedGuides, query)),
  };

  const explore = {
    listExperiences: (query) =>
      api.get(withQuery(endpoints.explore.experiences, query)),
    listGuides: (query) =>
      api.get(withQuery(endpoints.explore.guides, query)),
    listCategories: () => api.get(endpoints.explore.categories),
    toggleFavorite: (itemId) =>
      api.post(path(endpoints.explore.toggleFavorite, { itemId })),
  };

  const favorites = {
    listGuides: (query) =>
      api.get(withQuery(endpoints.favorites.listGuides, query)),
    listExperiences: (query) =>
      api.get(withQuery(endpoints.favorites.listExperiences, query)),
    removeGuide: (guideId) =>
      api.delete(path(endpoints.favorites.removeGuide, { guideId })),
    removeExperience: (experienceId) =>
      api.delete(path(endpoints.favorites.removeExperience, { experienceId })),
  };

  const trips = {
    list: (query) => api.get(withQuery(endpoints.trips.list, query)),
    detail: (tripId) => api.get(path(endpoints.trips.detail, { tripId })),
    create: (payload) => api.post(endpoints.trips.create, payload),
    update: (tripId, payload) =>
      api.put(path(endpoints.trips.update, { tripId }), payload),
    cancel: (tripId, payload) =>
      api.post(path(endpoints.trips.cancel, { tripId }), payload || {}),
  };

  const reviews = {
    getSummary: () => api.get(endpoints.reviews.summary),
    list: (query) => api.get(withQuery(endpoints.reviews.list, query)),
    create: (payload) => api.post(endpoints.reviews.create, payload),
    update: (reviewId, payload) =>
      api.put(path(endpoints.reviews.update, { reviewId }), payload),
    remove: (reviewId) =>
      api.delete(path(endpoints.reviews.remove, { reviewId })),
  };

  const profile = {
    getMe: () => api.get(endpoints.profile.me),
    updateMe: (payload) => api.put(endpoints.profile.update, payload),
    updateSecurity: (payload) => api.put(endpoints.profile.updateSecurity, payload),
    uploadAvatar: (formData) =>
      api.post(endpoints.profile.uploadAvatar, formData, { headers: {} }),
    uploadCover: (formData) =>
      api.post(endpoints.profile.uploadCover, formData, { headers: {} }),
  };

  const help = {
    getFaq: () => api.get(endpoints.help.faq),
    sendTicket: (payload) => api.post(endpoints.help.sendTicket, payload),
  };

  const notifications = {
    list: (query) =>
      api.get(withQuery(endpoints.notifications.list, query)),
    markAsRead: (notificationId) =>
      api.patch(path(endpoints.notifications.markAsRead, { notificationId }), {}),
    markAllAsRead: () => api.patch(endpoints.notifications.markAllAsRead, {}),
  };

  const messages = {
    getUnreadCount: () => api.get(endpoints.messages.unreadCount),
  };

  window.KCTouristApi = {
    endpoints,
    dashboard,
    explore,
    favorites,
    trips,
    reviews,
    profile,
    help,
    notifications,
    messages,
  };
})();

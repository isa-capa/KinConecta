(function () {
  if (!window.KCApiClient) {
    console.error("KCApiClient is required before guide-api-services.js");
    return;
  }

  const api = window.KCApiClient;

  /**
   * TODO(BACKEND): Replace all endpoint paths with the final Spring Boot routes.
   * TODO(BACKEND): Normalize DTO contracts between front and backend.
   * TODO(BACKEND): Add pagination, sorting and filters where needed.
   */
  const endpoints = {
    dashboard: {
      summary: "/guide/dashboard/summary",
      scheduleToday: "/guide/dashboard/schedule/today",
      reservationsTrend: "/guide/dashboard/reservations/trend",
      popularTours: "/guide/dashboard/tours/popular",
      spotlightTours: "/guide/dashboard/tours/spotlight",
    },
    tours: {
      listByGuide: "/guides/{guideId}/tours",
      create: "/guides/{guideId}/tours",
      update: "/guides/{guideId}/tours/{tourId}",
      remove: "/guides/{guideId}/tours/{tourId}",
      publish: "/guides/{guideId}/tours/{tourId}/publish",
    },
    calendar: {
      eventsByRange: "/guides/{guideId}/calendar/events",
      createBlock: "/guides/{guideId}/calendar/blocks",
      removeBlock: "/guides/{guideId}/calendar/blocks/{blockId}",
      syncGoogle: "/guides/{guideId}/calendar/google/sync",
      googleStatus: "/guides/{guideId}/calendar/google/status",
      googleOAuthUrl: "/guides/{guideId}/calendar/google/oauth/url",
      googleOAuthExchange: "/guides/{guideId}/calendar/google/oauth/exchange",
      googleDisconnect: "/guides/{guideId}/calendar/google/disconnect",
    },
    incomes: {
      kpis: "/guides/{guideId}/incomes/kpis",
      chart: "/guides/{guideId}/incomes/chart",
      transactions: "/guides/{guideId}/incomes/transactions",
      withdraw: "/guides/{guideId}/incomes/withdraw",
      export: "/guides/{guideId}/incomes/export",
    },
    reviews: {
      overview: "/guides/{guideId}/reviews/overview",
      list: "/guides/{guideId}/reviews",
      reply: "/guides/{guideId}/reviews/{reviewId}/reply",
    },
    profile: {
      settings: "/guides/{guideId}/profile/settings",
      updateSettings: "/guides/{guideId}/profile/settings",
      updateSecurity: "/guide/profile/security",
      publicProfile: "/guides/{guideId}/profile/public",
      uploadAvatar: "/guides/{guideId}/profile/avatar",
    },
    help: {
      faq: "/support/faq",
      sendTicket: "/support/tickets",
    },
    notifications: {
      list: "/guide/notifications",
      markAsRead: "/guide/notifications/{notificationId}/read",
      markAllAsRead: "/guide/notifications/read-all",
    },
    chat: {
      threads: "/guide/chat/threads",
      messages: "/guide/chat/threads/{threadId}/messages",
      sendMessage: "/guide/chat/threads/{threadId}/messages",
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
    getTodaySchedule: () => api.get(endpoints.dashboard.scheduleToday),
    getReservationsTrend: (range) =>
      api.get(withQuery(endpoints.dashboard.reservationsTrend, { range })),
    getPopularTours: () => api.get(endpoints.dashboard.popularTours),
    getSpotlightTours: () => api.get(endpoints.dashboard.spotlightTours),
  };

  const tours = {
    listByGuide: (guideId, filters) =>
      api.get(withQuery(path(endpoints.tours.listByGuide, { guideId }), filters)),
    create: (guideId, payload) => api.post(path(endpoints.tours.create, { guideId }), payload),
    update: (guideId, tourId, payload) =>
      api.put(path(endpoints.tours.update, { guideId, tourId }), payload),
    remove: (guideId, tourId) =>
      api.delete(path(endpoints.tours.remove, { guideId, tourId })),
    publish: (guideId, tourId) =>
      api.post(path(endpoints.tours.publish, { guideId, tourId })),
  };

  const calendar = {
    getEventsByRange: (guideId, range) =>
      api.get(withQuery(path(endpoints.calendar.eventsByRange, { guideId }), range)),
    createBlock: (guideId, payload) =>
      api.post(path(endpoints.calendar.createBlock, { guideId }), payload),
    removeBlock: (guideId, blockId) =>
      api.delete(path(endpoints.calendar.removeBlock, { guideId, blockId })),
    syncGoogle: (guideId, payload) =>
      api.post(path(endpoints.calendar.syncGoogle, { guideId }), payload || {}),
    getGoogleStatus: (guideId) =>
      api.get(path(endpoints.calendar.googleStatus, { guideId })),
    getGoogleOAuthUrl: (guideId, payload) =>
      api.post(path(endpoints.calendar.googleOAuthUrl, { guideId }), payload || {}),
    exchangeGoogleOAuthCode: (guideId, payload) =>
      api.post(path(endpoints.calendar.googleOAuthExchange, { guideId }), payload || {}),
    disconnectGoogle: (guideId) =>
      api.post(path(endpoints.calendar.googleDisconnect, { guideId }), {}),
  };

  const incomes = {
    getKpis: (guideId) => api.get(path(endpoints.incomes.kpis, { guideId })),
    getChart: (guideId, range) =>
      api.get(withQuery(path(endpoints.incomes.chart, { guideId }), { range })),
    getTransactions: (guideId, filters) =>
      api.get(withQuery(path(endpoints.incomes.transactions, { guideId }), filters)),
    requestWithdraw: (guideId, payload) =>
      api.post(path(endpoints.incomes.withdraw, { guideId }), payload),
    exportReport: (guideId, filters) =>
      api.get(withQuery(path(endpoints.incomes.export, { guideId }), filters)),
  };

  const reviews = {
    getOverview: (guideId) => api.get(path(endpoints.reviews.overview, { guideId })),
    list: (guideId, filters) =>
      api.get(withQuery(path(endpoints.reviews.list, { guideId }), filters)),
    reply: (guideId, reviewId, payload) =>
      api.post(path(endpoints.reviews.reply, { guideId, reviewId }), payload),
  };

  const profile = {
    getSettings: (guideId) => api.get(path(endpoints.profile.settings, { guideId })),
    updateSettings: (guideId, payload) =>
      api.put(path(endpoints.profile.updateSettings, { guideId }), payload),
    updateSecurity: (payload) => api.put(endpoints.profile.updateSecurity, payload),
    getPublicProfile: (guideId) =>
      api.get(path(endpoints.profile.publicProfile, { guideId })),
    uploadAvatar: (guideId, formData) =>
      api.post(path(endpoints.profile.uploadAvatar, { guideId }), formData, {
        headers: {},
      }),
  };

  const help = {
    getFaq: () => api.get(endpoints.help.faq),
    sendTicket: (payload) => api.post(endpoints.help.sendTicket, payload),
  };

  const notifications = {
    list: () => api.get(endpoints.notifications.list),
    markAsRead: (notificationId) =>
      api.patch(path(endpoints.notifications.markAsRead, { notificationId }), {}),
    markAllAsRead: () => api.patch(endpoints.notifications.markAllAsRead, {}),
  };

  const chat = {
    listThreads: () => api.get(endpoints.chat.threads),
    listMessages: (threadId, query) =>
      api.get(withQuery(path(endpoints.chat.messages, { threadId }), query)),
    sendMessage: (threadId, payload) =>
      api.post(path(endpoints.chat.sendMessage, { threadId }), payload),
  };

  window.KCGuideApi = {
    endpoints,
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

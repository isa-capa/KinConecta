(function () {
  if (!window.KCApiClient) return;

  const api = window.KCApiClient;

  const supportService = {
    getFaqCategories: () => api.get("/faq_categories"),
    getFaqItems: () => api.get("/faq_items"),
    getNotifications: () => api.get("/notifications"),
    updateNotification: (notificationId, payload) =>
      api.put(`/notifications/${encodeURIComponent(notificationId)}`, payload),
    getChatThreads: () => api.get("/chat_threads"),
    createChatThread: (payload) => api.post("/chat_threads", payload),
    getChatMessages: () => api.get("/chat_messages"),
    createChatMessage: (payload) => api.post("/chat_messages", payload),
    getFavoriteGuides: () => api.get("/favorite_guides"),
    createFavoriteGuide: (payload) => api.post("/favorite_guides", payload),
    deleteFavoriteGuide: (touristId, guideId) =>
      api.delete(`/favorite_guides/${encodeURIComponent(touristId)}/${encodeURIComponent(guideId)}`),
    getFavoriteTours: () => api.get("/favorite_tours"),
    createFavoriteTour: (payload) => api.post("/favorite_tours", payload),
    deleteFavoriteTour: (touristId, tourId) =>
      api.delete(`/favorite_tours/${encodeURIComponent(touristId)}/${encodeURIComponent(tourId)}`),
    createSupportTicket: (payload) => api.post("/support_tickets", payload),
    createContactMessage: (payload) => api.post("/contact_messages", payload),
    createNewsletterSubscription: (payload) => api.post("/newsletter_subscriptions", payload),
  };

  window.KCSupportService = supportService;
})();

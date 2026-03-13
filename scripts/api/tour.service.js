(function () {
  if (!window.KCApiClient) return;

  const api = window.KCApiClient;

  const tourService = {
    getTours: () => api.get("/tours"),
    getTourById: (tourId) => api.get(`/tours/${encodeURIComponent(tourId)}`),
    createTour: (payload) => api.post("/tours", payload),
    updateTour: (tourId, payload) => api.put(`/tours/${encodeURIComponent(tourId)}`, payload),
    deleteTour: (tourId) => api.delete(`/tours/${encodeURIComponent(tourId)}`),
    getTourCategories: () => api.get("/tour_categories"),
    getDestinations: () => api.get("/destinations"),
    getTourDestinations: () => api.get("/tour_destinations"),
    getTourIncludedItems: () => api.get("/tour_included_items"),
    createTourIncludedItem: (payload) => api.post("/tour_included_items", payload),
    updateTourIncludedItem: (itemId, payload) =>
      api.put(`/tour_included_items/${encodeURIComponent(itemId)}`, payload),
    deleteTourIncludedItem: (itemId) =>
      api.delete(`/tour_included_items/${encodeURIComponent(itemId)}`),
  };

  window.KCTourService = tourService;
})();

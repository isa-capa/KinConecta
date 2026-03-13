(function () {
  if (!window.KCApiClient) return;

  const api = window.KCApiClient;

  const bookingService = {
    getBookings: () => api.get("/trip_bookings"),
    getBookingById: (bookingId) => api.get(`/trip_bookings/${encodeURIComponent(bookingId)}`),
    createBooking: (payload) => api.post("/trip_bookings", payload),
    updateBooking: (bookingId, payload) => api.put(`/trip_bookings/${encodeURIComponent(bookingId)}`, payload),
    deleteBooking: (bookingId) => api.delete(`/trip_bookings/${encodeURIComponent(bookingId)}`),
    getTripStatusHistory: () => api.get("/trip_status_history"),
    createTripStatusHistory: (payload) => api.post("/trip_status_history", payload),
  };

  window.KCBookingService = bookingService;
})();

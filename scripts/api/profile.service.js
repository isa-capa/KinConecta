(function () {
  if (!window.KCApiClient) return;

  const api = window.KCApiClient;

  const profileService = {
    getGuideProfiles: () => api.get("/guide_profiles"),
    getGuideProfileById: (userId) => api.get(`/guide_profiles/${encodeURIComponent(userId)}`),
    updateGuideProfile: (userId, payload) => api.put(`/guide_profiles/${encodeURIComponent(userId)}`, payload),
    getGuideLocations: () => api.get("/guide_locations"),
    getGuideAdaptations: () => api.get("/guide_adaptations"),
    getGuideCertifications: () => api.get("/guide_certifications"),
    getGuideExpertiseAreas: () => api.get("/guide_expertise_areas"),
    getGuideProfileExpertise: () => api.get("/guide_profile_expertise"),
    getGuideProfileLanguages: () => api.get("/guide_profile_languages"),
    getGuideCalendarEvents: () => api.get("/guide_calendar_events"),
    getIncomeTransactions: () => api.get("/income_transactions"),
    getWithdrawalRequests: () => api.get("/withdrawal_requests"),
    getTouristProfiles: () => api.get("/tourist_profiles"),
    getTouristProfileById: (userId) => api.get(`/tourist_profiles/${encodeURIComponent(userId)}`),
    updateTouristProfile: (userId, payload) => api.put(`/tourist_profiles/${encodeURIComponent(userId)}`, payload),
    getInterests: () => api.get("/interests"),
    getTouristProfileInterests: () => api.get("/tourist_profile_interests"),
    getTouristProfileLanguages: () => api.get("/tourist_profile_languages"),
  };

  window.KCProfileService = profileService;
})();

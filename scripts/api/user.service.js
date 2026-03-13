(function () {
  if (!window.KCApiClient) return;

  const api = window.KCApiClient;

  const userService = {
    getUsers: () => api.get("/users"),
    getUserById: (userId) => api.get(`/users/${encodeURIComponent(userId)}`),
    createUser: (payload) => api.post("/users", payload),
    updateUser: (userId, payload) => api.put(`/users/${encodeURIComponent(userId)}`, payload),
    deleteUser: (userId) => api.delete(`/users/${encodeURIComponent(userId)}`),
    getAuthSessions: () => api.get("/auth_sessions"),
    createAuthSession: (payload) => api.post("/auth_sessions", payload),
    getLanguages: () => api.get("/languages"),
  };

  window.KCUserService = userService;
})();

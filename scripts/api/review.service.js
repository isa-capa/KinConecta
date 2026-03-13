(function () {
  if (!window.KCApiClient) return;

  const api = window.KCApiClient;

  const reviewService = {
    getReviews: () => api.get("/reviews"),
    getReviewById: (reviewId) => api.get(`/reviews/${encodeURIComponent(reviewId)}`),
    createReview: (payload) => api.post("/reviews", payload),
    updateReview: (reviewId, payload) => api.put(`/reviews/${encodeURIComponent(reviewId)}`, payload),
    deleteReview: (reviewId) => api.delete(`/reviews/${encodeURIComponent(reviewId)}`),
    getReviewReplies: () => api.get("/review_replies"),
    createReviewReply: (payload) => api.post("/review_replies", payload),
    updateReviewReply: (replyId, payload) => api.put(`/review_replies/${encodeURIComponent(replyId)}`, payload),
  };

  window.KCReviewService = reviewService;
})();

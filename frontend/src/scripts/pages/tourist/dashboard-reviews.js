const TouristReviewsApp = (() => {
  const state = {
    summary: {
      totalReviews: 0,
      averageRating: 0,
      fiveStarsRate: "0%",
      monthCount: 0,
    },
    reviews: [],
    activeCommentReviewId: "",
  };

  const fallback = {
    summary: {
      totalReviews: 3,
      averageRating: 4.8,
      fiveStarsRate: "85%",
      monthCount: 2,
    },
    reviews: [
      {
        id: "rv_1",
        guideId: "guide_210",
        guideName: "Luis Martinez",
        tourName: "Historic Center Photo Tour",
        dateLabel: "15 Ene 2026",
        rating: 5,
        body: "Excelente experiencia. El recorrido fue claro, organizado y con recomendaciones utiles.",
        avatar: "https://i.pravatar.cc/100?u=luis",
        likes: 12,
        replies: 1,
        likedByMe: false,
      },
      {
        id: "rv_2",
        guideId: "guide_122",
        guideName: "Ana Garcia",
        tourName: "Senderismo en bosque de niebla",
        dateLabel: "28 Dic 2025",
        rating: 4,
        body: "Muy buen tour. Solo faltaron mas opciones de comida al final de la ruta.",
        avatar: "https://i.pravatar.cc/100?u=ana",
        likes: 6,
        replies: 0,
        likedByMe: true,
      },
    ],
  };

  const dom = {
    statTotal: null,
    statAverage: null,
    statFiveStars: null,
    statMonth: null,
    reviewsList: null,
    btnChat: null,
    btnNewTrip: null,
  };

  const loadingMarkup = (label, compact = false) => `
    <div class="guide-loading ${compact ? "guide-loading--compact" : ""}" role="status" aria-live="polite" aria-busy="true">
      <span class="guide-loading__spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `;

  function renderLoadingState() {
    if (dom.statTotal) dom.statTotal.textContent = "...";
    if (dom.statAverage) dom.statAverage.textContent = "...";
    if (dom.statFiveStars) dom.statFiveStars.textContent = "...";
    if (dom.statMonth) dom.statMonth.textContent = "...";
    if (dom.reviewsList) dom.reviewsList.innerHTML = loadingMarkup("Cargando resenas...");
  }

  function mapReview(raw) {
    return {
      id: raw.id,
      guideId: raw.guideId || raw.guide?.id || "",
      guideName: raw.guideName || raw.authorName || "Guia",
      tourName: raw.tourName || "Experiencia",
      dateLabel: raw.dateLabel || raw.date || "Reciente",
      rating: Number(raw.rating || 0),
      body: raw.body || raw.comment || "Sin comentario.",
      avatar: raw.avatarUrl || raw.avatar || "https://i.pravatar.cc/100?u=review",
      likes: Number(raw.likes || raw.likesCount || 0),
      replies: Number(raw.replies || raw.repliesCount || 0),
      likedByMe: Boolean(raw.likedByMe || raw.isLikedByCurrentUser),
      isLiking: false,
      isCommenting: false,
      commentError: "",
    };
  }

  async function hydrateFromApi() {
    if (!window.KCTouristApi) {
      state.summary = { ...fallback.summary };
      state.reviews = fallback.reviews.map(mapReview);
      return;
    }

    try {
      const [summaryRes, listRes] = await Promise.all([
        window.KCTouristApi.reviews.getSummary(),
        window.KCTouristApi.reviews.list({ page: 0, size: 20 }),
      ]);

      const summary = summaryRes?.data || {};
      state.summary = {
        totalReviews: Number(summary.totalReviews ?? fallback.summary.totalReviews),
        averageRating: Number(summary.averageRating ?? fallback.summary.averageRating),
        fiveStarsRate: summary.fiveStarsRate || fallback.summary.fiveStarsRate,
        monthCount: Number(summary.monthCount ?? fallback.summary.monthCount),
      };

      const rows = listRes?.data?.items || listRes?.data || [];
      state.reviews = Array.isArray(rows) && rows.length
        ? rows.map(mapReview)
        : fallback.reviews.map(mapReview);
    } catch (error) {
      console.warn("Reviews API fallback enabled:", error);
      state.summary = { ...fallback.summary };
      state.reviews = fallback.reviews.map(mapReview);
    }
  }

  function renderSummary() {
    if (dom.statTotal) dom.statTotal.textContent = String(state.summary.totalReviews);
    if (dom.statAverage) dom.statAverage.textContent = state.summary.averageRating.toFixed(1);
    if (dom.statFiveStars) dom.statFiveStars.textContent = state.summary.fiveStarsRate;
    if (dom.statMonth) dom.statMonth.textContent = String(state.summary.monthCount);
  }

  function renderStars(rating) {
    const safeRating = Math.max(0, Math.min(5, rating));
    return Array.from({ length: 5 }, (_, index) => {
      const icon = index < safeRating ? "star" : "star_outline";
      return `<span class="material-symbols-outlined">${icon}</span>`;
    }).join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderReviewCard(review) {
    const isComposerOpen = state.activeCommentReviewId === String(review.id);
    const likesLabel = `${review.likes} utiles`;
    const repliesLabel = `${review.replies} respuestas`;
    const likeButtonLabel = review.likedByMe ? "Quitar me gusta" : "Me gusta";

    return `
      <article class="review-card" data-review-id="${review.id}">
        <div class="review-card__header">
          <div class="reviewer">
            <img src="${escapeHtml(review.avatar)}" alt="Avatar de ${escapeHtml(review.guideName)}" />
            <div>
              <h3>${escapeHtml(review.guideName)}</h3>
              <p>${escapeHtml(review.tourName)} | ${escapeHtml(review.dateLabel)}</p>
            </div>
          </div>
          <div class="review-stars">${renderStars(review.rating)}</div>
        </div>
        <p class="review-card__body">${escapeHtml(review.body)}</p>
        <div class="review-card__footer">
          <button
            class="review-action ${review.likedByMe ? "is-active" : ""}"
            type="button"
            data-action="like"
            data-review-id="${review.id}"
            ${review.isLiking ? "disabled" : ""}
          >
            <span class="material-symbols-outlined">thumb_up</span>
            <span>${escapeHtml(likesLabel)}</span>
          </button>
          <button
            class="review-action"
            type="button"
            data-action="comment-toggle"
            data-review-id="${review.id}"
          >
            <span class="material-symbols-outlined">chat_bubble</span>
            <span>${escapeHtml(repliesLabel)}</span>
          </button>
        </div>
        <form
          class="review-comment ${isComposerOpen ? "is-open" : ""}"
          data-comment-form="${review.id}"
          ${isComposerOpen ? "" : "hidden"}
        >
          <label class="review-comment__label" for="reviewComment_${review.id}">Comentar</label>
          <div class="review-comment__row">
            <input
              id="reviewComment_${review.id}"
              class="review-comment__input"
              name="comment"
              type="text"
              maxlength="240"
              placeholder="Escribe tu comentario"
              autocomplete="off"
              ${review.isCommenting ? "disabled" : ""}
            />
            <button class="review-comment__submit" type="submit" ${review.isCommenting ? "disabled" : ""}>
              ${review.isCommenting ? "Enviando..." : "Enviar"}
            </button>
          </div>
          <p class="review-comment__error" data-comment-error="${review.id}">${escapeHtml(review.commentError || "")}</p>
        </form>
      </article>
    `;
  }

  function renderReviews() {
    if (!dom.reviewsList) return;
    dom.reviewsList.innerHTML = "";

    if (!state.reviews.length) {
      dom.reviewsList.innerHTML = `
        <div class="guide-loading guide-loading--compact" role="status" aria-live="polite" aria-busy="false">
          <span>Aun no tienes resenas registradas.</span>
        </div>
      `;
      return;
    }

    dom.reviewsList.innerHTML = state.reviews.map(renderReviewCard).join("");
  }

  function getReview(reviewId) {
    return state.reviews.find((item) => String(item.id) === String(reviewId)) || null;
  }

  async function toggleLike(reviewId) {
    const review = getReview(reviewId);
    if (!review || review.isLiking) return;

    const nextLiked = !review.likedByMe;
    const previousLikes = review.likes;
    const previousLiked = review.likedByMe;

    review.isLiking = true;
    review.likedByMe = nextLiked;
    review.likes = Math.max(0, previousLikes + (nextLiked ? 1 : -1));
    renderReviews();

    try {
      if (window.KCTouristApi?.reviews?.update) {
        // TODO(BACKEND): reemplazar payload por endpoint dedicado para likes.
        await window.KCTouristApi.reviews.update(review.id, { likedByMe: nextLiked });
      }
    } catch (error) {
      console.warn("Like update fallback enabled:", error);
      review.likedByMe = previousLiked;
      review.likes = previousLikes;
    } finally {
      review.isLiking = false;
      renderReviews();
    }
  }

  function openCommentComposer(reviewId) {
    state.activeCommentReviewId =
      state.activeCommentReviewId === String(reviewId) ? "" : String(reviewId);
    renderReviews();
  }

  async function submitComment(reviewId, commentText) {
    const review = getReview(reviewId);
    if (!review) return;

    const text = String(commentText || "").trim();
    if (!text) {
      review.commentError = "Escribe un comentario antes de enviar.";
      renderReviews();
      return;
    }

    review.commentError = "";
    review.isCommenting = true;
    renderReviews();

    try {
      if (window.KCTouristApi?.reviews?.update) {
        // TODO(BACKEND): usar endpoint dedicado de comentarios/respuestas.
        await window.KCTouristApi.reviews.update(review.id, { comment: text });
      }
      review.replies += 1;
      state.activeCommentReviewId = "";
    } catch (error) {
      console.warn("Comment submission fallback enabled:", error);
      review.commentError = "No fue posible enviar el comentario. Intenta nuevamente.";
      state.activeCommentReviewId = String(review.id);
    } finally {
      review.isCommenting = false;
      renderReviews();
    }
  }

  function bindReviewActions() {
    dom.reviewsList?.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (!actionButton) return;

      const action = actionButton.getAttribute("data-action");
      const reviewId = actionButton.getAttribute("data-review-id");
      if (!reviewId) return;

      if (action === "like") {
        void toggleLike(reviewId);
      } else if (action === "comment-toggle") {
        openCommentComposer(reviewId);
      }
    });

    dom.reviewsList?.addEventListener("submit", (event) => {
      const form = event.target.closest("[data-comment-form]");
      if (!form) return;
      event.preventDefault();
      const reviewId = form.getAttribute("data-comment-form");
      if (!reviewId) return;
      const commentInput = form.querySelector('input[name="comment"]');
      const commentText = commentInput?.value || "";
      void submitComment(reviewId, commentText);
    });
  }

  function bind() {
    dom.statTotal = document.getElementById("reviewsStatTotal");
    dom.statAverage = document.getElementById("reviewsStatAverage");
    dom.statFiveStars = document.getElementById("reviewsStatFiveStars");
    dom.statMonth = document.getElementById("reviewsStatMonth");
    dom.reviewsList = document.getElementById("reviewsList");
    dom.btnChat = document.getElementById("btnChat");
    dom.btnNewTrip = document.getElementById("btnNewTrip");

    bindReviewActions();

    dom.btnChat?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("tourist-chat:open"));
    });

    dom.btnNewTrip?.addEventListener("click", () => {
      window.location.href = "./trips.html";
    });
  }

  async function init() {
    bind();
    renderLoadingState();
    await hydrateFromApi();
    renderSummary();
    renderReviews();
  }

  return { init };
})();

const bootstrapTouristReviews = () => {
  const run = () => TouristReviewsApp.init();
  const sidebarReady = window.__touristSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapTouristReviews, { once: true });
} else {
  bootstrapTouristReviews();
}

const TouristTripsApp = (() => {
  const state = {
    featuredTrip: null,
    trips: [],
    actionNoticeTimer: null,
  };

  const fallbackTrips = [
    {
      id: "trip_1",
      title: "Historic Center Photo Tour",
      location: "Ciudad de Mexico",
      dateLabel: "15 Feb 2026",
      status: "confirmed",
      statusLabel: "Confirmado",
      guideId: "guide_210",
      guideName: "Luis Martinez",
      guideAvatar: "https://i.pravatar.cc/100?u=luis",
      image: "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "trip_2",
      title: "Ruta de pueblos magicos",
      location: "San Miguel de Allende",
      dateLabel: "24 Mar 2026",
      status: "pending",
      statusLabel: "Pendiente",
      guideId: "guide_122",
      guideName: "Carmen Rios",
      guideAvatar: "https://i.pravatar.cc/100?u=carmen",
      image: "https://images.unsplash.com/photo-1591009175999-95a754c1f6f2?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "trip_3",
      title: "Escapada a costa oaxaquena",
      location: "Puerto Escondido",
      dateLabel: "10 Ene 2026",
      status: "cancelled",
      statusLabel: "Cancelado",
      guideId: "guide_099",
      guideName: "Rene Cruz",
      guideAvatar: "https://i.pravatar.cc/100?u=rene",
      image: "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const dom = {
    featuredImage: null,
    featuredTitle: null,
    featuredLocation: null,
    featuredDate: null,
    featuredGuideName: null,
    featuredGuideAvatar: null,
    actionNotice: null,
    list: null,
    btnFeaturedDetails: null,
    btnFeaturedChat: null,
    btnChat: null,
    btnNewTrip: null,
  };

  const loadingMarkup = (label, compact = false) => `
    <div class="guide-loading ${compact ? "guide-loading--compact" : ""}" role="status" aria-live="polite" aria-busy="true">
      <span class="guide-loading__spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `;

  function ensureActionNoticeNode() {
    if (dom.actionNotice) return dom.actionNotice;
    const existing = document.getElementById("tripActionNotice");
    if (existing) {
      dom.actionNotice = existing;
      return existing;
    }

    const featuredBody = document.querySelector(".trip-featured__body");
    if (!featuredBody) return null;

    const notice = document.createElement("p");
    notice.id = "tripActionNotice";
    notice.className = "trip-featured__notice";
    notice.setAttribute("aria-live", "polite");
    featuredBody.appendChild(notice);
    dom.actionNotice = notice;
    return notice;
  }

  function showActionNotice(message, tone) {
    const notice = ensureActionNoticeNode();
    if (!notice) return;

    const normalizedTone =
      tone === "error" ? "is-error" : tone === "success" ? "is-success" : "is-info";
    notice.classList.remove("is-error", "is-success", "is-info");
    notice.classList.add(normalizedTone);
    notice.textContent = String(message || "");

    if (state.actionNoticeTimer) {
      window.clearTimeout(state.actionNoticeTimer);
    }

    state.actionNoticeTimer = window.setTimeout(() => {
      notice.textContent = "";
      notice.classList.remove("is-error", "is-success", "is-info");
    }, 3600);
  }

  function normalizeStatus(status) {
    return String(status || "pending").trim().toLowerCase();
  }

  function isTripCancelled(trip) {
    const status = normalizeStatus(trip?.status);
    return status === "cancelled" || status === "canceled";
  }

  function canContactGuide(trip) {
    return !isTripCancelled(trip);
  }

  function canRequestTripChange(trip) {
    const status = normalizeStatus(trip?.status);
    if (isTripCancelled(trip)) return false;
    if (status === "pending_change") return false;
    return true;
  }

  function getRequestButtonLabel(trip) {
    return normalizeStatus(trip?.status) === "pending_change"
      ? "Cambio solicitado"
      : "Solicitar cambio";
  }

  function resolveGuideProfileHref(guideId) {
    const encodedGuideId = encodeURIComponent(String(guideId || "").trim());
    return encodedGuideId
      ? `../guia/profileGuide.html?guideId=${encodedGuideId}`
      : "../guia/profileGuide.html";
  }

  function findTripById(tripId) {
    return state.trips.find((trip) => String(trip.id) === String(tripId)) || null;
  }

  function mapTrip(raw) {
    return {
      id: raw.id,
      title: raw.title || "Viaje",
      location: raw.location || raw.destination || "Mexico",
      dateLabel: raw.dateLabel || raw.date || "Sin fecha",
      status: normalizeStatus(raw.status || "pending"),
      statusLabel: raw.statusLabel || raw.status || "Pendiente",
      guideId: raw.guide?.id || raw.guideId || "",
      guideName: raw.guide?.name || raw.guideName || "Guia por asignar",
      guideAvatar: raw.guide?.avatarUrl || raw.guideAvatar || "https://i.pravatar.cc/100?u=guide",
      image:
        raw.imageUrl ||
        raw.image ||
        "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?auto=format&fit=crop&w=1200&q=80",
    };
  }

  function renderLoadingState() {
    if (dom.featuredImage) {
      dom.featuredImage.style.backgroundImage = "";
      dom.featuredImage.innerHTML = loadingMarkup("Cargando proximo viaje...", true);
    }
    if (dom.featuredTitle) dom.featuredTitle.textContent = "Cargando viaje...";
    if (dom.featuredLocation) dom.featuredLocation.textContent = "Ubicacion en proceso...";
    if (dom.featuredDate) dom.featuredDate.textContent = "Fecha en proceso...";
    if (dom.featuredGuideName) dom.featuredGuideName.textContent = "Guia en proceso...";
    if (dom.list) dom.list.innerHTML = loadingMarkup("Cargando historial de viajes...");
  }

  async function hydrateFromApi() {
    if (!window.KCTouristApi) {
      state.trips = fallbackTrips.slice();
      state.featuredTrip = state.trips[0];
      return;
    }

    try {
      const response = await window.KCTouristApi.trips.list({ page: 0, size: 20 });
      const data = response?.data?.items || response?.data || [];
      state.trips = Array.isArray(data) && data.length
        ? data.map(mapTrip)
        : fallbackTrips.slice();
      state.featuredTrip = state.trips[0] || null;
    } catch (error) {
      console.warn("Trips API fallback enabled:", error);
      state.trips = fallbackTrips.slice();
      state.featuredTrip = state.trips[0];
    }
  }

  async function hydrateTripDetail(trip) {
    if (!trip || !window.KCTouristApi?.trips?.detail) return;
    try {
      const response = await window.KCTouristApi.trips.detail(trip.id);
      const detail = response?.data || {};
      trip.location = detail.location || detail.destination || trip.location;
      trip.dateLabel = detail.dateLabel || detail.date || trip.dateLabel;
      trip.status = normalizeStatus(detail.status || trip.status);
      trip.statusLabel = detail.statusLabel || detail.status || trip.statusLabel;
      trip.guideId = detail.guide?.id || detail.guideId || trip.guideId;
      trip.guideName = detail.guide?.name || detail.guideName || trip.guideName;
      trip.guideAvatar = detail.guide?.avatarUrl || detail.guideAvatar || trip.guideAvatar;
      trip.image = detail.imageUrl || detail.image || trip.image;
    } catch (error) {
      console.warn("Trip detail fallback enabled:", error);
    }
  }

  function setFeaturedTrip(nextTrip) {
    if (!nextTrip) return;
    const trip =
      typeof nextTrip === "string"
        ? findTripById(nextTrip)
        : findTripById(nextTrip.id) || nextTrip;
    if (!trip) return;
    state.featuredTrip = trip;
    renderFeatured();
    renderTripList();
  }

  function renderFeatured() {
    const trip = state.featuredTrip;
    if (!trip) return;

    if (dom.featuredImage) {
      dom.featuredImage.innerHTML = "";
      dom.featuredImage.style.backgroundImage = `url('${trip.image}')`;
    }
    if (dom.featuredTitle) dom.featuredTitle.textContent = trip.title;
    if (dom.featuredLocation) dom.featuredLocation.textContent = trip.location;
    if (dom.featuredDate) dom.featuredDate.textContent = trip.dateLabel;
    if (dom.featuredGuideAvatar) dom.featuredGuideAvatar.src = trip.guideAvatar;

    const guideProfileHref = resolveGuideProfileHref(trip.guideId);
    if (dom.featuredGuideName) {
      dom.featuredGuideName.textContent = trip.guideName;
      if (dom.featuredGuideName.tagName.toLowerCase() === "a") {
        dom.featuredGuideName.setAttribute("href", guideProfileHref);
      } else {
        dom.featuredGuideName.dataset.href = guideProfileHref;
        dom.featuredGuideName.setAttribute("tabindex", "0");
        dom.featuredGuideName.setAttribute("role", "link");
        dom.featuredGuideName.classList.add("trip-featured__guide-link");
      }
    }

    if (dom.btnFeaturedChat) {
      dom.btnFeaturedChat.disabled = !canContactGuide(trip);
    }
  }

  async function openTripDetails(tripId, options) {
    const config = options || {};
    const trip = findTripById(tripId);
    if (!trip) return;

    setFeaturedTrip(trip);
    await hydrateTripDetail(trip);
    renderFeatured();
    renderTripList();

    if (config.scrollToFeatured) {
      document.querySelector(".trip-featured")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    showActionNotice(`Mostrando detalles de: ${trip.title}`, "info");
  }

  async function requestTripChange(tripId, triggerButton) {
    const trip = findTripById(tripId);
    if (!trip || !canRequestTripChange(trip)) return;

    const shouldContinue = window.confirm(
      "Se enviara una solicitud de cambio para este viaje. Deseas continuar?",
    );
    if (!shouldContinue) return;

    if (triggerButton) {
      triggerButton.disabled = true;
      triggerButton.setAttribute("aria-busy", "true");
    }

    try {
      if (window.KCTouristApi?.trips?.update) {
        // TODO(BACKEND): endpoint final para solicitar cambio de reserva.
        await window.KCTouristApi.trips.update(trip.id, { status: "pending_change" });
      } else if (window.KCTouristApi?.trips?.cancel) {
        // TODO(BACKEND): eliminar fallback cuando exista endpoint de cambios.
        await window.KCTouristApi.trips.cancel(trip.id, { reason: "request_change" });
      }

      trip.status = "pending_change";
      trip.statusLabel = "Cambio solicitado";
      setFeaturedTrip(trip);
      showActionNotice("Solicitud de cambio enviada correctamente.", "success");
    } catch (error) {
      console.warn("Trip change request pending backend implementation:", error);
      showActionNotice("No fue posible solicitar el cambio. Intenta nuevamente.", "error");
      renderTripList();
    } finally {
      if (triggerButton) {
        triggerButton.removeAttribute("aria-busy");
      }
    }
  }

  function renderTripList() {
    if (!dom.list) return;
    dom.list.innerHTML = "";

    if (!state.trips.length) {
      dom.list.innerHTML = `
        <div class="guide-loading guide-loading--compact" role="status" aria-live="polite" aria-busy="false">
          <span>No hay viajes para mostrar por ahora.</span>
        </div>
      `;
      return;
    }

    state.trips.forEach((trip) => {
      const status = normalizeStatus(trip.status);
      const statusClass =
        status === "cancelled"
          ? "is-cancelled"
          : status === "pending" || status === "pending_change"
            ? "is-pending"
            : "";
      const canChat = canContactGuide(trip);
      const canRequest = canRequestTripChange(trip);

      const row = document.createElement("article");
      row.className = "trip-item";
      row.innerHTML = `
        <div class="trip-item__top">
          <h3 class="trip-item__title">${trip.title}</h3>
          <span class="trip-item__status ${statusClass}">${trip.statusLabel}</span>
        </div>
        <p class="trip-item__meta">
          <span><span class="material-symbols-outlined">location_on</span>${trip.location}</span>
          <span><span class="material-symbols-outlined">calendar_month</span>${trip.dateLabel}</span>
          <span>
            <span class="material-symbols-outlined">person</span>
            <button type="button" class="trip-item__guide-link" data-guide-id="${trip.guideId}" aria-label="Ver perfil del guia ${trip.guideName}">
              ${trip.guideName}
            </button>
          </span>
        </p>
        <div class="trip-item__actions">
          <button type="button" data-action="details" data-trip-id="${trip.id}">Ver detalles</button>
          <button type="button" data-action="chat" data-trip-id="${trip.id}" ${canChat ? "" : "disabled"}>Contactar guia</button>
          <button type="button" data-action="change" data-trip-id="${trip.id}" ${canRequest ? "" : "disabled"}>${getRequestButtonLabel(trip)}</button>
        </div>
      `;

      row.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const action = event.currentTarget.getAttribute("data-action");
          const tripId = event.currentTarget.getAttribute("data-trip-id");

          if (action === "details") {
            await openTripDetails(tripId, { scrollToFeatured: true });
            return;
          }

          if (action === "chat") {
            const tripTarget = findTripById(tripId);
            if (!canContactGuide(tripTarget)) {
              showActionNotice("No puedes contactar al guia en un viaje cancelado.", "error");
              return;
            }
            window.dispatchEvent(new CustomEvent("tourist-chat:open"));
            return;
          }

          if (action === "change") {
            await requestTripChange(tripId, event.currentTarget);
          }
        });
      });

      row.querySelectorAll("[data-guide-id]").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          const guideId = event.currentTarget.getAttribute("data-guide-id");
          window.location.href = resolveGuideProfileHref(guideId);
        });
      });

      dom.list.appendChild(row);
    });
  }

  function bindFeaturedGuideEvents() {
    if (!dom.featuredGuideName || dom.featuredGuideName.tagName.toLowerCase() === "a") return;
    dom.featuredGuideName.addEventListener("click", (event) => {
      event.preventDefault();
      const href = event.currentTarget.dataset.href;
      if (href) window.location.href = href;
    });
    dom.featuredGuideName.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      const href = event.currentTarget.dataset.href;
      if (href) window.location.href = href;
    });
  }

  function bind() {
    dom.featuredImage = document.getElementById("featuredTripImage");
    dom.featuredTitle = document.getElementById("featuredTripTitle");
    dom.featuredLocation = document.getElementById("featuredTripLocation");
    dom.featuredDate = document.getElementById("featuredTripDate");
    dom.featuredGuideName = document.getElementById("featuredTripGuideName");
    dom.featuredGuideAvatar = document.getElementById("featuredTripGuideAvatar");
    dom.actionNotice = document.getElementById("tripActionNotice");
    dom.list = document.getElementById("tripsList");
    dom.btnFeaturedDetails = document.getElementById("btnFeaturedDetails");
    dom.btnFeaturedChat = document.getElementById("btnFeaturedChat");
    dom.btnChat = document.getElementById("btnChat");
    dom.btnNewTrip = document.getElementById("btnNewTrip");

    ensureActionNoticeNode();
    bindFeaturedGuideEvents();

    dom.btnFeaturedDetails?.addEventListener("click", async () => {
      if (!state.featuredTrip) return;
      await openTripDetails(state.featuredTrip.id, { scrollToFeatured: false });
    });

    dom.btnFeaturedChat?.addEventListener("click", () => {
      if (!state.featuredTrip) return;
      if (!canContactGuide(state.featuredTrip)) {
        showActionNotice("No puedes contactar al guia en un viaje cancelado.", "error");
        return;
      }
      window.dispatchEvent(new CustomEvent("tourist-chat:open"));
    });

    dom.btnChat?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("tourist-chat:open"));
    });

    dom.btnNewTrip?.addEventListener("click", () => {
      // TODO(BACKEND): wizard de nuevo viaje.
    });
  }

  function hydrateTripFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const selectedTripId = params.get("tripId");
    if (!selectedTripId) return;
    const selected = findTripById(selectedTripId);
    if (selected) setFeaturedTrip(selected);
  }

  async function init() {
    bind();
    renderLoadingState();
    await hydrateFromApi();
    hydrateTripFromQuery();
    if (!state.featuredTrip && state.trips.length) {
      state.featuredTrip = state.trips[0];
    }
    renderFeatured();
    renderTripList();
  }

  return { init };
})();

const bootstrapTouristTrips = () => {
  const run = () => TouristTripsApp.init();
  const sidebarReady = window.__touristSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapTouristTrips, { once: true });
} else {
  bootstrapTouristTrips();
}

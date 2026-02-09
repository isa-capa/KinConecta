/* =========================================================
   Turista - Dashboard (Inicio)
   JS listo para integrar backend.

   ✅ Incluye:
   - Sidebar mobile (open/close)
   - Toggle tema (light/dark, reusando clases theme--light / theme--dark)
   - Render dinámico:
       * Próximo viaje (solo México)
       * Recomendados (guías en México, precios MXN)
       * Destinos populares (México)
       * Guías guardados (México)
   - Eventos / handlers para: buscar, contactar guía, abrir destino, etc.
   - Comentarios claros para integrar API y backend.

   ========================================================= */

const TouristDashboardApp = (() => {
  // -------------------------
  // STATE (demo)
  // -------------------------
  const state = {
    theme: "light",

    user: {
      id: "tourist_001",
      name: "Alejandro M.",
      plan: "Turista Premium",
      unreadMessages: 3,
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDfFmC8OK9sh1n8CUEtELdkqASvpoFFqWQAouhYn008y4afi1bJYJhAbWL6ocr3ry8sMosNXuBdKEQ4Xosr396hZtP6ZaFuICC-t4XHHC43D4SeE8TORCCeWTg1jTy1v3E0gANzhZXLX7uYmPsNgFn6H7xbwIyKJ2O38xPWS-HuvbdDK5eQJu2AALZyyngWIjHHvc2__vb_wNPYP_XZvsCf2J2hHkxm7_Ayfw0COww9QOtmyH0kQ8p-VSvB5aBodPhyW_EiLkb9hg4L",
    },

    nextTrip: {
      id: "trip_100",
      destination: "Oaxaca, México",
      title: "Ruta cultural y gastronómica",
      dates: "15 Oct - 20 Oct, 2023",
      status: "Confirmado",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA7H4VKyo7LmCGq31MpD67ssRJBZ5GPK6a_k3j68Lamt2JqpPOpeU-M3QYvzR30jp_TbeBsQTV27xrs4e_io-CMxLOFpDoby5XVYOmsGOEiLMTkGIVZt6M2y-kUowyMWd9h4USJucsaEQJvWC1cg0O74nONMzgfYjDtei0-21Nej7BOtF-DnlhB-ca4QuxYGpbC6Ig_BCSDEOJLZtULgAy0f59D_lB1bqXXBP-VGh1j1njc9uDIUjIYw4mVDv_veFfKMHLqSRcf-SA4",
      guide: {
        id: "guide_210",
        name: "María López",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBlYm4HsCs81h02e-xY34x1aLfdrge09n0dj1q7GHdaz-chnb7V4EUC6YUak84FIHCLkugdhG_BF5nBj_e91SCG8yniWQQJ4phi5qqK6lfef0p_4LsAujNHPaQjQsioSrDd2IrV-_0nRVZY9KrjDT4SbOKOor58iyQ62T1IbFzZ2aXXwjTH1hriGvzC2rQ185DSb8ybK55IoWoRdKGUxCcMyHcf-chxIpILE1j1B9RJ4dyzvFYv3F6s-XdkybsS7FSDSQd0J4BXgJ9j",
      },
    },

    recommendedGuides: [
      {
        id: "g_1",
        name: "Ana García",
        rating: 4.9,
        tags: ["Montaña", "Historia"],
        desc: "Especialista en rutas de senderismo y patrimonio en Hidalgo y Puebla. Español e Inglés.",
        priceMXN: 450,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBVVwzL0hj3qjOwJZ612Qb-fQVDWLJKn1ESB5u8V7q9ciXgwxdqIJ-LacekuGSKlJkltE2k3Scdx5r92Kqtjp3jRd2ndJCiL-ga-qWK4bRxHKE2NYDE6FHIFsmXIK3sC5RbZSTbsO2au_VJtKskEk3VbOMFFXm7P9m1enGmOrFo_BqO7TrYjSHus3Go-cbLNn5R4IxThxSnsRI77e_RcMB3YQF6CJMbD3hEYhJAvp9DJQJdgyXt_5u0rbVMqImwGdvYiXKbZ9BAGlLo",
      },
      {
        id: "g_2",
        name: "Carlos Ruiz",
        rating: 5.0,
        tags: ["Gastronomía"],
        desc: "Experto en mercados y cocina tradicional en CDMX. Probemos tacos, nieves y antojitos.",
        priceMXN: 520,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBNkZUUEf4iJ1gYP_wxsCzyaoq8CFGbu2828zY876hSK_3PQW7SRW-t6hAIj_Kp2MOJXM_2lk9Zad7vsVRGs0s1XSl-_d_aWtjujUYASR_fezGvv1bPgBByB14f1qHwYR1XYKBaR6fcxz7Sk0omMXBXGUQpIKsfEN_LXBePolZONb9LhocBYp6TIg5MoZ4BW16fDz96BAcFlJqpUxLjhGqwy_BC8awMzy-o-V5BfmwqGzVGC6eEUwlcQQUIgk-RtrTFjVx06Jo5bV3P",
      },
      {
        id: "g_3",
        name: "Sofía Kim",
        rating: 4.8,
        tags: ["Arte", "Museos"],
        desc: "Historia del arte y museos en CDMX. Recorridos por galerías y talleres de artistas locales.",
        priceMXN: 480,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCyUjGVO_h61gsYXofuZkOEcbh7EH0fORXYYldDYtiKFlGyGzX7HExW1AXwRkmqmsqKoY0ja2vM_l-LXbu3ppPDmj3RbCsfotqUjrxwXc9aAGJB4TJn_x2sWdyw-2Ip1jI3GdQcqbDyb-Ax8s9rCzzrz2IMyFIiOyEVqmgB_j7KJhdwcm9HDQnrpLd1mkAVWSPBpXyVPuPCJ8PapxO2IGjtZNum32Q4Tjpg4lEabkZXh796eejbzQHABe-SU9hp0Imu2WB8DsJYPbIK",
      },
    ],

    destinations: [
      {
        id: "d_1",
        title: "Oaxaca, México",
        subtitle: "Cultura y tradición",
        wide: false,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA7H4VKyo7LmCGq31MpD67ssRJBZ5GPK6a_k3j68Lamt2JqpPOpeU-M3QYvzR30jp_TbeBsQTV27xrs4e_io-CMxLOFpDoby5XVYOmsGOEiLMTkGIVZt6M2y-kUowyMWd9h4USJucsaEQJvWC1cg0O74nONMzgfYjDtei0-21Nej7BOtF-DnlhB-ca4QuxYGpbC6Ig_BCSDEOJLZtULgAy0f59D_lB1bqXXBP-VGh1j1njc9uDIUjIYw4mVDv_veFfKMHLqSRcf-SA4",
      },
      {
        id: "d_2",
        title: "San Miguel de Allende, Gto.",
        subtitle: "Arquitectura y vida nocturna",
        wide: false,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA1LG2-FtjlyTa8gr8eone2W6JPS8hC-WaCblxKa4H96xY27XNBsCwqzxRH7VlmXW-DOeyGts5Hfh2MMiwsRDBXW1jGkCJ5aRwepVpXZdnOcqfS6YkPinhNlkPZzIF4iwxCAifB-1zq9twLRbSE-b4XiJiY5EAwuOQ5wQWutj-HGsGs0ZOknnUdRl5EvW2cKxNRkj7N1Kpw9UFTMLSQz8UnczdAEk9JKj5EMdTNN1eSLoduNSKMoQo5Po_6QMTL-1rRhfBKV6zBOlUR",
      },
      {
        id: "d_3",
        title: "Riviera Maya, Q. Roo",
        subtitle: "Playas y cenotes",
        wide: true,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDSl3WmgdfBb3njAGtb1jHsij4_fpf2ZJIYwmLfN-G1xj0M7nDHkoI0ApWMIn_DjKRTe5RV9wBEkaXxdY-K2-hYYV84holkn1CvM3zy_Hfla5ftUyndjenwzvGTCXBzPaY82BqiHKEEi7JyMyoGB_P2SdLdYp6F_wt4R_s6Q47mgvECsxzsx7rCBHuM4EYSaWF0h9GW-ZneBsHStfYD-hoNCxVw3Zpei2udS6xsIOA-KuQGbiLh9tYONw6SRkVguBTupYk2JaPttPGX",
      },
    ],

    savedGuides: [
      {
        id: "sg_1",
        name: "Jorge L.",
        place: "CDMX, México",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAqzkIfTcUpqSGTLJoOyGio4978Aj9w7V3Mx_l8Bjzn_0ITwTdM0an284e7Ds0FPjUNUWS1N3ayve-dtnEisTKlxDQ7vdtG8PAXfS-c0wT74sO8s6pUnpuMDkydqUClwBPcH8vpctQR2lejl6za_dUlCYe6-nPcgqSZrz2aLM5tlRK6X8C0Q0OnfibBusbwMjmvVpDRXf2z8GMcfrKT9BKqPBXMFIbdV88KOvjGrP5c-UNGYcANmDn-b5sdvvbGYhjO3c9nZyDVP6ZQ",
      },
      {
        id: "sg_2",
        name: "Elena R.",
        place: "Guadalajara, Jal.",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCrH8RGUXNBxoFG4q-Psi3-S6Ac8yGyXb-J9YkSZ56dCFOWg0_V_ZoodmLD4CVJ3Qv-klbC9e5ZfiTvZTOsAwzUmKOVqMWE6Y3Z5RhDUjA7wZCRVJrXUQt4XREPJdW3Q-MERw8AsZ99M3liFMHbtSHlSYMCanCoSf2_ULRYXMAETsSoI6fvl577ulPUlrfaGzLrX8hRwoPZibGPtkKFrM3ADNRYQMg73dO2VosNP0ovhfAXOXV6Nto51hBt5qgbnMMZUVei5esios-l",
      },
      {
        id: "sg_3",
        name: "David M.",
        place: "Monterrey, N.L.",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDi_HgIwswwpwLxRt1m8xBRRt8PrghUm3DfiRmdqQ1BvL6aOxrCRotI2-PJgI5kwP-uyJ_kaXmI2OJ_ll8k-Tz0sEZWlbNv_zNPjb1XqtXGr3RQr3aOYBIpUwst0fcMP0EZG1keUuEkbjtL8JXtv1c_G8Ai_ag0y_dwgHuRMtpG7hZ6NqF_z6-x3NnS659w3NQnikNGqY9j-TLAVgjQ0_Tn5UeMnkoSh5L7epcEes_d_18qLm0MFt89see-qXxTH4c2I8yUl6czZQEH",
      },
    ],
  };

  // -------------------------
  // DOM refs
  // -------------------------
  const dom = {
    sidebar: null,
    btnSidebar: null,
    backdrop: null,

    btnTheme: null,
    msgBadge: null,
    userName: null,
    btnLogout: null,

    searchInput: null,

    // Next trip
    nextTripMedia: null,
    nextTripDestination: null,
    nextTripTitle: null,
    nextTripDates: null,
    nextTripStatus: null,
    nextTripGuideAvatar: null,
    nextTripGuideName: null,

    btnChatGuide: null,
    btnTripDetails: null,
    btnTripManage: null,

    // Sections
    recommendedGuides: null,
    destinationGrid: null,
    savedGuides: null,

    // Topbar actions
    btnNewTrip: null,
    btnChat: null,
    btnNotif: null,
    btnViewAllGuides: null,
    btnSavedAll: null,
    btnExploreMore: null,
  };

  // -------------------------
  // Backend placeholders
  // -------------------------
  /**
   * TODO BACKEND:
   * GET /api/tourist/dashboard
   * headers: Authorization Bearer <token>
   *
   * Debe regresar:
   *  - user
   *  - nextTrip
   *  - recommendedGuides
   *  - destinations
   *  - savedGuides
   */
  const fetchDashboard = async () => {
    // const token = auth.getToken();
    // const res = await fetch("/api/tourist/dashboard", { headers:{ Authorization:`Bearer ${token}` }});
    // const data = await res.json();
    // Object.assign(state, data);
    return;
  };

  /**
   * TODO BACKEND:
   * Búsqueda real:
   * GET /api/search?q=...
   * o POST /api/search con filtros
   */
  const searchBackend = async (q) => {
    void q;
    // return fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r => r.json());
    return null;
  };

  /**
   * TODO BACKEND:
   * Favorito toggle:
   * POST /api/tourist/saved-guides/{id}/toggle
   */
  const toggleSavedGuide = async (guideId) => {
    void guideId;
  };

  /**
   * TODO BACKEND:
   * Logout.
   */
  const logout = () => {
    // auth.clearToken();
    // location.href="/login";
    alert("Cerrar sesión (placeholder).");
  };

  // -------------------------
  // Render
  // -------------------------
  const formatMoneyMXN = (n) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(n);

  const renderUser = () => {
    dom.userName.textContent = state.user.name;
    dom.msgBadge.textContent = String(state.user.unreadMessages);
    dom.msgBadge.setAttribute(
      "aria-label",
      `${state.user.unreadMessages} mensajes sin leer`,
    );
  };

  const renderNextTrip = () => {
    const t = state.nextTrip;

    dom.nextTripMedia.style.backgroundImage = `url('${t.image}')`;
    dom.nextTripDestination.textContent = t.destination;
    dom.nextTripTitle.textContent = t.title;
    dom.nextTripDates.textContent = t.dates;
    dom.nextTripStatus.textContent = t.status;

    dom.nextTripGuideAvatar.style.backgroundImage = `url('${t.guide.avatar}')`;
    dom.nextTripGuideName.textContent = t.guide.name;
  };

  const renderRecommendedGuides = (list) => {
    dom.recommendedGuides.innerHTML = "";

    list.forEach((g) => {
      const card = document.createElement("article");
      card.className = "guide-card";
      card.tabIndex = 0;

      card.innerHTML = `
        <div class="guide-card__media" style="background-image:url('${g.image}');">
          <div class="guide-card__rating">
            <span class="material-symbols-outlined" aria-hidden="true">star</span>
            <span>${g.rating.toFixed(1)}</span>
          </div>

          <div class="guide-card__tags">
            ${g.tags.map((t) => `<span class="guide-card__tag">${t}</span>`).join("")}
          </div>
        </div>

        <div class="guide-card__body">
          <h3 class="guide-card__name">${g.name}</h3>
          <p class="guide-card__desc">${g.desc}</p>

          <div class="guide-card__footer">
            <div class="guide-card__price">
              <strong>${formatMoneyMXN(g.priceMXN)}</strong> / hora
            </div>

            <button class="guide-card__btn" type="button" data-guide-id="${g.id}">
              Contactar
              <span class="material-symbols-outlined" aria-hidden="true">send</span>
            </button>
          </div>
        </div>
      `;

      // Abrir perfil guía (placeholder)
      const openGuide = () => {
        // TODO BACKEND/ROUTER:
        // location.href = `/turista/guias/${g.id}`
        alert(`Abrir perfil del guía: ${g.id} (placeholder).`);
      };

      card.addEventListener("click", (e) => {
        // Si el click fue al botón contactar, no abrir el card completo
        const btn = e.target.closest("button[data-guide-id]");
        if (btn) return;
        openGuide();
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openGuide();
        }
      });

      card
        .querySelector("button[data-guide-id]")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          // TODO BACKEND:
          // POST /api/messages/start con { guideId }
          alert(`Iniciar chat/contacto con: ${g.name} (placeholder).`);
        });

      dom.recommendedGuides.appendChild(card);
    });
  };

  const renderDestinations = () => {
    dom.destinationGrid.innerHTML = "";

    state.destinations.forEach((d) => {
      const card = document.createElement("div");
      card.className = `destination-card ${d.wide ? "destination-card--wide" : ""}`;
      card.tabIndex = 0;

      card.innerHTML = `
        <div class="destination-card__media" style="background-image:url('${d.image}');"></div>
        <div class="destination-card__overlay" aria-hidden="true"></div>
        <div class="destination-card__content">
          <h3 class="destination-card__title">${d.title}</h3>
          <p class="destination-card__subtitle">${d.subtitle}</p>
        </div>
      `;

      const openDestination = () => {
        // TODO BACKEND:
        // location.href = `/turista/explorar?destino=${encodeURIComponent(d.title)}`
        alert(`Explorar destino: ${d.title} (placeholder).`);
      };

      card.addEventListener("click", openDestination);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDestination();
        }
      });

      dom.destinationGrid.appendChild(card);
    });
  };

  const renderSavedGuides = () => {
    dom.savedGuides.innerHTML = "";

    state.savedGuides.forEach((g) => {
      const li = document.createElement("li");
      li.className = "saved-item";

      li.innerHTML = `
        <div class="saved-item__avatar" style="background-image:url('${g.avatar}');" aria-hidden="true"></div>
        <div class="saved-item__meta">
          <div class="saved-item__name">${g.name}</div>
          <div class="saved-item__place">${g.place}</div>
        </div>
        <button class="saved-item__fav" type="button" aria-label="Quitar de favoritos" data-saved-id="${g.id}">
          <span class="material-symbols-outlined fill-1" aria-hidden="true">favorite</span>
        </button>
      `;

      // Abrir perfil guardado
      li.addEventListener("click", (e) => {
        const favBtn = e.target.closest("button[data-saved-id]");
        if (favBtn) return;

        // TODO BACKEND/ROUTER:
        // location.href = `/turista/guias/${g.id}`
        alert(`Abrir guía guardado: ${g.name} (placeholder).`);
      });

      li.querySelector("button[data-saved-id]").addEventListener(
        "click",
        async (e) => {
          e.stopPropagation();

          // Optimistic UI (en demo lo removemos del state)
          const id = e.currentTarget.getAttribute("data-saved-id");

          // TODO BACKEND:
          // await toggleSavedGuide(id);
          await toggleSavedGuide(id);

          state.savedGuides = state.savedGuides.filter((x) => x.id !== id);
          renderSavedGuides();
        },
      );

      dom.savedGuides.appendChild(li);
    });
  };

  // -------------------------
  // Theme + Sidebar (reuse)
  // -------------------------
  const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.classList.contains("theme--dark");

    html.classList.toggle("theme--dark", !isDark);
    html.classList.toggle("theme--light", isDark);

    state.theme = !isDark ? "dark" : "light";

    // TODO STORAGE:
    // localStorage.setItem("theme", state.theme);
  };

  const openSidebar = () => {
    dom.sidebar.classList.add("sidebar--open");
    dom.backdrop.hidden = false;
    dom.btnSidebar.setAttribute("aria-expanded", "true");
  };

  const closeSidebar = () => {
    dom.sidebar.classList.remove("sidebar--open");
    dom.backdrop.hidden = true;
    dom.btnSidebar.setAttribute("aria-expanded", "false");
  };

  // -------------------------
  // Search (frontend-only placeholder)
  // -------------------------
  const applyLocalSearch = (q) => {
    const query = q.trim().toLowerCase();
    if (!query) {
      renderRecommendedGuides(state.recommendedGuides);
      return;
    }

    const filtered = state.recommendedGuides.filter((g) => {
      return (
        g.name.toLowerCase().includes(query) ||
        g.desc.toLowerCase().includes(query) ||
        g.tags.some((t) => t.toLowerCase().includes(query))
      );
    });

    renderRecommendedGuides(filtered);
  };

  // -------------------------
  // Bind
  // -------------------------
  const bind = () => {
    dom.sidebar = document.getElementById("sidebar");
    dom.btnSidebar = document.getElementById("btnSidebar");
    dom.backdrop = document.getElementById("backdrop");

    dom.btnTheme = document.getElementById("btnTheme");
    dom.msgBadge = document.getElementById("msgBadge");
    dom.userName = document.getElementById("userName");
    dom.btnLogout = document.getElementById("btnLogout");

    dom.searchInput = document.getElementById("searchInput");

    dom.nextTripMedia = document.getElementById("nextTripMedia");
    dom.nextTripDestination = document.getElementById("nextTripDestination");
    dom.nextTripTitle = document.getElementById("nextTripTitle");
    dom.nextTripDates = document.getElementById("nextTripDates");
    dom.nextTripStatus = document.getElementById("nextTripStatus");
    dom.nextTripGuideAvatar = document.getElementById("nextTripGuideAvatar");
    dom.nextTripGuideName = document.getElementById("nextTripGuideName");

    dom.btnChatGuide = document.getElementById("btnChatGuide");
    dom.btnTripDetails = document.getElementById("btnTripDetails");
    dom.btnTripManage = document.getElementById("btnTripManage");

    dom.recommendedGuides = document.getElementById("recommendedGuides");
    dom.destinationGrid = document.getElementById("destinationGrid");
    dom.savedGuides = document.getElementById("savedGuides");

    dom.btnNewTrip = document.getElementById("btnNewTrip");
    dom.btnChat = document.getElementById("btnChat");
    dom.btnNotif = document.getElementById("btnNotif");
    dom.btnViewAllGuides = document.getElementById("btnViewAllGuides");
    dom.btnSavedAll = document.getElementById("btnSavedAll");
    dom.btnExploreMore = document.getElementById("btnExploreMore");

    // Sidebar mobile
    dom.btnSidebar.addEventListener("click", () => {
      const isOpen = dom.sidebar.classList.contains("sidebar--open");
      isOpen ? closeSidebar() : openSidebar();
    });
    dom.backdrop.addEventListener("click", closeSidebar);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });

    // Theme
    dom.btnTheme.addEventListener("click", toggleTheme);

    // Logout
    dom.btnLogout.addEventListener("click", logout);

    // Search
    dom.searchInput.addEventListener("input", async (e) => {
      const q = e.target.value;

      // Placeholder local
      applyLocalSearch(q);

      // TODO BACKEND:
      // const results = await searchBackend(q);
      // renderRecommendedGuides(results.guides);
      void searchBackend; // evita warning si aún no se usa
    });

    // Acciones del próximo viaje
    dom.btnChatGuide.addEventListener("click", () => {
      // TODO BACKEND:
      // POST /api/messages/start { guideId: state.nextTrip.guide.id }
      alert("Abrir chat con tu guía (placeholder).");
    });

    dom.btnTripDetails.addEventListener("click", () => {
      // TODO BACKEND:
      // location.href = `/turista/viajes/${state.nextTrip.id}`
      alert(`Ver detalles del viaje: ${state.nextTrip.id} (placeholder).`);
    });

    dom.btnTripManage.addEventListener("click", () => {
      // TODO BACKEND:
      // location.href = `/turista/viajes/${state.nextTrip.id}/gestionar`
      alert(`Gestionar viaje: ${state.nextTrip.id} (placeholder).`);
    });

    // Topbar shortcuts
    dom.btnNewTrip.addEventListener("click", () => {
      // TODO BACKEND:
      // location.href = "/turista/viajes/nuevo"
      alert("Crear nuevo viaje (placeholder).");
    });

    dom.btnChat.addEventListener("click", () => {
      // TODO BACKEND:
      // location.href = "/turista/mensajes"
      alert("Abrir chat/mensajes (placeholder).");
    });

    dom.btnNotif.addEventListener("click", () => {
      // TODO BACKEND:
      // location.href = "/turista/notificaciones"
      alert("Abrir notificaciones (placeholder).");
    });

    dom.btnViewAllGuides.addEventListener("click", () => {
      // TODO BACKEND:
      // location.href = "/turista/explorar?tab=guias"
      alert("Ver todos los guías recomendados (placeholder).");
    });

    dom.btnSavedAll.addEventListener("click", () => {
      // TODO BACKEND:
      // location.href = "/turista/favoritos?tab=guias"
      alert("Ver todos los guías guardados (placeholder).");
    });

    dom.btnExploreMore.addEventListener("click", () => {
      // TODO BACKEND:
      // location.href = "/turista/explorar"
      alert("Explorar más guías (placeholder).");
    });
  };

  const renderAll = () => {
    renderUser();
    renderNextTrip();
    renderRecommendedGuides(state.recommendedGuides);
    renderDestinations();
    renderSavedGuides();
  };

  const init = async () => {
    bind();

    // TODO BACKEND:
    // await fetchDashboard();
    await fetchDashboard();

    renderAll();
  };

  return { init };
})();

document.addEventListener("DOMContentLoaded", TouristDashboardApp.init);

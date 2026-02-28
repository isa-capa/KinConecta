(function () {
  const qs = (selector, parent = document) => parent.querySelector(selector);
  const qsa = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const menuBtn = qs(".header__menu-btn");
  const mobileMenu = qs("#mobileMenu");

  if (menuBtn && mobileMenu) {
    const setOpen = (open) => {
      menuBtn.setAttribute("aria-expanded", String(open));
      mobileMenu.hidden = !open;
      document.body.style.overflow = open ? "hidden" : "";
    };

    menuBtn.addEventListener("click", () => {
      const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });

    qsa(".mobile-menu__link", mobileMenu).forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  const rippleTargets = qsa(
    ".btn--ripple, .footer__social-btn, .toast__close",
  );

  rippleTargets.forEach((target) => {
    target.addEventListener("click", (event) => {
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";

      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

      target.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 700);
    });
  });

  const revealItems = qsa(".reveal");
  if ("IntersectionObserver" in window && revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const navLinks = qsa(".header__link");
  const navTargets = navLinks
    .map((link) => {
      const href = link.getAttribute("href") || "";
      const hashIndex = href.indexOf("#");
      const hasHash = hashIndex >= 0;
      const base = hasHash ? href.slice(0, hashIndex) : href;
      const id = hasHash ? href.slice(hashIndex + 1) : "inicio";

      if (base && !base.endsWith("index.html") && !base.endsWith("./index.html")) {
        return null;
      }

      return { link, id };
    })
    .filter(Boolean);

  const sections = navTargets
    .map((item) => qs(`#${item.id}`))
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((link) => link.classList.remove("header__link--active"));
    const active = navTargets.find((item) => item.id === id);
    if (active) active.link.classList.add("header__link--active");
  };

  if (sections.length) {
    const spy = () => {
      const y = window.scrollY + 160;
      let current = sections[0].id;
      sections.forEach((section) => {
        if (section.offsetTop <= y) current = section.id;
      });
      setActive(current);
    };

    window.addEventListener("scroll", spy, { passive: true });
    spy();
  }

  const floatCards = qsa(".js-float");
  if (!prefersReduced && floatCards.length) {
    const setup = floatCards.map((card) => ({
      card,
      amplitude: 5 + Math.random() * 4,
      speed: 0.0011 + Math.random() * 0.0007,
      phase: Math.random() * Math.PI * 2,
      rotation: (Math.random() * 2 - 1) * 1.2,
    }));

    const animate = (time) => {
      setup.forEach((item) => {
        const y = Math.sin(time * item.speed + item.phase) * item.amplitude;
        const r = Math.sin(time * (item.speed * 0.9) + item.phase) * item.rotation;
        item.card.style.transform = `translateY(${y}px) rotate(${r}deg)`;
      });
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  const searchDom = {
    root: qs("[data-landing-search]"),
    input: qs("[data-landing-search-input]"),
    list: qs("[data-landing-search-list]"),
    button: qs("[data-landing-search-button]"),
    status: qs("[data-landing-search-status]"),
    hero: qs("#inicio"),
    main: qs("main"),
  };

  const fallbackLandingData = {
    tours: [
      {
        id: "exp_1",
        title: "Sabores de Oaxaca",
        location: "Oaxaca, Mexico",
        tags: ["Gastronomia", "Cultura"],
        rating: 4.9,
        priceLabel: "$850 MXN / persona",
        image:
          "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "exp_2",
        title: "Ruta de Cenotes",
        location: "Tulum, Quintana Roo",
        tags: ["Aventura", "Naturaleza"],
        rating: 4.8,
        priceLabel: "$1,240 MXN / persona",
        image:
          "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "exp_3",
        title: "Centro Historico Nocturno",
        location: "Ciudad de Mexico",
        tags: ["Historia", "Arquitectura"],
        rating: 4.7,
        priceLabel: "$620 MXN / persona",
        image:
          "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "exp_4",
        title: "Artesanias y Talleres",
        location: "San Miguel de Allende",
        tags: ["Cultura", "Arte"],
        rating: 4.9,
        priceLabel: "$760 MXN / persona",
        image:
          "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    guides: [
      {
        id: "guide_210",
        name: "Maria Lopez",
        location: "Oaxaca, Mexico",
        bio: "Ruta cultural y gastronomica.",
        rating: 4.9,
        tags: ["Cultura", "Gastronomia"],
        avatar: "https://i.pravatar.cc/100?u=guide_210",
      },
      {
        id: "g_1",
        name: "Ana Garcia",
        location: "Puebla, Mexico",
        bio: "Especialista en rutas de senderismo y patrimonio.",
        rating: 4.9,
        tags: ["Montana", "Historia"],
        priceLabel: "$450 MXN / hora",
        avatar:
          "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "g_2",
        name: "Carlos Ruiz",
        location: "Ciudad de Mexico",
        bio: "Experto en mercados y cocina tradicional.",
        rating: 5,
        tags: ["Gastronomia"],
        priceLabel: "$520 MXN / hora",
        avatar:
          "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "sg_1",
        name: "Jorge L.",
        location: "CDMX, Mexico",
        avatar: "https://i.pravatar.cc/100?u=sg_1",
      },
      {
        id: "sg_2",
        name: "Elena R.",
        location: "Guadalajara, Jal.",
        avatar: "https://i.pravatar.cc/100?u=sg_2",
      },
      {
        id: "sg_3",
        name: "David M.",
        location: "Monterrey, N.L.",
        avatar: "https://i.pravatar.cc/100?u=sg_3",
      },
    ],
  };

  const landingSearchState = {
    cityOptions: [],
    selectedCity: "",
    searching: false,
    resultsSection: null,
    resultsDom: null,
    catalogTours: fallbackLandingData.tours.slice(),
    catalogGuides: fallbackLandingData.guides.slice(),
  };

  const formatMoneyMXN = (value) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(value);

  const loadingMarkup = (label, compact = false) => `
    <div class="guide-loading ${compact ? "guide-loading--compact" : ""}" role="status" aria-live="polite" aria-busy="true">
      <span class="guide-loading__spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `;

  const normalizeText = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const toSafeUrl = (value) => {
    const raw = String(value || "").trim();
    if (!raw || /^javascript:/i.test(raw)) return "";
    return raw.replace(/"/g, "%22").replace(/'/g, "%27");
  };

  const firstCityToken = (value) => String(value || "").split(",")[0].trim();

  const cityKey = (value) => normalizeText(firstCityToken(value));

  const canonicalCityKey = (value) => {
    const key = cityKey(value);
    if (key === "cdmx" || key === "ciudad de mexico" || key === "mexico city") {
      return "ciudad de mexico";
    }
    return key;
  };

  const cityMatches = (location, city) => {
    const source = canonicalCityKey(location);
    const target = canonicalCityKey(city);
    return Boolean(source && target && source === target);
  };

  const buildPriceLabel = (raw) => {
    if (raw.priceLabel) return raw.priceLabel;
    if (raw.priceText) return raw.priceText;
    if (raw.priceMXN || raw.price) {
      const amount = Number(raw.priceMXN || raw.price);
      if (Number.isFinite(amount) && amount > 0) {
        return `${formatMoneyMXN(amount)} / persona`;
      }
    }
    return "Precio disponible al contactar";
  };

  const mapTour = (raw) => {
    if (!raw || typeof raw !== "object") return null;
    return {
      id: raw.id || `tour_${Math.random().toString(36).slice(2, 9)}`,
      title: raw.title || raw.name || "Tour local",
      location: raw.location || raw.city || "Mexico",
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      rating: Number(raw.rating || 0),
      priceLabel: buildPriceLabel(raw),
      image:
        raw.imageUrl ||
        raw.coverUrl ||
        raw.image ||
        "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80",
    };
  };

  const mapGuide = (raw) => {
    if (!raw || typeof raw !== "object") return null;
    return {
      id: raw.id || `guide_${Math.random().toString(36).slice(2, 9)}`,
      name: raw.name || raw.fullName || "Guia local",
      location: raw.location || raw.place || raw.city || "Mexico",
      bio: raw.bio || raw.description || raw.desc || "",
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      rating: Number(raw.rating || 0),
      priceLabel: buildPriceLabel(raw),
      avatar:
        raw.avatarUrl ||
        raw.imageUrl ||
        raw.avatar ||
        "https://i.pravatar.cc/100?u=kinconecta-guide",
    };
  };

  const unwrapItems = (response) => {
    const data = response?.data?.items || response?.data || [];
    return Array.isArray(data) ? data : [];
  };

  const dedupeCities = (values) => {
    const seen = new Set();
    const result = [];
    values.forEach((item) => {
      const city = firstCityToken(item);
      const key = canonicalCityKey(city);
      if (!city || !key || seen.has(key)) return;
      seen.add(key);
      result.push(city);
    });
    return result;
  };

  const collectCities = (tours, guides) =>
    dedupeCities([
      ...tours.map((item) => item.location),
      ...guides.map((item) => item.location),
    ]);

  const setSearchStatus = (message, isError = false) => {
    if (!searchDom.status) return;
    searchDom.status.textContent = message || "";
    searchDom.status.classList.toggle("is-error", Boolean(isError));
    if (searchDom.root) {
      searchDom.root.classList.toggle("landing-search--error", Boolean(isError));
    }
    searchDom.input?.classList.toggle("is-invalid", Boolean(isError));
  };

  const renderCityOptions = (query) => {
    if (!searchDom.list) return;
    const normalized = canonicalCityKey(query);
    const source = landingSearchState.cityOptions.slice(0, 30);
    const filtered = normalized
      ? source.filter((city) => canonicalCityKey(city).includes(normalized))
      : source;

    if (!filtered.length) {
      searchDom.list.innerHTML = `
        <li class="landing-search__option landing-search__option--muted" role="option" aria-disabled="true">
          No hay coincidencias para esa ciudad.
        </li>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();
    filtered.slice(0, 10).forEach((city) => {
      const item = document.createElement("li");
      item.className = "landing-search__option";
      item.setAttribute("role", "option");
      item.setAttribute("data-landing-city-option", city);
      item.textContent = city;
      fragment.appendChild(item);
    });

    searchDom.list.innerHTML = "";
    searchDom.list.appendChild(fragment);
  };

  const ensureResultsSection = () => {
    if (
      landingSearchState.resultsSection &&
      document.body.contains(landingSearchState.resultsSection)
    ) {
      return landingSearchState.resultsDom;
    }

    const section = document.createElement("section");
    section.className = "section landing-results-section is-entering";
    section.id = "resultados-busqueda";
    section.setAttribute("data-landing-results-section", "");
    section.innerHTML = `
      <div class="container">
        <div class="page-card landing-results">
          <div class="section__header section__header--left landing-results__header">
            <p class="landing-results__eyebrow">Resultados por ciudad</p>
            <h2 class="section__title landing-results__title">Opciones en <span data-landing-results-city></span></h2>
            <p class="section__subtitle landing-results__subtitle" data-landing-results-summary></p>
          </div>
          <div class="landing-results__columns">
            <article class="landing-results__column" aria-label="Tours de la ciudad">
              <header class="landing-results__column-head">
                <h3 class="landing-results__column-title">
                  <span class="material-symbols-outlined" aria-hidden="true">travel_explore</span>
                  Tours en la ciudad
                </h3>
              </header>
              <div class="landing-results__list" data-landing-results-tours></div>
            </article>
            <article class="landing-results__column" aria-label="Guias de la ciudad">
              <header class="landing-results__column-head">
                <h3 class="landing-results__column-title">
                  <span class="material-symbols-outlined" aria-hidden="true">groups</span>
                  Guias disponibles
                </h3>
              </header>
              <div class="landing-results__list" data-landing-results-guides></div>
            </article>
          </div>
        </div>
      </div>
    `;

    if (searchDom.hero?.parentNode) {
      searchDom.hero.insertAdjacentElement("afterend", section);
    } else {
      searchDom.main?.appendChild(section);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        section.classList.remove("is-entering");
      });
    });

    landingSearchState.resultsSection = section;
    landingSearchState.resultsDom = {
      city: qs("[data-landing-results-city]", section),
      summary: qs("[data-landing-results-summary]", section),
      tours: qs("[data-landing-results-tours]", section),
      guides: qs("[data-landing-results-guides]", section),
    };
    return landingSearchState.resultsDom;
  };

  const renderSearchLoading = (city) => {
    const results = ensureResultsSection();
    if (!results) return;
    if (results.city) results.city.textContent = city;
    if (results.summary) {
      results.summary.textContent = "Cargando tours y guias para esta ubicacion...";
    }
    if (results.tours) {
      results.tours.innerHTML = loadingMarkup("Cargando tours...");
    }
    if (results.guides) {
      results.guides.innerHTML = loadingMarkup("Cargando guias...");
    }
  };

  const renderTours = (items) => {
    const results = ensureResultsSection();
    if (!results?.tours) return;

    if (!items.length) {
      results.tours.innerHTML = `
        <div class="guide-loading guide-loading--compact" role="status" aria-live="polite" aria-busy="false">
          <span>No hay tours disponibles para esta ciudad por ahora.</span>
        </div>
      `;
      return;
    }

    results.tours.innerHTML = items
      .map((tour) => {
        const tags = (tour.tags || [])
          .slice(0, 3)
          .map(
            (tag) =>
              `<span class="landing-result-card__tag">${escapeHtml(tag)}</span>`,
          )
          .join("");
        const rating = Number(tour.rating) > 0
          ? `
            <span class="landing-result-card__rating">
              <span class="material-symbols-outlined" aria-hidden="true">star</span>
              ${Number(tour.rating).toFixed(1)}
            </span>
          `
          : "";
        return `
          <article class="landing-result-card landing-result-card--tour">
            <div class="landing-result-card__media" style="background-image:url('${toSafeUrl(tour.image)}');"></div>
            <div class="landing-result-card__body">
              <h4 class="landing-result-card__title">${escapeHtml(tour.title)}</h4>
              <p class="landing-result-card__meta">
                <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
                ${escapeHtml(tour.location)}
              </p>
              <div class="landing-result-card__tags">${tags}</div>
              <div class="landing-result-card__footer">
                <span class="landing-result-card__price">${escapeHtml(tour.priceLabel)}</span>
                ${rating}
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  };

  const renderGuides = (items) => {
    const results = ensureResultsSection();
    if (!results?.guides) return;

    if (!items.length) {
      results.guides.innerHTML = `
        <div class="guide-loading guide-loading--compact" role="status" aria-live="polite" aria-busy="false">
          <span>No hay guias disponibles para esta ciudad por ahora.</span>
        </div>
      `;
      return;
    }

    results.guides.innerHTML = items
      .map((guide) => {
        const tags = (guide.tags || [])
          .slice(0, 3)
          .map(
            (tag) =>
              `<span class="landing-result-card__tag">${escapeHtml(tag)}</span>`,
          )
          .join("");
        const rating = Number(guide.rating) > 0
          ? `
            <span class="landing-result-card__rating">
              <span class="material-symbols-outlined" aria-hidden="true">star</span>
              ${Number(guide.rating).toFixed(1)}
            </span>
          `
          : "";
        const bio = guide.bio
          ? `<p class="landing-result-card__desc">${escapeHtml(guide.bio)}</p>`
          : "";
        return `
          <article class="landing-result-card landing-result-card--guide">
            <div class="landing-result-card__body">
              <div class="landing-result-card__guide-head">
                <div class="landing-result-card__avatar" style="background-image:url('${toSafeUrl(guide.avatar)}');"></div>
                <div class="landing-result-card__guide-meta">
                  <h4 class="landing-result-card__title">${escapeHtml(guide.name)}</h4>
                  <p class="landing-result-card__meta">
                    <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
                    ${escapeHtml(guide.location)}
                  </p>
                </div>
              </div>
              ${bio}
              <div class="landing-result-card__tags">${tags}</div>
              <div class="landing-result-card__footer">
                <span class="landing-result-card__price">${escapeHtml(guide.priceLabel || "Disponible para contacto")}</span>
                ${rating}
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  };

  const renderResultsSummary = (city, tours, guides) => {
    const results = ensureResultsSection();
    if (!results) return;
    if (results.city) results.city.textContent = city;
    if (results.summary) {
      const tourLabel = tours === 1 ? "tour" : "tours";
      const guideLabel = guides === 1 ? "guia" : "guias";
      results.summary.textContent = `${tours} ${tourLabel} y ${guides} ${guideLabel} encontrados para ${city}.`;
    }
  };

  const resolveSelectedCity = () => {
    const typed = searchDom.input?.value.trim() || "";
    if (!typed) return "";
    const selected = landingSearchState.selectedCity;
    if (selected && canonicalCityKey(selected) === canonicalCityKey(typed)) return selected;

    const fromList = landingSearchState.cityOptions.find(
      (city) => canonicalCityKey(city) === canonicalCityKey(typed),
    );
    if (fromList) {
      landingSearchState.selectedCity = fromList;
      return fromList;
    }
    return "";
  };

  const fetchLandingResults = async (city) => {
    if (window.KCTouristApi?.explore) {
      try {
        // TODO(BACKEND): Confirmar nombre final del parametro de ciudad.
        // Si cambia en Spring Boot (ej. location/cityName), ajustar solo este objeto query.
        const query = { page: 0, size: 24, city };
        const [toursRes, guidesRes] = await Promise.all([
          window.KCTouristApi.explore.listExperiences(query),
          window.KCTouristApi.explore.listGuides(query),
        ]);

        const tours = unwrapItems(toursRes).map(mapTour).filter(Boolean);
        const guides = unwrapItems(guidesRes).map(mapGuide).filter(Boolean);
        return { tours, guides };
      } catch (error) {
        console.warn("Landing search API fallback enabled:", error);
      }
    }

    const tours = landingSearchState.catalogTours.filter((tour) =>
      cityMatches(tour.location, city),
    );
    const guides = landingSearchState.catalogGuides.filter((guide) =>
      cityMatches(guide.location, city),
    );
    return { tours, guides };
  };

  const hydrateCityOptions = async () => {
    let tours = fallbackLandingData.tours.slice();
    let guides = fallbackLandingData.guides.slice();

    if (window.KCTouristApi?.explore) {
      try {
        // TODO(BACKEND): Cuando exista endpoint dedicado de ciudades, reemplazar
        // esta precarga por ese endpoint para evitar overfetch.
        const [toursRes, guidesRes] = await Promise.all([
          window.KCTouristApi.explore.listExperiences({ page: 0, size: 40 }),
          window.KCTouristApi.explore.listGuides({ page: 0, size: 40 }),
        ]);

        const apiTours = unwrapItems(toursRes).map(mapTour).filter(Boolean);
        const apiGuides = unwrapItems(guidesRes).map(mapGuide).filter(Boolean);

        if (apiTours.length) tours = apiTours;
        if (apiGuides.length) guides = apiGuides;
      } catch (error) {
        console.warn("Landing city catalog fallback enabled:", error);
      }
    }

    landingSearchState.catalogTours = tours;
    landingSearchState.catalogGuides = guides;
    landingSearchState.cityOptions = collectCities(tours, guides);
    renderCityOptions(searchDom.input?.value || "");
  };

  const runLandingSearch = async () => {
    if (landingSearchState.searching || !searchDom.input || !searchDom.button) return;

    const selectedCity = resolveSelectedCity();
    if (!selectedCity) {
      setSearchStatus("Selecciona una ciudad valida antes de buscar.", true);
      return;
    }

    landingSearchState.searching = true;
    searchDom.button.disabled = true;
    searchDom.input.blur();
    setSearchStatus(`Buscando opciones para ${selectedCity}...`);
    renderSearchLoading(selectedCity);

    try {
      const { tours, guides } = await fetchLandingResults(selectedCity);
      renderTours(tours);
      renderGuides(guides);
      renderResultsSummary(selectedCity, tours.length, guides.length);
      setSearchStatus(`Resultados actualizados para ${selectedCity}.`);
    } finally {
      landingSearchState.searching = false;
      searchDom.button.disabled = false;
    }
  };

  const bindLandingSearch = () => {
    if (!searchDom.root || !searchDom.input || !searchDom.list || !searchDom.button) return;

    searchDom.input.addEventListener("input", () => {
      landingSearchState.selectedCity = "";
      setSearchStatus("");
      renderCityOptions(searchDom.input.value);
    });

    searchDom.input.addEventListener("focus", () => {
      renderCityOptions(searchDom.input.value);
    });

    searchDom.input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      runLandingSearch();
    });

    searchDom.list.addEventListener("mousedown", (event) => {
      if (event.target.closest("[data-landing-city-option]")) {
        event.preventDefault();
      }
    });

    searchDom.list.addEventListener("click", (event) => {
      const option = event.target.closest("[data-landing-city-option]");
      if (!option) return;
      const city =
        option.getAttribute("data-landing-city-option") ||
        option.textContent?.trim() ||
        "";
      landingSearchState.selectedCity = city;
      searchDom.input.value = city;
      setSearchStatus("");
      void runLandingSearch();
    });

    searchDom.button.addEventListener("click", runLandingSearch);
    hydrateCityOptions();
  };

  bindLandingSearch();

  const contactSection = qs("#contacto");
  const form = qs(".contact-form", contactSection || document);
  const toast = qs(".toast", contactSection || document);
  const toastClose = qs(".toast__close", contactSection || document);

  const hints = {
    name: qs('[data-hint="name"]', contactSection || document),
    email: qs('[data-hint="email"]', contactSection || document),
    message: qs('[data-hint="message"]', contactSection || document),
  };

  const showHint = (key, value) => {
    if (!hints[key]) return;
    hints[key].textContent = value || "";
  };

  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

  const showToast = () => {
    if (!toast) return;
    toast.hidden = false;
    window.setTimeout(() => {
      toast.hidden = true;
    }, 4200);
  };

  if (toastClose && toast) {
    toastClose.addEventListener("click", () => {
      toast.hidden = true;
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = qs("#name", form)?.value.trim() || "";
      const email = qs("#email", form)?.value.trim() || "";
      const message = qs("#message", form)?.value.trim() || "";

      let valid = true;
      showHint("name", "");
      showHint("email", "");
      showHint("message", "");

      if (name.length < 3) {
        valid = false;
        showHint("name", "Escribe tu nombre (mínimo 3 caracteres).");
      }

      if (!isEmail(email)) {
        valid = false;
        showHint("email", "Revisa tu correo (ej. tu@email.com).");
      }

      if (message.length < 10) {
        valid = false;
        showHint("message", "Escribe al menos 10 caracteres.");
      }

      if (!valid) return;

      form.reset();
      showToast();
    });
  }

  const footerNewsletterForm = qs("[data-footer-newsletter-form]");
  const footerFeedback = qs("[data-footer-feedback]");
  if (footerNewsletterForm && footerFeedback) {
    const newsletterEmail = qs('input[type="email"]', footerNewsletterForm);

    footerNewsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = newsletterEmail?.value.trim() || "";
      const valid = isEmail(email);

      footerFeedback.classList.remove("is-error");
      if (!valid) {
        footerFeedback.textContent = "Escribe un correo valido para unirte.";
        footerFeedback.classList.add("is-error");
        return;
      }

      footerFeedback.textContent = "Listo, te has unido a las novedades de Kin Conecta.";
      footerNewsletterForm.reset();
    });
  }

  const footerLegalLinks = qsa("[data-footer-modal]");
  if (footerLegalLinks.length) {
    const footerLegalDefs = {
      terms: {
        title: "Terminos de Servicio",
        path: "./frontend/src/components/legal/terms-of-service.html",
      },
      help: {
        title: "Centro de Ayuda",
        path: "./frontend/src/components/legal/help-center.html",
      },
    };

    const modal = document.createElement("div");
    modal.className = "legal-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="legal-modal__backdrop" data-footer-modal-close></div>
      <section class="legal-modal__panel" role="dialog" aria-modal="true" aria-labelledby="footer-legal-title">
        <header class="legal-modal__header">
          <h2 class="legal-modal__title" id="footer-legal-title"></h2>
          <button class="legal-modal__close" type="button" aria-label="Cerrar" data-footer-modal-close>
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>
        <div class="legal-modal__body">
          <div class="legal-modal__scroll legal-modal__content" data-footer-modal-content></div>
        </div>
        <footer class="legal-modal__footer">
          <button class="legal-modal__button" type="button" data-footer-modal-close>Cerrar</button>
        </footer>
      </section>
    `;
    document.body.appendChild(modal);

    const modalTitle = qs("#footer-legal-title", modal);
    const modalContent = qs("[data-footer-modal-content]", modal);
    const closeTargets = qsa("[data-footer-modal-close]", modal);
    let previousOverflow = "";
    const cache = new Map();

    const closeModal = () => {
      modal.classList.remove("legal-modal--open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = previousOverflow;
    };

    const loadMarkup = async (path) => {
      if (cache.has(path)) return cache.get(path);
      const response = await fetch(path, { cache: "no-cache" });
      if (!response.ok) throw new Error("No se pudo cargar el contenido: " + path);
      const html = await response.text();
      cache.set(path, html);
      return html;
    };

    const openModal = async (key) => {
      const definition = footerLegalDefs[key];
      if (!definition || !modalTitle || !modalContent) return;

      try {
        modalTitle.textContent = definition.title;
        modalContent.innerHTML = await loadMarkup(definition.path);
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        modal.classList.add("legal-modal--open");
        modal.setAttribute("aria-hidden", "false");
      } catch (error) {
        console.error(error);
      }
    };

    footerLegalLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const key = link.getAttribute("data-footer-modal");
        openModal(key);
      });
    });

    closeTargets.forEach((target) => {
      target.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }
})();

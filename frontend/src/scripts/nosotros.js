/* =========================================================
  Kin Conecta - Interacciones:
  - Menú móvil
  - Ripple en botones
  - Reveal on scroll
  - Active link por scroll
  - Explora con intención: panel expandible con texto
  - Float cards: balanceo sutil con requestAnimationFrame
  - Custom select (Asunto)
  - Form: validación + toast
========================================================= */
(function () {
  const qs = (sel, parent = document) => parent.querySelector(sel);
  const qsa = (sel, parent = document) =>
    Array.from(parent.querySelectorAll(sel));

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ----------------------------- 1) Menú móvil ----------------------------- */
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

    qsa(".mobile-menu__link", mobileMenu).forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ----------------------------- 2) Ripple ----------------------------- */
  const rippleTargets = qsa(
    ".btn--ripple, .footer__social-btn, .pill, .chip, .social-pill, .toast__close, .pill-panel__close",
  );

  rippleTargets.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";

      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      btn.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 700);
    });
  });

  /* ----------------------------- 3) Reveal on scroll ----------------------------- */
  const revealEls = qsa(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ----------------------------- 4) Active link en navbar por scroll ----------------------------- */
  const navLinks = qsa(".header__link");
  const navTargets = navLinks
    .map((link) => {
      const href = link.getAttribute("href") || "";
      const hashIndex = href.indexOf("#");
      if (hashIndex < 0) return null;

      const base = href.slice(0, hashIndex);
      const id = href.slice(hashIndex + 1);
      if (base && !base.endsWith("aboutus.html")) return null;

      return { link, id };
    })
    .filter(Boolean);

  const sections = ["#inicio", "#explorar", "#nosotros", "#contacto"]
    .map((id) => qs(id))
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((a) => a.classList.remove("header__link--active"));
    const match = navTargets.find((item) => item.id === id);
    if (match) match.link.classList.add("header__link--active");
  };

  const spy = () => {
    const y = window.scrollY + 140;
    let current = sections[0]?.id || "inicio";
    sections.forEach((sec) => {
      if (sec.offsetTop <= y) current = sec.id;
    });
    setActive(current);
  };

  window.addEventListener("scroll", spy, { passive: true });
  spy();

  /* ----------------------------- 5) Explora con intención: panel expandible ----------------------------- */
  const pillPanel = qs("#pillPanel");
  const pillTitle = qs("#pillTitle");
  const pillText = qs("#pillText");
  const pillClose = qs(".pill-panel__close");
  const pills = qsa(".pill[data-pill]");

  const pillCopy = {
    gastro: {
      title: "Gastronomía local",
      text: "Disfruta de la mejor gastronomía local guiado personalmente por nuestros expertos. Descubre mercados, fondas y rutas culinarias con historias y contexto real.",
    },
    naturaleza: {
      title: "Naturaleza & senderos",
      text: "Explora senderos, miradores y paisajes con alguien que conoce el terreno. Rutas seguras, ritmo a tu medida y recomendaciones auténticas fuera de lo típico.",
    },
    arte: {
      title: "Arte & cultura",
      text: "Conecta con la cultura viva: talleres, barrios creativos y espacios culturales. Aprende el trasfondo local con guías que lo viven todos los días.",
    },
    tradiciones: {
      title: "Tradiciones vivas",
      text: "Vive celebraciones y costumbres con respeto y cercanía. Te guiamos para entender el significado detrás de cada tradición y disfrutarla de forma consciente.",
    },
  };

  const openPanel = (key, triggerBtn) => {
    if (!pillPanel || !pillTitle || !pillText) return;
    const data = pillCopy[key];
    if (!data) return;

    pills.forEach((p) => {
      const active = p === triggerBtn;
      p.classList.toggle("is-active", active);
      p.setAttribute("aria-expanded", String(active));
    });

    pillTitle.textContent = data.title;
    pillText.textContent = data.text;

    pillPanel.hidden = false;
    pillPanel.scrollIntoView({
      block: "nearest",
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  const closePanel = () => {
    if (!pillPanel) return;
    pillPanel.hidden = true;
    pills.forEach((p) => {
      p.classList.remove("is-active");
      p.setAttribute("aria-expanded", "false");
    });
  };

  pills.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-pill");
      const isActive = btn.classList.contains("is-active");
      if (isActive) closePanel();
      else openPanel(key, btn);
    });
  });

  if (pillClose) pillClose.addEventListener("click", closePanel);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });

  /* ----------------------------- 6) Float cards: balanceo sutil (JS) ----------------------------- */
  const floatEls = qsa(".js-float");
  if (!prefersReduced && floatEls.length) {
    const base = floatEls.map((el) => ({
      el,
      amp: 6 + Math.random() * 4,
      speed: 0.0012 + Math.random() * 0.0008,
      phase: Math.random() * Math.PI * 2,
      rot: (Math.random() * 2 - 1) * 1.2,
    }));

    const tick = (t) => {
      base.forEach((item) => {
        const y = Math.sin(t * item.speed + item.phase) * item.amp;
        const r = Math.sin(t * (item.speed * 0.9) + item.phase) * item.rot;
        item.el.style.transform = `translateY(${y}px) rotate(${r}deg)`;
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ----------------------------- 7) Custom select (Asunto) ----------------------------- */
  const customSelects = qsa(".select");

  customSelects.forEach((wrap) => {
    const key = wrap.getAttribute("data-select");
    if (!key) return;

    const native = qs(`#${key}`);
    const btn = qs(".select__btn", wrap);
    const valueEl = qs(".select__value", wrap);
    const options = qsa(".select__option", wrap);

    if (!btn || !valueEl || !options.length) return;

    const close = () => {
      wrap.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    };

    const open = () => {
      wrap.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    };

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      wrap.classList.contains("is-open") ? close() : open();
    });

    options.forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        const v = opt.getAttribute("data-value") || opt.textContent.trim();
        valueEl.textContent = v;

        options.forEach((o) => o.classList.remove("is-selected"));
        opt.classList.add("is-selected");

        if (native) native.value = v;
        close();
      });
    });

    document.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    // set inicial desde el select real
    if (native) {
      valueEl.textContent = native.value || valueEl.textContent;
      const initial = options.find(
        (o) =>
          (o.getAttribute("data-value") || o.textContent.trim()) ===
          valueEl.textContent,
      );
      if (initial) initial.classList.add("is-selected");
    }
  });

  /* ----------------------------- 8) Form: validación + toast ----------------------------- */
  const contactSection = qs("#contacto");
  const form = qs(".contact-form", contactSection || document);
  const toast = qs(".toast", contactSection || document);
  const toastClose = qs(".toast__close", contactSection || document);

  const hints = {
    name: qs('[data-hint="name"]', contactSection || document),
    email: qs('[data-hint="email"]', contactSection || document),
    message: qs('[data-hint="message"]', contactSection || document),
  };

  const showHint = (key, msg) => {
    if (!hints[key]) return;
    hints[key].textContent = msg || "";
  };

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

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
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = qs("#name", form)?.value.trim() || "";
      const email = qs("#email", form)?.value.trim() || "";
      const message = qs("#message", form)?.value.trim() || "";

      let ok = true;
      showHint("name", "");
      showHint("email", "");
      showHint("message", "");

      if (name.length < 3) {
        ok = false;
        showHint("name", "Escribe tu nombre (mín. 3 caracteres).");
      }
      if (!isEmail(email)) {
        ok = false;
        showHint("email", "Revisa tu correo (ej. tu@email.com).");
      }
      if (message.length < 10) {
        ok = false;
        showHint("message", "Cuéntanos un poco más (mín. 10 caracteres).");
      }

      if (!ok) return;

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

  const footerModalLinks = qsa("[data-footer-modal]");
  if (footerModalLinks.length) {
    const footerModalDefs = {
      terms: {
        title: "Terminos de Servicio",
        path: "../components/legal/terms-of-service.html",
      },
      help: {
        title: "Centro de Ayuda",
        path: "../components/legal/help-center.html",
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
    const cache = new Map();
    let previousOverflow = "";

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
      const definition = footerModalDefs[key];
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

    footerModalLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openModal(link.getAttribute("data-footer-modal"));
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

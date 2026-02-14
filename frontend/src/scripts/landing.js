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
        showHint("name", "Escribe tu nombre (minimo 3 caracteres).");
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
})();

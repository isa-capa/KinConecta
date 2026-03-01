(function () {
  const sidebarReadyResolvers = [];
  const sidebarReadyPromise = new Promise((resolve) => {
    sidebarReadyResolvers.push(resolve);
  });

  window.__guideSidebarReadyPromise = sidebarReadyPromise;

  function emitSidebarReady() {
    while (sidebarReadyResolvers.length) {
      const resolve = sidebarReadyResolvers.pop();
      resolve?.();
    }
    document.dispatchEvent(new CustomEvent("guide-sidebar:ready"));
  }

  async function fetchMarkup(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error("No se pudo cargar componente: " + path);
    }
    return response.text();
  }

  function normalizePrefix(prefix) {
    if (!prefix) return "";
    return prefix.endsWith("/") ? prefix : prefix + "/";
  }

  function ensureUnderConstructionModalApi() {
    if (window.KCUnderConstruction?.open) return window.KCUnderConstruction;

    const STYLE_ID = "kc-under-construction-style";
    const MODAL_ID = "kcUnderConstructionModal";
    const TITLE_ID = "kcUnderConstructionTitle";
    const DEFAULT_IMAGE_SRC = "../../../assets/en%20construcci%C3%B3n.jpeg";
    // true: card completo con imagen de fondo | false: card tradicional con imagen dentro.
    const USE_IMAGE_CARD_BACKGROUND = false;

    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        .kc-uc {
          position: fixed;
          inset: 0;
          z-index: 2200;
          display: grid;
          place-items: center;
          padding: 18px;
        }
        .kc-uc[hidden] {
          display: none;
        }
        .kc-uc__backdrop {
          position: absolute;
          inset: 0;
          background: rgba(9, 14, 18, 0.52);
          border: 0;
          border-radius: 0;
          margin: 0;
          padding: 0;
          cursor: pointer;
        }
        .kc-uc__dialog {
          position: relative;
          z-index: 1;
          width: min(430px, calc(100vw - 20px));
          background: #f8f8f8;
          border-radius: 20px;
          border: 1px solid var(--kc-border, #d6e1e6);
          box-shadow: none;
          padding: 22px 20px 18px;
          text-align: center;
          color: var(--kc-text, #16232a);
          font-family: var(--kc-font-family, "Spline Sans", system-ui, sans-serif);
          overflow: hidden;
        }
        .kc-uc__dialog > * {
          position: relative;
          z-index: 1;
        }
        .kc-uc__dialog--image-bg {
          background: url("${DEFAULT_IMAGE_SRC}") center center / cover no-repeat;
          border-color: rgba(255, 255, 255, 0.45);
          color: #ffffff;
        }
        .kc-uc__dialog--image-bg::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.22) 0%,
            rgba(12, 23, 29, 0.6) 68%,
            rgba(12, 23, 29, 0.78) 100%
          );
          z-index: 0;
        }
        .kc-uc__dialog--image-bg .kc-uc__image {
          display: none;
        }
        .kc-uc__image {
          width: min(100%, 280px);
          max-height: 280px;
          height: auto;
          object-fit: contain;
          border-radius: 18px;
          display: block;
          margin: 0 auto 14px;
          border: 0;
        }
        .kc-uc__title {
          margin: 0 0 8px;
          font-size: 1.05rem;
          font-weight: 700;
        }
        .kc-uc__dialog--image-bg .kc-uc__title {
          margin-top: 180px;
          color: #ffffff;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
        }
        .kc-uc__text {
          margin: 0;
          font-size: 0.93rem;
          line-height: 1.45;
          color: var(--kc-text-muted, #55656e);
        }
        .kc-uc__dialog--image-bg .kc-uc__text,
        .kc-uc__dialog--image-bg .kc-uc__return {
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .kc-uc__return {
          margin: 4px 0 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--kc-color-sea, #075056);
        }
        .kc-uc__btn {
          margin-top: 14px;
          width: 100%;
          border: 0;
          border-radius: 12px;
          background: var(--kc-color-primary, var(--color-primary, #ff5b04));
          color: #ffffff;
          font-weight: 700;
          padding: 11px 14px;
          cursor: pointer;
        }
        .kc-uc__btn:hover {
          background: var(--kc-color-primary-hover, var(--color-primary-hover, #e65100));
        }
      `;
      document.head.appendChild(style);
    }

    let host = document.getElementById(MODAL_ID);
    if (!host) {
      host = document.createElement("section");
      host.id = MODAL_ID;
      host.className = "kc-uc";
      host.hidden = true;
      host.setAttribute("aria-hidden", "true");
      const dialogClass = USE_IMAGE_CARD_BACKGROUND
        ? "kc-uc__dialog kc-uc__dialog--image-bg"
        : "kc-uc__dialog";
      host.innerHTML = `
        <div class="kc-uc__backdrop" data-kc-uc-close aria-hidden="true"></div>
        <article class="${dialogClass}" role="dialog" aria-modal="true" aria-labelledby="${TITLE_ID}">
          <img class="kc-uc__image" src="${DEFAULT_IMAGE_SRC}" alt="Seccion en construccion" loading="lazy" />
          <h3 class="kc-uc__title" id="${TITLE_ID}">A\u00fan estamos trabajando en esto</h3>
          <p class="kc-uc__text">Queremos que funcione incre\u00edble antes de mostr\u00e1rtelo \uD83C\uDF1E</p>
          <p class="kc-uc__return">\u00a1Vuelve pronto!</p>
          <button class="kc-uc__btn" type="button" data-kc-uc-close>Entendido</button>
        </article>
      `;
      document.body.appendChild(host);
    }

    const close = () => {
      host.hidden = true;
      host.setAttribute("aria-hidden", "true");
      document.body.classList.remove("kc-modal-open");
    };

    const open = () => {
      host.hidden = false;
      host.setAttribute("aria-hidden", "false");
      document.body.classList.add("kc-modal-open");
    };

    if (!host.dataset.bound) {
      host.dataset.bound = "true";
      host.querySelectorAll("[data-kc-uc-close]").forEach((trigger) => {
        trigger.addEventListener("click", close);
      });
      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !host.hidden) close();
      });
    }

    window.KCUnderConstruction = { open, close };
    return window.KCUnderConstruction;
  }

  const AUTH_STORAGE_KEYS = Object.freeze([
    "kc_temp_auth_session_v1",
    "kcAuthMode",
    "kcAuthToken",
    "kcUserRole",
    "kc_guide_id",
    "kc_tourist_id",
    "kcOnboardingRole",
  ]);

  function getSessionSnapshot() {
    try {
      const rawSession = localStorage.getItem("kc_temp_auth_session_v1");
      if (!rawSession) return null;
      const parsed = JSON.parse(rawSession);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (_error) {
      return null;
    }
  }

  function resolveLandingPath() {
    const currentPath = String(window.location.pathname || "").replace(/\\/g, "/").toLowerCase();
    if (currentPath.includes("/frontend/src/pages/")) {
      return "../../../../../index.html";
    }
    return "./index.html";
  }

  async function runLogout() {
    try {
      // TODO(BACKEND): usar endpoint de logout del backend cuando este disponible.
      const maybeLogout = window.KCGuideApi?.auth?.logout;
      if (typeof maybeLogout === "function") {
        await maybeLogout();
      }
    } catch (error) {
      console.warn("Guide logout API fallback enabled:", error);
    } finally {
      AUTH_STORAGE_KEYS.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      window.location.href = resolveLandingPath();
    }
  }

  function bindLogoutTrigger(trigger) {
    if (!trigger || trigger.dataset.logoutBound === "true") return;
    trigger.dataset.logoutBound = "true";
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      void runLogout();
    });
  }

  function setupLogoutActions() {
    const logoutTriggers = [...document.querySelectorAll("#btnLogout, [data-user-logout]")];
    logoutTriggers.forEach(bindLogoutTrigger);
  }

  function setupTopbarUserMenu() {
    const root = document.querySelector("[data-shell-user-menu]");
    if (!root || root.dataset.userMenuReady === "true") return;

    const session = getSessionSnapshot();
    const sidebarUserName = String(document.getElementById("userName")?.textContent || "").trim();
    const fullName = String(session?.fullName || sidebarUserName || "Guia").trim();
    const roleLabel = "GUIA";
    const initials = getInitials(fullName);
    const avatarUrl =
      normalizeAvatarUrl(session?.avatarUrl) ||
      resolveTemporaryAvatar(`guide_menu_${fullName || "kinconecta"}`);
    const avatarMarkup = avatarUrl
      ? `<img src="${escapeHtml(avatarUrl)}" alt="Avatar de ${escapeHtml(fullName)}" loading="lazy" />`
      : escapeHtml(initials);

    root.classList.add("kc-user-menu");
    root.innerHTML = `
      <button class="kc-user-menu__trigger" type="button" aria-haspopup="menu" aria-expanded="false" data-user-menu-trigger>
        <span class="kc-user-menu__avatar">${avatarMarkup}</span>
        <span class="kc-user-menu__meta">
          <span class="kc-user-menu__name">${escapeHtml(fullName)}</span>
          <span class="kc-user-menu__role">${roleLabel}</span>
        </span>
        <span class="material-symbols-outlined kc-user-menu__chevron" aria-hidden="true">expand_more</span>
      </button>
      <div class="kc-user-menu__dropdown" role="menu" hidden>
        <a class="kc-user-menu__item" href="./profileGuide.html" role="menuitem">
          <span class="material-symbols-outlined" aria-hidden="true">person</span>
          <span>Mi perfil</span>
        </a>
        <a class="kc-user-menu__item" href="./helpGuide.html" role="menuitem">
          <span class="material-symbols-outlined" aria-hidden="true">settings</span>
          <span>Ajustes</span>
        </a>
        <div class="kc-user-menu__divider" aria-hidden="true"></div>
        <button class="kc-user-menu__item kc-user-menu__item--danger" type="button" role="menuitem" data-user-logout>
          <span class="material-symbols-outlined" aria-hidden="true">logout</span>
          <span>Cerrar sesi&oacute;n</span>
        </button>
      </div>
    `;

    const trigger = root.querySelector("[data-user-menu-trigger]");
    const dropdown = root.querySelector(".kc-user-menu__dropdown");
    const closeMenu = () => {
      root.classList.remove("kc-user-menu--open");
      trigger?.setAttribute("aria-expanded", "false");
      dropdown?.setAttribute("hidden", "hidden");
    };
    const openMenu = () => {
      root.classList.add("kc-user-menu--open");
      trigger?.setAttribute("aria-expanded", "true");
      dropdown?.removeAttribute("hidden");
    };

    trigger?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (root.classList.contains("kc-user-menu--open")) {
        closeMenu();
        return;
      }
      openMenu();
    });

    dropdown?.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    document.addEventListener("click", (event) => {
      if (!root.contains(event.target)) closeMenu();
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    root.dataset.userMenuReady = "true";
  }

  function isNetworkUnavailableError(error) {
    return Boolean(error?.isNetworkError || error?.isApiUnavailable);
  }

  function hydrateSidebar(sidebar, activeKey, pagesPrefix, assetsPrefix) {
    const links = sidebar.querySelectorAll("[data-href]");
    links.forEach((link) => {
      const target = link.getAttribute("data-href");
      if (target) {
        link.setAttribute("href", normalizePrefix(pagesPrefix) + target);
      }
    });

    const logo = sidebar.querySelector("[data-asset-path]");
    if (logo) {
      const assetPath = logo.getAttribute("data-asset-path");
      logo.setAttribute("src", normalizePrefix(assetsPrefix) + assetPath);
    }

    if (activeKey) {
      const active = sidebar.querySelector(`[data-nav-key="${activeKey}"]`);
      if (active) active.classList.add("sidebar__link--active");
    }

    const chatTrigger = sidebar.querySelector("[data-chat-open]");
    if (chatTrigger) {
      chatTrigger.addEventListener("click", (event) => {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("guide-chat:open"));
      });
    }
  }

  function isMobileDrawerMode() {
    return window.matchMedia("(max-width: 767px)").matches;
  }

  function createMobileSidebarFallbackToggle() {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", "Abrir men\u00fa");
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = '<span class="material-symbols-outlined">menu</span>';

    const breadcrumb = document.querySelector(".topbar .breadcrumb");
    if (breadcrumb) {
      button.className = "topbar__menu-btn sidebar-toggle-fallback";
      breadcrumb.prepend(button);
      return button;
    }

    const topbar = document.querySelector(".topbar");
    if (topbar) {
      button.className = "topbar__menu-btn sidebar-toggle-fallback";
      topbar.prepend(button);
      return button;
    }

    button.className = "guide-sidebar-toggle";
    document.body.appendChild(button);
    return button;
  }

  function setupResponsiveSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    const triggers = [
      ...document.querySelectorAll(
        "#btnSidebar, .topbar__menu-btn, .menu-button, [data-sidebar-open]",
      ),
    ];

    if (!triggers.length) {
      triggers.push(createMobileSidebarFallbackToggle());
    }

    let backdrop = document.getElementById("backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "backdrop";
      backdrop.id = "guideSidebarBackdrop";
      backdrop.hidden = true;
      document.body.appendChild(backdrop);
    }

    const setExpanded = (value) => {
      triggers.forEach((trigger) => {
        trigger.setAttribute("aria-expanded", value ? "true" : "false");
      });
    };

    const openSidebar = () => {
      if (!isMobileDrawerMode()) return;
      sidebar.classList.add("sidebar--open");
      backdrop.hidden = false;
      setExpanded(true);
    };

    const closeSidebar = () => {
      sidebar.classList.remove("sidebar--open");
      backdrop.hidden = true;
      setExpanded(false);
    };

    const toggleSidebar = (event) => {
      event?.preventDefault();
      if (!isMobileDrawerMode()) return;
      const isOpen = sidebar.classList.contains("sidebar--open");
      isOpen ? closeSidebar() : openSidebar();
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", toggleSidebar);
    });

    backdrop.addEventListener("click", closeSidebar);

    window.addEventListener("resize", () => {
      if (!isMobileDrawerMode()) closeSidebar();
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeSidebar();
    });
  }

  async function mountSidebar() {
    const mount = document.querySelector("[data-guide-sidebar]");
    if (!mount) {
      emitSidebarReady();
      return;
    }

    try {
      const componentPath = mount.getAttribute("data-component-path");
      const pagesPrefix = mount.getAttribute("data-pages-prefix") || "";
      const assetsPrefix = mount.getAttribute("data-assets-prefix") || "";
      const activeKey = mount.getAttribute("data-guide-active") || "";
      const markup = await fetchMarkup(componentPath);

      mount.insertAdjacentHTML("beforebegin", markup);
      mount.remove();

      const sidebar = document.getElementById("sidebar");
      if (sidebar) {
        hydrateSidebar(sidebar, activeKey, pagesPrefix, assetsPrefix);
      }
    } catch (error) {
      console.error(error);
    } finally {
      emitSidebarReady();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeAvatarUrl(raw) {
    const value = String(raw || "").trim();
    if (!value) return "";
    return value;
  }

  function getInitials(name) {
    const tokens = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!tokens.length) return "US";
    const first = tokens[0][0] || "";
    const second = tokens.length > 1 ? tokens[1][0] : tokens[0][1] || "";
    return `${first}${second}`.toUpperCase();
  }

  function resolveTemporaryAvatar(seed) {
    const normalizedSeed = encodeURIComponent(String(seed || "kinconecta"));
    return `https://i.pravatar.cc/120?u=${normalizedSeed}`;
  }

  function setAvatarElement(avatarRoot, profile) {
    if (!avatarRoot) return;
    const avatarImage = avatarRoot.querySelector(".guide-chat__thread-avatar-img");
    const avatarFallback = avatarRoot.querySelector(".guide-chat__thread-avatar-fallback");
    const avatarUrl = normalizeAvatarUrl(profile?.avatarUrl);
    const initials = getInitials(profile?.name || profile?.initials);

    if (avatarFallback) {
      avatarFallback.textContent = initials;
      avatarFallback.hidden = Boolean(avatarUrl);
    }

    if (!avatarImage) return;
    if (!avatarUrl) {
      avatarImage.hidden = true;
      avatarImage.removeAttribute("src");
      return;
    }

    avatarImage.src = avatarUrl;
    avatarImage.hidden = false;
    avatarImage.onerror = () => {
      avatarImage.hidden = true;
      avatarImage.removeAttribute("src");
      if (avatarFallback) avatarFallback.hidden = false;
    };
  }

  function renderMessages(messagesEl, messages, resolveMessageAuthor) {
    messagesEl.innerHTML = messages
      .map((item, index) => {
        const from = item?.from === "guide" ? "guide" : "guest";
        const author = resolveMessageAuthor(from, item, index) || {};
        const avatarUrl = normalizeAvatarUrl(author.avatarUrl);
        const avatarName = author.name || author.initials || "Usuario";
        const avatarFallback = getInitials(avatarName);
        const avatarMarkup = avatarUrl
          ? `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(avatarName)}" loading="lazy" />`
          : `<span class="guide-chat__message-avatar-fallback">${escapeHtml(avatarFallback)}</span>`;

        return `
          <div class="guide-chat__message guide-chat__message--${from}">
            <span class="guide-chat__message-avatar">${avatarMarkup}</span>
            <div class="guide-chat__bubble guide-chat__bubble--${from}">${escapeHtml(item?.text || "")}</div>
          </div>
        `;
      })
      .join("");
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setupChatWidget(container) {
    const root = container.querySelector("[data-guide-chat]");
    if (!root) return;

    const panel = root.querySelector(".guide-chat__panel");
    const launcher = root.querySelector(".guide-chat__launcher");
    const closeBtn = root.querySelector(".guide-chat__close");
    const threads = [...root.querySelectorAll(".guide-chat__thread")];
    const messagesEl = root.querySelector("[data-guide-chat-messages]");
    const form = root.querySelector("[data-guide-chat-form]");
    const input = form?.querySelector(".guide-chat__input");
    const backBtn = root.querySelector("[data-chat-back]");
    const activeTitle = root.querySelector("[data-chat-active-title]");

    const threadData = {
      maria: [
        { from: "guest", text: "Hola Carlos, ¿podemos mover el tour una hora?" },
        { from: "guide", text: "Claro, lo ajusto para iniciar a las 10:00." },
      ],
      alejandro: [
        { from: "guest", text: "Te confirmé para mañana." },
        { from: "guide", text: "Perfecto. Nos vemos en el punto acordado." },
      ],
    };
    const threadIdsByKey = {};
    const threadProfiles = {
      maria: {
        name: "María R.",
        avatarUrl: resolveTemporaryAvatar("guide_maria"),
      },
      alejandro: {
        name: "Alejandro M.",
        avatarUrl: resolveTemporaryAvatar("guide_alejandro"),
      },
    };

    const currentUserProfile = (() => {
      let displayName = "Guía";
      try {
        const raw = localStorage.getItem("kc_temp_auth_session_v1");
        const session = raw ? JSON.parse(raw) : null;
        if (session?.fullName) displayName = session.fullName;
      } catch (_error) {
        // Fallback a texto por defecto.
      }
      return {
        name: displayName,
        avatarUrl: resolveTemporaryAvatar(`guide_${displayName}`),
      };
    })();

    let activeThread = "maria";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const CHAT_ANIMATION_MS = prefersReducedMotion ? 0 : 340;
    let closeTimer = null;

    const isMobileChatMode = () => window.matchMedia("(max-width: 767px)").matches;
    const setMobileView = (mode) => {
      root.classList.remove("guide-chat--mobile-view-threads", "guide-chat--mobile-view-conversation");
      if (!isMobileChatMode()) return;
      root.classList.add(
        mode === "conversation"
          ? "guide-chat--mobile-view-conversation"
          : "guide-chat--mobile-view-threads",
      );
    };

    const updateActiveTitle = (threadKey) => {
      if (!activeTitle) return;
      const profile = threadProfiles[threadKey];
      activeTitle.textContent = profile?.name || "Selecciona un chat";
    };

    const applyThreadVisual = (threadButton, profile) => {
      if (!threadButton) return;
      const nameNode = threadButton.querySelector(".guide-chat__thread-name");
      if (nameNode && profile?.name) {
        nameNode.textContent = profile.name;
      }
      const avatarRoot = threadButton.querySelector("[data-thread-avatar]");
      setAvatarElement(avatarRoot, profile);
    };

    const resolveMessageAuthor = (from, item) => {
      if (normalizeAvatarUrl(item?.avatarUrl)) {
        return {
          name: item?.authorName || item?.senderName || "Usuario",
          avatarUrl: item.avatarUrl,
        };
      }
      if (from === "guide") return currentUserProfile;
      return threadProfiles[activeThread] || { name: "Turista", avatarUrl: "" };
    };

    const mapMessageFromApi = (item) => ({
      from:
        item.senderRole === "guide" ||
        item.from === "guide" ||
        item.authorRole === "GUIDE"
          ? "guide"
          : "guest",
      text: item.text || item.message || "",
      authorName: item.senderName || item.authorName || "",
      avatarUrl:
        item.senderAvatarUrl ||
        item.avatarUrl ||
        item.authorAvatarUrl ||
        item.profileImageUrl ||
        "",
    });

    const hydrateMessagesForThread = async (threadKey) => {
      const apiThreadId = threadIdsByKey[threadKey];
      if (!apiThreadId || !window.KCGuideApi) return;

      try {
        const response = await window.KCGuideApi.chat.listMessages(apiThreadId, {
          page: 0,
          size: 50,
        });
        const items = response?.data?.items || response?.data || [];
        if (Array.isArray(items)) {
          threadData[threadKey] = items.map(mapMessageFromApi);
        }
      } catch (error) {
        if (isNetworkUnavailableError(error)) return;
        console.warn("Chat messages fallback enabled:", error);
      }
    };

    const resolveAvatarFromThreadApi = (threadItem, index) => {
      const fromApi =
        threadItem.touristAvatarUrl ||
        threadItem.avatarUrl ||
        threadItem.photoUrl ||
        threadItem.profileImageUrl ||
        threadItem.imageUrl;
      return normalizeAvatarUrl(fromApi) || resolveTemporaryAvatar(`guide_thread_${index}`);
    };

    const hydrateThreadsFromApi = async () => {
      // TODO(BACKEND): endpoint final de threads por guía y paginación.
      // TODO(BACKEND): agregar unreadCount por hilo y ultimo mensaje.
      if (!window.KCGuideApi) return;
      try {
        const response = await window.KCGuideApi.chat.listThreads();
        const items = response?.data?.items || response?.data || [];
        if (!Array.isArray(items) || !items.length) return;

        items.slice(0, threads.length).forEach((threadItem, index) => {
          const localKey = `thread_${index}`;
          const threadButton = threads[index];
          if (!threadButton) return;

          threadButton.dataset.thread = localKey;
          threadIdsByKey[localKey] = threadItem.id;
          threadData[localKey] = [];

          const profile = {
            name: threadItem.title || threadItem.touristName || "Turista",
            avatarUrl: resolveAvatarFromThreadApi(threadItem, index),
          };
          threadProfiles[localKey] = profile;
          applyThreadVisual(threadButton, profile);

          const snippetNode = threadButton.querySelector(".guide-chat__thread-snippet");
          if (snippetNode) {
            snippetNode.textContent =
              threadItem.lastMessage || threadItem.lastMessagePreview || "Sin mensajes";
          }
        });

        const firstKey = threads[0]?.dataset.thread;
        if (firstKey) {
          activeThread = firstKey;
          await setThread(firstKey, { switchMobileView: false });
        }
      } catch (error) {
        if (isNetworkUnavailableError(error)) return;
        console.warn("Chat threads fallback enabled:", error);
      }
    };

    threads.forEach((threadButton, index) => {
      const key = threadButton.dataset.thread;
      const nameNode = threadButton.querySelector(".guide-chat__thread-name");
      const profileName = nameNode?.textContent?.trim() || `Chat ${index + 1}`;
      if (!threadProfiles[key]) {
        threadProfiles[key] = {
          name: profileName,
          avatarUrl: resolveTemporaryAvatar(`guide_${key}`),
        };
      }
      applyThreadVisual(threadButton, threadProfiles[key]);
    });

    const clearCloseTimer = () => {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }
    };

    const openChat = (options) => {
      const config = options || {};
      clearCloseTimer();
      panel.removeAttribute("hidden");
      panel.setAttribute("aria-hidden", "false");
      requestAnimationFrame(() => {
        root.classList.add("guide-chat--open");
      });
      setMobileView(config.mobileView || "threads");
      if (!isMobileChatMode()) {
        input?.focus();
      }
    };

    const closeChat = () => {
      clearCloseTimer();
      root.classList.remove("guide-chat--open");
      panel.setAttribute("aria-hidden", "true");
      closeTimer = window.setTimeout(() => {
        if (!root.classList.contains("guide-chat--open")) {
          panel.setAttribute("hidden", "hidden");
        }
      }, CHAT_ANIMATION_MS);
    };

    const setThread = async (threadKey, options) => {
      const config = options || {};
      activeThread = threadKey;
      threads.forEach((thread) => {
        thread.classList.toggle("is-active", thread.dataset.thread === threadKey);
      });

      // En mobile cambiamos de vista inmediatamente (antes de esperar API)
      // para replicar el comportamiento fluido del chat de turista.
      const shouldSwitchMobileView = config.switchMobileView !== false;
      if (shouldSwitchMobileView) {
        setMobileView("conversation");
      }

      const hasMessages = Array.isArray(threadData[threadKey]) && threadData[threadKey].length > 0;
      if (!hasMessages) {
        await hydrateMessagesForThread(threadKey);
      }
      updateActiveTitle(threadKey);
      renderMessages(messagesEl, threadData[threadKey] || [], resolveMessageAuthor);
    };

    launcher?.addEventListener("click", () => {
      const isOpen = root.classList.contains("guide-chat--open");
      isOpen ? closeChat() : openChat({ mobileView: "threads" });
    });

    const handleClose = (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeChat();
    };

    closeBtn?.addEventListener("pointerdown", handleClose);
    closeBtn?.addEventListener("click", handleClose);

    threads.forEach((thread) => {
      thread.addEventListener("click", () => {
        setThread(thread.dataset.thread);
        openChat({ mobileView: "conversation" });
      });
    });

    backBtn?.addEventListener("click", () => {
      setMobileView("threads");
    });

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const text = input?.value.trim();
      if (!text) return;

      const apiThreadId = threadIdsByKey[activeThread];
      try {
        if (window.KCGuideApi && apiThreadId) {
          // TODO(BACKEND): endpoint final POST /guide/chat/threads/{threadId}/messages
          await window.KCGuideApi.chat.sendMessage(apiThreadId, { message: text });
        }
      } catch (error) {
        if (isNetworkUnavailableError(error)) return;
        console.warn("Send message pending backend implementation:", error);
      }

      const collection = threadData[activeThread] || [];
      collection.push({ from: "guide", text });
      threadData[activeThread] = collection;
      renderMessages(messagesEl, collection, resolveMessageAuthor);
      input.value = "";
    });

    window.addEventListener("guide-chat:open", () => openChat({ mobileView: "threads" }));
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeChat();
    });

    // Abridores externos del chat (evitamos [aria-label="Mensajes"] porque
    // coincide con el panel del widget y en mobile reinicia la vista a lista).
    const extraOpeners = [...document.querySelectorAll("[data-open-guide-chat], #btnChatGuide, #btnChat")].filter(
      (trigger) => !trigger.closest("[data-guide-chat]"),
    );
    extraOpeners.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        openChat({ mobileView: "threads" });
      });
    });

    root.classList.remove("guide-chat--open");
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("hidden", "hidden");
    setMobileView("threads");
    setThread(activeThread, { switchMobileView: false });
    hydrateThreadsFromApi();
  }

  async function mountChatWidget() {
    const mount = document.querySelector("[data-guide-chat-widget]");
    if (!mount) return;

    try {
      const componentPath = mount.getAttribute("data-component-path");
      const markup = await fetchMarkup(componentPath);
      mount.insertAdjacentHTML("beforebegin", markup);
      mount.remove();
      setupChatWidget(document);
    } catch (error) {
      console.error(error);
    }
  }

  function createNotificationsPopover() {
    const panel = document.createElement("section");
    panel.className = "guide-notifications";
    panel.setAttribute("hidden", "hidden");
    panel.setAttribute("aria-label", "Notificaciones");
    panel.innerHTML = `
      <header class="guide-notifications__header">
        <p class="guide-notifications__title">Notificaciones</p>
        <span class="guide-notifications__count">0</span>
      </header>
      <ul class="guide-notifications__list"></ul>
    `;
    document.body.appendChild(panel);
    return panel;
  }

  function setupNotifications() {
    ensureUnderConstructionModalApi();
    const openUnderConstruction = () => {
      window.KCUnderConstruction?.open?.();
    };

    const triggers = [
      ...document.querySelectorAll(
        "#btnNotif, .topbar__notif, .notification-button, .icon-btn[aria-label='Notificaciones'], [data-notifications-trigger]",
      ),
    ];
    if (!triggers.length) return;

    const panel = createNotificationsPopover();
    const countEl = panel.querySelector(".guide-notifications__count");
    const listEl = panel.querySelector(".guide-notifications__list");
    let isOpen = false;
    let notifications = [
      {
        id: "ntf_1",
        title: "Te calificaron recientemente",
        meta: "Hace 5 min",
        read: false,
      },
      {
        id: "ntf_2",
        title: "Nueva reserva confirmada",
        meta: "Hace 18 min",
        read: false,
      },
      {
        id: "ntf_3",
        title: "Un turista te envi\u00f3 un mensaje",
        meta: "Hace 40 min",
        read: true,
      },
    ];

    const renderNotifications = () => {
      const unreadCount = notifications.filter((item) => !item.read).length;
      if (countEl) countEl.textContent = String(unreadCount);
      if (!listEl) return;

      listEl.innerHTML = notifications
        .map(
          (item) => `
            <li class="guide-notifications__item" data-notification-id="${item.id}">
              <p class="guide-notifications__item-title">${item.title}</p>
              <p class="guide-notifications__item-meta">${item.meta}</p>
            </li>
          `,
        )
        .join("");
    };

    const mapNotification = (item) => ({
      id: item.id,
      title: item.title || item.message || "Notificaci\u00f3n",
      meta: item.dateLabel || item.relativeTime || "Reciente",
      read: Boolean(item.read || item.isRead),
    });

    const hydrateNotificationsFromApi = async () => {
      // TODO(API): mantener sincronizado con backend (polling o websocket).
      if (!window.KCGuideApi) return;
      try {
        const response = await window.KCGuideApi.notifications.list();
        const items = response?.data?.items || response?.data || [];
        if (Array.isArray(items)) {
          notifications = items.map(mapNotification);
          renderNotifications();
        }
      } catch (error) {
        if (isNetworkUnavailableError(error)) return;
        console.warn("Notifications API fallback enabled:", error);
      }
    };

    const placePanel = (trigger) => {
      const rect = trigger.getBoundingClientRect();
      const panelWidth = 320;
      const left = Math.max(
        12,
        Math.min(window.innerWidth - panelWidth - 12, rect.right - panelWidth),
      );
      const top = rect.bottom + 10;
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
    };

    const open = async (trigger) => {
      placePanel(trigger);
      panel.removeAttribute("hidden");
      panel.classList.add("guide-notifications--open");
      isOpen = true;
      await hydrateNotificationsFromApi();
      renderNotifications();
    };

    const close = () => {
      panel.classList.remove("guide-notifications--open");
      panel.setAttribute("hidden", "hidden");
      isOpen = false;
    };

    const markAsRead = async (notificationId) => {
      const target = notifications.find((item) => item.id === notificationId);
      if (!target || target.read) return;
      target.read = true;
      renderNotifications();
      try {
        if (window.KCGuideApi) {
          // TODO(API): usar endpoint real PATCH /guide/notifications/{id}/read
          await window.KCGuideApi.notifications.markAsRead(notificationId);
        }
      } catch (error) {
        if (isNetworkUnavailableError(error)) return;
        console.warn("Mark notification as read pending backend implementation:", error);
      }
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (isOpen) {
          close();
          return;
        }
        open(trigger);
      });
    });

    panel.addEventListener("click", (event) => {
      const item = event.target.closest("[data-notification-id]");
      if (item) {
        markAsRead(item.getAttribute("data-notification-id"));
        close();
        openUnderConstruction();
      }
      event.stopPropagation();
    });

    window.addEventListener("resize", () => {
      if (!isOpen) return;
      const firstTrigger = triggers[0];
      if (firstTrigger) placePanel(firstTrigger);
    });

    document.addEventListener("click", close);
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });

    renderNotifications();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    ensureUnderConstructionModalApi();
    await mountSidebar();
    setupResponsiveSidebar();
    setupTopbarUserMenu();
    setupLogoutActions();
    await mountChatWidget();
    setupNotifications();
  });
})();


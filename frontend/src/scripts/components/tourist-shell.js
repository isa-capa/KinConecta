(function () {
  const sidebarReadyResolvers = [];
  const sidebarReadyPromise = new Promise((resolve) => {
    sidebarReadyResolvers.push(resolve);
  });

  window.__touristSidebarReadyPromise = sidebarReadyPromise;

  function emitSidebarReady() {
    while (sidebarReadyResolvers.length) {
      const resolve = sidebarReadyResolvers.pop();
      resolve?.();
    }
    document.dispatchEvent(new CustomEvent("tourist-sidebar:ready"));
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
  }

  function isMobileDrawerMode() {
    return window.matchMedia("(max-width: 767px)").matches;
  }

  function createMobileSidebarFallbackToggle() {
    const button = document.createElement("button");
    button.className = "tourist-sidebar-toggle";
    button.type = "button";
    button.setAttribute("aria-label", "Abrir men\u00fa");
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = '<span class="material-symbols-outlined">menu</span>';
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
      backdrop.id = "touristSidebarBackdrop";
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
    const mount = document.querySelector("[data-tourist-sidebar]");
    if (!mount) {
      emitSidebarReady();
      return;
    }

    try {
      const componentPath = mount.getAttribute("data-component-path");
      const pagesPrefix = mount.getAttribute("data-pages-prefix") || "";
      const assetsPrefix = mount.getAttribute("data-assets-prefix") || "";
      const activeKey = mount.getAttribute("data-tourist-active") || "";
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
        { from: "guest", text: "Hola, me gustaría confirmar el punto de encuentro." },
        { from: "guide", text: "Claro, te comparto la ubicación exacta en un momento." },
      ],
      alejandro: [
        { from: "guest", text: "Gracias por la recomendación del itinerario." },
        { from: "guide", text: "Con gusto. Si quieres ajustamos horarios." },
      ],
    };
    const threadIdsByKey = {};
    const threadProfiles = {
      maria: {
        name: "María R.",
        avatarUrl: resolveTemporaryAvatar("tourist_maria"),
      },
      alejandro: {
        name: "Alejandro M.",
        avatarUrl: resolveTemporaryAvatar("tourist_alejandro"),
      },
    };

    const currentUserProfile = (() => {
      let displayName = "Tu";
      try {
        const raw = localStorage.getItem("kc_temp_auth_session_v1");
        const session = raw ? JSON.parse(raw) : null;
        if (session?.fullName) displayName = session.fullName;
      } catch (_error) {
        // Fallback a texto por defecto.
      }
      return {
        name: displayName,
        avatarUrl: resolveTemporaryAvatar(`tourist_${displayName}`),
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

    const resolveMessageAuthor = (from) => {
      if (from === "guide") return currentUserProfile;
      return threadProfiles[activeThread] || { name: "Guía local", avatarUrl: "" };
    };

    const hydrateMessagesForThread = async (threadKey) => {
      const apiThreadId = threadIdsByKey[threadKey];
      // TODO(BACKEND): habilitar KCTouristApi.chat.listMessages(threadId, query).
      if (!apiThreadId || !window.KCTouristApi?.chat?.listMessages) return;

      try {
        const response = await window.KCTouristApi.chat.listMessages(apiThreadId, { page: 0, size: 50 });
        const items = response?.data?.items || response?.data || [];
        if (Array.isArray(items)) {
          threadData[threadKey] = items.map((item) => ({
            from:
              item.senderRole === "tourist" ||
              item.from === "guide" ||
              item.authorRole === "TOURIST"
                ? "guide"
                : "guest",
            text: item.text || item.message || "",
          }));
        }
      } catch (error) {
        console.warn("Chat messages fallback enabled:", error);
      }
    };

    const resolveAvatarFromThreadApi = (threadItem, index) => {
      const fromApi =
        threadItem.avatarUrl ||
        threadItem.touristAvatarUrl ||
        threadItem.photoUrl ||
        threadItem.profileImageUrl ||
        threadItem.imageUrl;
      return normalizeAvatarUrl(fromApi) || resolveTemporaryAvatar(`tourist_thread_${index}`);
    };

    const hydrateThreadsFromApi = async () => {
      // TODO(BACKEND): habilitar KCTouristApi.chat.listThreads().
      if (!window.KCTouristApi?.chat?.listThreads) return;

      try {
        const response = await window.KCTouristApi.chat.listThreads();
        const items = response?.data?.items || response?.data || [];
        if (!Array.isArray(items) || !items.length) return;

        items.slice(0, threads.length).forEach((threadItem, index) => {
          const threadButton = threads[index];
          if (!threadButton) return;

          const localKey = `thread_${index}`;
          threadButton.dataset.thread = localKey;
          threadIdsByKey[localKey] = threadItem.id;
          threadData[localKey] = [];

          const profile = {
            name: threadItem.title || threadItem.guideName || "Guía local",
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
          await setThread(firstKey);
        }
      } catch (error) {
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
          avatarUrl: resolveTemporaryAvatar(`tourist_${key}`),
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
      if (isMobileChatMode()) {
        setMobileView(config.mobileView || "threads");
      } else {
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

    const setThread = async (threadKey) => {
      activeThread = threadKey;
      threads.forEach((thread) => {
        thread.classList.toggle("is-active", thread.dataset.thread === threadKey);
      });
      if (!threadData[threadKey]) {
        await hydrateMessagesForThread(threadKey);
      }
      updateActiveTitle(threadKey);
      renderMessages(messagesEl, threadData[threadKey] || [], resolveMessageAuthor);
      if (isMobileChatMode()) setMobileView("conversation");
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
        // TODO(BACKEND): habilitar KCTouristApi.chat.sendMessage(threadId, payload).
        if (window.KCTouristApi?.chat?.sendMessage && apiThreadId) {
          await window.KCTouristApi.chat.sendMessage(apiThreadId, { message: text });
        }
      } catch (error) {
        console.warn("Send message pending backend implementation:", error);
      }

      const collection = threadData[activeThread] || [];
      collection.push({ from: "guide", text });
      threadData[activeThread] = collection;
      renderMessages(messagesEl, collection, resolveMessageAuthor);
      input.value = "";
    });

    window.addEventListener("tourist-chat:open", () => openChat({ mobileView: "threads" }));
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeChat();
    });

    const extraOpeners = document.querySelectorAll(
      "#btnChat, [aria-label='Chat'], [data-open-tourist-chat]",
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
    setThread(activeThread);
    hydrateThreadsFromApi();
  }

  async function mountChatWidget() {
    const mount = document.querySelector("[data-tourist-chat-widget]");
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
    const triggers = [
      ...document.querySelectorAll(
        "#btnNotif, .topbar__notif, .notification-button, [data-notifications-trigger]",
      ),
    ];
    if (!triggers.length) return;

    const panel = createNotificationsPopover();
    const countEl = panel.querySelector(".guide-notifications__count");
    const listEl = panel.querySelector(".guide-notifications__list");
    let isOpen = false;
    let notifications = [
      { id: "ntf_1", title: "Tienes una nueva propuesta de viaje", meta: "Hace 5 min", read: false },
      { id: "ntf_2", title: "Un gu\u00eda respondi\u00f3 tu consulta", meta: "Hace 22 min", read: false },
      { id: "ntf_3", title: "Actualizaci\u00f3n de reserva", meta: "Hace 1 h", read: true },
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
      // TODO(API): reemplazar polling por websocket cuando backend lo habilite.
      if (!window.KCTouristApi) return;
      try {
        const response = await window.KCTouristApi.notifications.list();
        const items = response?.data?.items || response?.data || [];
        if (Array.isArray(items)) {
          notifications = items.map(mapNotification);
          renderNotifications();
        }
      } catch (error) {
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
        if (window.KCTouristApi) {
          await window.KCTouristApi.notifications.markAsRead(notificationId);
        }
      } catch (error) {
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
    await mountSidebar();
    setupResponsiveSidebar();
    await mountChatWidget();
    setupNotifications();
  });
})();


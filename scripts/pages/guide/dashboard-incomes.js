/* =========================================================
   Guia - Ingresos
   Base lista para integrar Spring Boot REST API.
   ========================================================= */

const GuideIncomesApp = (() => {
  const isNetworkUnavailableError = (error) =>
    Boolean(error?.isNetworkError || error?.isApiUnavailable);

  const openUnderConstructionModal = () => {
    if (window.KCUnderConstruction?.open) {
      window.KCUnderConstruction.open();
      return;
    }
    window.alert("Aun estamos trabajando en esto.");
  };

  const state = {
    guideId: null,
    currentUser: null,
    selectedRange: "all",
    kpis: {
      monthlyIncome: 0,
      monthlyIncomeDelta: "Sin variación",
      monthlyIncomeDeltaLabel: "Sin datos suficientes",
      pendingPayouts: 0,
      pendingPayoutsLabel: "Sin retiros pendientes",
      totalWithdrawn: 0,
      totalWithdrawnDelta: "Sin variación",
      totalWithdrawnDeltaLabel: "Sin historial suficiente",
    },
    chart: [],
    transactions: [],
  };

  const dom = {
    pageTitle: null,
    pageSubtitle: null,
    sidebarUserName: null,
    lastUpdatedAt: null,
    btnDownloadReport: null,
    btnWithdrawFunds: null,
    kpiMonthlyIncome: null,
    kpiMonthlyIncomeDelta: null,
    kpiMonthlyIncomeDeltaLabel: null,
    kpiPendingPayouts: null,
    kpiPendingPayoutsLabel: null,
    kpiTotalWithdrawn: null,
    kpiTotalWithdrawnDelta: null,
    kpiTotalWithdrawnDeltaLabel: null,
    chartButtons: [],
    incomeChart: null,
    transactionsSearchInput: null,
    btnOpenTransactionsFilter: null,
    transactionsTableBody: null,
    btnViewAllTransactions: null,
  };

  const money = (amount) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const loadingMarkup = (label) => `
    <div class="guide-loading guide-loading--compact" role="status" aria-live="polite" aria-busy="true">
      <span class="guide-loading__spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `;

  const mapStatusBadgeClass = (status) => {
    const raw = String(status || "").toLowerCase();
    if (raw.includes("pend")) return "yellow";
    if (raw.includes("complet") || raw.includes("pagad")) return "green";
    return "gray";
  };

  function getCurrentGuideId() {
    const direct = window.localStorage.getItem("kc_guide_id");
    const directDigits = String(direct || "").match(/\d+/g);
    const directParsed = Number(directDigits ? directDigits.join("") : direct);
    if (Number.isFinite(directParsed) && directParsed > 0) return directParsed;

    try {
      const rawSession = window.localStorage.getItem("kc_temp_auth_session_v1");
      const session = rawSession ? JSON.parse(rawSession) : null;
      const role = String(session?.role || "").trim().toLowerCase();
      const digits = String(session?.userId || "").match(/\d+/g);
      const parsed = Number(digits ? digits.join("") : session?.userId);
      if (role === "guide" && Number.isFinite(parsed) && parsed > 0) {
        window.localStorage.setItem("kc_guide_id", String(parsed));
        return parsed;
      }
    } catch (error) {
      console.warn("No se pudo resolver el guideId desde la sesion local.", error);
    }

    return null;
  }

  async function hydrateCurrentUser() {
    state.guideId = getCurrentGuideId();
    if (!window.KCGuideApi?.profile?.getPublicProfile || !state.guideId) return;

    try {
      const response = await window.KCGuideApi.profile.getPublicProfile(state.guideId);
      const profile = response?.data || {};
      const name = String(profile.fullName || profile.name || "").trim();
      if (!name) return;

      state.currentUser = {
        name,
        location: String(profile.locationLabel || profile.location || "").trim(),
      };

      try {
        const rawSession = window.localStorage.getItem("kc_temp_auth_session_v1");
        const session = rawSession ? JSON.parse(rawSession) : {};
        window.localStorage.setItem(
          "kc_temp_auth_session_v1",
          JSON.stringify({
            ...session,
            role: "guide",
            userId: String(state.guideId),
            fullName: name,
          }),
        );
      } catch (error) {
        console.warn("No se pudo actualizar la sesion local con el nombre del guia.", error);
      }
    } catch (error) {
      console.warn("No se pudo cargar el usuario actual en ingresos desde API.", error);
    }
  }

  function renderCurrentUser() {
    if (dom.sidebarUserName && state.currentUser?.name) {
      dom.sidebarUserName.textContent = state.currentUser.name;
    }
    if (dom.pageTitle) {
      dom.pageTitle.textContent = state.currentUser?.name
        ? `Ingresos de ${state.currentUser.name}`
        : "Ingresos";
    }
    if (dom.pageSubtitle) {
      dom.pageSubtitle.textContent = state.currentUser?.location
        ? `Consulta tus movimientos y retiros desde ${state.currentUser.location}.`
        : "Consulta tus movimientos y retiros.";
    }
  }

  const renderLoadingState = () => {
    if (dom.pageTitle) dom.pageTitle.textContent = "Ingresos";
    if (dom.pageSubtitle) dom.pageSubtitle.textContent = "Cargando informacion del guia...";

    if (dom.incomeChart) {
      dom.incomeChart.innerHTML = loadingMarkup("Cargando resumen...");
    }

    if (dom.transactionsTableBody) {
      dom.transactionsTableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="guide-loading guide-loading--compact guide-loading--table" role="status" aria-live="polite" aria-busy="true">
              <span class="guide-loading__spinner" aria-hidden="true"></span>
              <span>Cargando transacciones...</span>
            </div>
          </td>
        </tr>
      `;
    }

    if (dom.lastUpdatedAt) {
      dom.lastUpdatedAt.textContent = "Cargando datos...";
    }
  };

  const renderKpis = () => {
    dom.kpiMonthlyIncome.textContent = money(state.kpis.monthlyIncome);
    dom.kpiMonthlyIncomeDelta.textContent = state.kpis.monthlyIncomeDelta;
    dom.kpiMonthlyIncomeDeltaLabel.textContent = state.kpis.monthlyIncomeDeltaLabel;

    dom.kpiPendingPayouts.textContent = money(state.kpis.pendingPayouts);
    dom.kpiPendingPayoutsLabel.textContent = state.kpis.pendingPayoutsLabel;

    dom.kpiTotalWithdrawn.textContent = money(state.kpis.totalWithdrawn);
    dom.kpiTotalWithdrawnDelta.textContent = state.kpis.totalWithdrawnDelta;
    dom.kpiTotalWithdrawnDeltaLabel.textContent = state.kpis.totalWithdrawnDeltaLabel;
  };

  const renderChart = () => {
    if (!dom.incomeChart) return;
    const max = state.chart.reduce((m, p) => Math.max(m, Number(p.value || 0)), 1);

    dom.incomeChart.innerHTML = state.chart
      .map((point) => {
        const h = Math.max(8, Math.round((Number(point.value || 0) / max) * 100));
        return `
          <div class="chart-bar ${point.active ? "active" : ""}" style="height: ${h}%;">
            <span class="chart-label">${point.label}</span>
            <span class="chart-value">${point.value}K</span>
          </div>
        `;
      })
      .join("");
  };

  const renderTransactions = () => {
    if (!dom.transactionsTableBody) return;
    const query = (dom.transactionsSearchInput?.value || "").trim().toLowerCase();
    const rows = state.transactions.filter((item) => {
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.details.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      );
    });

    dom.transactionsTableBody.innerHTML = rows
      .map((item) => {
        const statusClass = mapStatusBadgeClass(item.status);
        const negativeClass = String(item.amount || "").trim().startsWith("-")
          ? "negative"
          : "";
        return `
          <tr data-transaction-id="${item.id}">
            <td>
              <div class="transaction-info">
                <div class="transaction-icon ${item.iconClass}">
                  <span class="material-symbols-outlined">${item.icon}</span>
                </div>
                <div>
                  <p class="transaction-name">${item.name}</p>
                  <p class="transaction-details">${item.details}</p>
                </div>
              </div>
            </td>
            <td class="transaction-date">${item.date}</td>
            <td class="transaction-type">${item.type}</td>
            <td>
              <span class="status-badge ${statusClass}">
                <span class="status-dot"></span> ${item.status}
              </span>
            </td>
            <td class="transaction-amount ${negativeClass}">${item.amount}</td>
            <td class="text-right">
              <button class="more-button" type="button" data-transaction-actions="${item.id}">
                <span class="material-symbols-outlined">more_vert</span>
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
  };

  async function hydrateFromApi() {
    if (!window.KCGuideApi || !state.guideId) return;

    try {
      const kpisRes = await window.KCGuideApi.incomes.getKpis(state.guideId);
      const [chartRes, txRes] = await Promise.all([
        window.KCGuideApi.incomes.getChart(state.guideId, state.selectedRange),
        window.KCGuideApi.incomes.getTransactions(state.guideId, {
          page: 0,
          size: 20,
        }),
      ]);

      const apiKpis = kpisRes?.data;
      const apiChart = chartRes?.data;
      const apiTransactions = txRes?.data;

      if (apiKpis) {
        state.kpis.monthlyIncome = apiKpis.monthlyIncome ?? state.kpis.monthlyIncome;
        state.kpis.monthlyIncomeDelta = apiKpis.monthlyIncomeDelta ?? state.kpis.monthlyIncomeDelta;
        state.kpis.monthlyIncomeDeltaLabel =
          apiKpis.monthlyIncomeDeltaLabel ?? state.kpis.monthlyIncomeDeltaLabel;
        state.kpis.pendingPayouts = apiKpis.pendingPayouts ?? state.kpis.pendingPayouts;
        state.kpis.pendingPayoutsLabel =
          apiKpis.pendingPayoutsLabel ?? state.kpis.pendingPayoutsLabel;
        state.kpis.totalWithdrawn = apiKpis.totalWithdrawn ?? state.kpis.totalWithdrawn;
        state.kpis.totalWithdrawnDelta = apiKpis.totalWithdrawnDelta ?? state.kpis.totalWithdrawnDelta;
        state.kpis.totalWithdrawnDeltaLabel =
          apiKpis.totalWithdrawnDeltaLabel ?? state.kpis.totalWithdrawnDeltaLabel;
      }

      if (Array.isArray(apiChart?.points)) {
        state.chart = apiChart.points.map((item) => ({
          label: item.label,
          value: item.value,
          active: Boolean(item.active),
        }));
      }

      const items = apiTransactions?.items || apiTransactions;
      if (Array.isArray(items)) {
        state.transactions = items.map((item) => ({
          id: item.id,
          name: item.name || item.title || "Movimiento",
          details: item.details || item.description || "",
          date: item.dateLabel || item.createdAtLabel || item.createdAt || "",
          type: item.typeLabel || item.type || "Movimiento",
          status: item.statusLabel || item.status || "Pendiente",
          amount: item.amountLabel || money(item.amount || 0),
          icon: item.icon || "payments",
          iconClass: item.iconClass || "orange",
        }));
      }
    } catch (error) {
      if (isNetworkUnavailableError(error)) return;
      console.warn("No se pudieron cargar los ingresos desde la API.", error);
    }
  }

  const refreshData = async () => {
    renderLoadingState();
    await hydrateFromApi();
    renderCurrentUser();
    renderKpis();
    renderChart();
    renderTransactions();
    if (dom.lastUpdatedAt) {
      const now = new Date();
      dom.lastUpdatedAt.textContent = `Ultima actualizacion: ${now.toLocaleString("es-MX")}`;
    }
  };

  const bind = () => {
    dom.pageTitle = document.querySelector(".guide-section__title");
    dom.pageSubtitle = document.querySelector(".guide-section__subtitle");
    dom.sidebarUserName = document.getElementById("userName");
    dom.lastUpdatedAt = document.getElementById("lastUpdatedAt");
    dom.btnDownloadReport = document.getElementById("btnDownloadReport");
    dom.btnWithdrawFunds = document.getElementById("btnWithdrawFunds");

    dom.kpiMonthlyIncome = document.getElementById("kpiMonthlyIncome");
    dom.kpiMonthlyIncomeDelta = document.getElementById("kpiMonthlyIncomeDelta");
    dom.kpiMonthlyIncomeDeltaLabel = document.getElementById("kpiMonthlyIncomeDeltaLabel");
    dom.kpiPendingPayouts = document.getElementById("kpiPendingPayouts");
    dom.kpiPendingPayoutsLabel = document.getElementById("kpiPendingPayoutsLabel");
    dom.kpiTotalWithdrawn = document.getElementById("kpiTotalWithdrawn");
    dom.kpiTotalWithdrawnDelta = document.getElementById("kpiTotalWithdrawnDelta");
    dom.kpiTotalWithdrawnDeltaLabel = document.getElementById("kpiTotalWithdrawnDeltaLabel");

    dom.chartButtons = [...document.querySelectorAll("[data-chart-range]")];
    dom.incomeChart = document.getElementById("incomeChart");
    dom.transactionsSearchInput = document.getElementById("transactionsSearchInput");
    dom.btnOpenTransactionsFilter = document.getElementById("btnOpenTransactionsFilter");
    dom.transactionsTableBody = document.getElementById("transactionsTableBody");
    dom.btnViewAllTransactions = document.getElementById("btnViewAllTransactions");

    dom.chartButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const nextRange = button.getAttribute("data-chart-range") || "all";
        state.selectedRange = nextRange;
        dom.chartButtons.forEach((item) => item.classList.toggle("active", item === button));
        await refreshData();
      });
    });

    dom.transactionsSearchInput?.addEventListener("input", renderTransactions);
    dom.btnDownloadReport?.addEventListener("click", async () => {
      openUnderConstructionModal();
    });
    dom.btnWithdrawFunds?.addEventListener("click", async () => {
      openUnderConstructionModal();
    });
    dom.btnOpenTransactionsFilter?.addEventListener("click", () => {
      openUnderConstructionModal();
    });
    dom.btnViewAllTransactions?.addEventListener("click", () => {
      openUnderConstructionModal();
    });
  };

  const init = async () => {
    bind();
    await hydrateCurrentUser();
    renderCurrentUser();
    await refreshData();
  };

  return { init };
})();

const bootstrapGuideIncomes = () => {
  const run = () => GuideIncomesApp.init();
  const sidebarReady = window.__guideSidebarReadyPromise;

  if (sidebarReady && typeof sidebarReady.finally === "function") {
    sidebarReady.finally(run);
    return;
  }

  run();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapGuideIncomes, {
    once: true,
  });
} else {
  bootstrapGuideIncomes();
}



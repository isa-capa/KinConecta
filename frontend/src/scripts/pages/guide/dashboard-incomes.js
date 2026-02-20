/* =========================================================
   Guía - Ingresos
   Base lista para integrar Spring Boot REST API.
   ========================================================= */

const GuideIncomesApp = (() => {
  const isNetworkUnavailableError = (error) =>
    Boolean(error?.isNetworkError || error?.isApiUnavailable);

  const state = {
    guideId: "guide_001", // TODO(AUTH): obtener guideId real desde sesión/JWT
    selectedRange: "all",
    kpis: {
      monthlyIncome: 25450,
      monthlyIncomeDelta: "+12%",
      monthlyIncomeDeltaLabel: "vs mes anterior",
      pendingPayouts: 4200,
      pendingPayoutsLabel: "Procesando el próximo martes",
      totalWithdrawn: 142890,
      totalWithdrawnDelta: "+8%",
      totalWithdrawnDeltaLabel: "desde el inicio",
    },
    chart: [
      { label: "Abr", value: 18 },
      { label: "May", value: 22 },
      { label: "Jun", value: 16 },
      { label: "Jul", value: 28 },
      { label: "Ago", value: 21 },
      { label: "Sep", value: 25, active: true },
    ],
    transactions: [
      {
        id: "txn_1",
        name: "Comida Callejera & Cultura",
        details: "Reserva #BK-9928 • Juan P.",
        date: "24 Oct 2023",
        type: "Ingreso de recorrido",
        status: "Pendiente",
        amount: "MXN 850.00",
        icon: "tour",
        iconClass: "orange",
      },
      {
        id: "txn_2",
        name: "Pago Semanal",
        details: "Transferencia a BBVA •••• 4589",
        date: "17 Oct 2023",
        type: "Retiro",
        status: "Completado",
        amount: "- MXN 5,420.00",
        icon: "account_balance",
        iconClass: "green",
      },
    ],
  };

  const dom = {
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

  const renderLoadingState = () => {
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
    // TODO(BACKEND): reemplazar fallback local por llamadas reales.
    // TODO(BACKEND): validar shape real de respuestas y mapear DTOs.
    // TODO(BACKEND): mover guideId a contexto de autenticacion global.
    if (!window.KCGuideApi) return;
    try {
      // Primero intentamos KPIs para evitar multiples requests fallidas
      // cuando el backend no esta disponible.
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

      // TODO(BACKEND): ajustar mapeo final a los nombres reales del backend.
      if (apiKpis) {
        state.kpis.monthlyIncome = apiKpis.monthlyIncome ?? state.kpis.monthlyIncome;
        state.kpis.monthlyIncomeDelta = apiKpis.monthlyIncomeDelta ?? state.kpis.monthlyIncomeDelta;
        state.kpis.pendingPayouts = apiKpis.pendingPayouts ?? state.kpis.pendingPayouts;
        state.kpis.totalWithdrawn = apiKpis.totalWithdrawn ?? state.kpis.totalWithdrawn;
      }

      if (Array.isArray(apiChart?.points)) {
        state.chart = apiChart.points.map((item) => ({
          label: item.label,
          value: item.value,
          active: Boolean(item.active),
        }));
      }

      if (Array.isArray(apiTransactions?.items)) {
        state.transactions = apiTransactions.items.map((item) => ({
          id: item.id,
          name: item.name,
          details: item.details,
          date: item.dateLabel,
          type: item.typeLabel,
          status: item.statusLabel,
          amount: item.amountLabel,
          icon: item.icon || "payments",
          iconClass: item.iconClass || "orange",
        }));
      }
    } catch (error) {
      if (isNetworkUnavailableError(error)) return;
      console.warn("Incomes API fallback enabled:", error);
    }
  }

  const refreshData = async () => {
    renderLoadingState();
    await hydrateFromApi();
    renderKpis();
    renderChart();
    renderTransactions();
    if (dom.lastUpdatedAt) {
      const now = new Date();
      dom.lastUpdatedAt.textContent = `Última actualización: ${now.toLocaleString("es-MX")}`;
    }
  };

  const bind = () => {
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
        dom.chartButtons.forEach((item) =>
          item.classList.toggle("active", item === button),
        );
        await refreshData();
      });
    });

    dom.transactionsSearchInput?.addEventListener("input", renderTransactions);

    dom.btnDownloadReport?.addEventListener("click", async () => {
      // TODO(BACKEND): descargar reporte (CSV/PDF) desde Spring Boot.
      // Sugerencia endpoint: GET /guides/{guideId}/incomes/export?range=...
      if (!window.KCGuideApi) return;
      try {
        await window.KCGuideApi.incomes.exportReport(state.guideId, {
          range: state.selectedRange,
        });
      } catch (error) {
        console.warn("Export report pending backend implementation.", error);
      }
    });

    dom.btnWithdrawFunds?.addEventListener("click", async () => {
      // TODO(BACKEND): abrir modal de retiro y enviar solicitud real.
      // Sugerencia endpoint: POST /guides/{guideId}/incomes/withdraw
      if (!window.KCGuideApi) return;
      try {
        await window.KCGuideApi.incomes.requestWithdraw(state.guideId, {
          amount: 0,
          accountId: "TODO_ACCOUNT_ID",
        });
      } catch (error) {
        console.warn("Withdraw flow pending backend implementation.", error);
      }
    });

    dom.btnOpenTransactionsFilter?.addEventListener("click", () => {
      // TODO(BACKEND): filtros avanzados + paginación server-side.
      console.info("TODO: open transactions filter panel.");
    });

    dom.btnViewAllTransactions?.addEventListener("click", () => {
      // TODO(BACKEND): navegar a módulo completo o paginación incremental.
      console.info("TODO: navigate to full transactions history.");
    });
  };

  const init = async () => {
    bind();
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

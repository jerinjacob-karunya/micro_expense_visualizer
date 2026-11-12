// utils.js - small helpers shared by many pages.

const DAYS_PER_MONTH = 30.44; // average days in a month
const GROWTH_RATE = 0.07;     // 7% yearly growth used for the "invested" figure

const CATEGORIES = ["Subscriptions", "Food & Drink", "Housing", "Entertainment", "Software", "Lifestyle"];

// Each category has a colour defined in styles.css
const CATEGORY_COLORS = {
  "Subscriptions": "var(--cat-subscriptions)",
  "Food & Drink": "var(--cat-food)",
  "Housing": "var(--cat-housing)",
  "Entertainment": "var(--cat-entertainment)",
  "Software": "var(--cat-software)",
  "Lifestyle": "var(--cat-lifestyle)"
};

function categoryColor(category) {
  return CATEGORY_COLORS[category] || "var(--text-muted)";
}

// 1234.5 -> "$1,234.50"
function formatMoney(amount) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(safeAmount);
}

// A daily cost is converted to a monthly cost so everything uses one scale
function monthlyCostOf(cost, frequency) {
  const number = Number(cost) || 0;
  return frequency === "daily" ? number * DAYS_PER_MONTH : number;
}

// Future value of saving the same amount every month (compounded monthly)
function futureValueOfMonthly(monthlyAmount, years, yearlyRate) {
  const monthlyRate = yearlyRate / 12;
  const months = years * 12;
  return monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

function totalMonthly(expenses) {
  let total = 0;
  for (const expense of expenses) {
    total += monthlyCostOf(expense.cost, expense.frequency);
  }
  return total;
}

// Security: turn user text into safe text before putting it inside innerHTML (stops XSS)
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Small pop-up message at the bottom of the screen
let toastTimer = null;
function showToast(message, isError) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.toggle("toast-error", Boolean(isError));
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2800);
}

// Message banner inside a form (type is "error" or "success")
function showFormMessage(element, text, type) {
  element.textContent = text;
  element.className = "form-msg show " + type;
}
function hideFormMessage(element) {
  element.textContent = "";
  element.className = "form-msg";
}

// The chat and calculator pop-ups share the same corner, so only one may be open.
// Every pop-up has class "float-panel" and a data-fab attribute holding its button's id.
function closeFloatingPanels(exceptId) {
  document.querySelectorAll(".float-panel.open").forEach(function (panel) {
    if (panel.id === exceptId) return;
    panel.classList.remove("open");
    const button = document.getElementById(panel.dataset.fab);
    if (button) {
      button.setAttribute("aria-expanded", "false");
    }
  });
}

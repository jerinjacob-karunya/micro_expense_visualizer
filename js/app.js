// app.js - main file. Sets up the header on every page, then runs the code for the current page.
// Each page has <body data-page="..."> which tells us which init function to call.

document.addEventListener("DOMContentLoaded", function () {
  setupHeader();

  const page = document.body.dataset.page;
  if (page === "landing") initLanding();
  if (page === "register") initRegister();
  if (page === "signup") initSignUp();
  if (page === "signin") initSignIn();
  if (page === "home") initHome();
  if (page === "add-expense") initAddExpense();
  if (page === "analytics") initLedger();
  if (page === "profile") initProfile();
});

/* ===================================================================
   Header: hamburger menu, account links, highlight current page (FR-01)
   =================================================================== */

function makeLink(text, href, navName) {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = text;
  link.dataset.nav = navName;
  return link;
}

function addNavItem(list, element) {
  const item = document.createElement("li");
  item.appendChild(element);
  list.appendChild(item);
}

function setupHeader() {
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("mainNav");
  const list = document.getElementById("navList");
  const session = getSession();

  // Account links at the end of the menu
  if (session) {
    const nameLink = makeLink(session.name, "profile.html", "profile");
    nameLink.className = "nav-name";
    nameLink.title = "Open your profile";
    addNavItem(list, nameLink);

    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.className = "nav-btn";
    logoutButton.textContent = "Log out";
    logoutButton.addEventListener("click", logout);
    addNavItem(list, logoutButton);
  } else {
    addNavItem(list, makeLink("Sign in", "signin.html", "signin"));
    addNavItem(list, makeLink("Sign up", "signup.html", "signup"));
  }

  // Mark the link of the page we are on
  const page = document.body.dataset.page;
  list.querySelectorAll("a").forEach(function (link) {
    if (link.dataset.nav === page) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  // Hamburger button opens and closes the drawer on phones
  function setMenu(isOpen) {
    nav.classList.toggle("open", isOpen);
    menuBtn.setAttribute("aria-expanded", isOpen);
    menuBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    menuBtn.textContent = isOpen ? "Close" : "Menu";
  }

  menuBtn.addEventListener("click", function () {
    setMenu(!nav.classList.contains("open"));
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });
}

/* ===================================================================
   Landing page (index.html)
   =================================================================== */

function initLanding() {
  // If the visitor is already logged in, the main button opens the dashboard
  const button = document.getElementById("ctaStart");
  if (getSession() && button) {
    button.textContent = "Open dashboard";
    button.href = "home.html";
  }

  // The chart in the hero: a $5.75 coffee every day for 10 years
  drawSpendChart(document.getElementById("heroChart"), 5.75 * DAYS_PER_MONTH, 10);
}

/* ===================================================================
   Register page (register.html) - full form
   =================================================================== */

function initRegister() {
  if (getSession()) {
    window.location.href = "home.html";
    return;
  }
  setupPasswordToggles();

  const form = document.getElementById("registerForm");
  const banner = document.getElementById("formMsg");

  setupFormValidation(form, function () {
    const result = createAccount({
      name: form.elements.fullName.value.trim(),
      empId: form.elements.empId.value.trim().toUpperCase(),
      email: form.elements.email.value,
      mobile: form.elements.mobile.value.trim(),
      dept: form.elements.dept.value,
      password: form.elements.password.value
    });

    if (!result.ok) {
      showFormMessage(banner, result.error, "error");
      return;
    }
    window.location.href = "profile.html?welcome=1";
  });
}

/* ===================================================================
   Sign-up page (signup.html) - short form
   =================================================================== */

function initSignUp() {
  if (getSession()) {
    window.location.href = "home.html";
    return;
  }
  setupPasswordToggles();

  const form = document.getElementById("signupForm");
  const banner = document.getElementById("formMsg");

  setupFormValidation(form, function () {
    const email = form.elements.email.value.trim();
    const result = createAccount({
      name: email.split("@")[0], // the short form has no name field, so use the part before @
      email: email,
      password: form.elements.password.value
    });

    if (!result.ok) {
      showFormMessage(banner, result.error, "error");
      return;
    }
    window.location.href = "profile.html?welcome=1";
  });
}

/* ===================================================================
   Sign-in page (signin.html)
   =================================================================== */

function initSignIn() {
  if (getSession()) {
    window.location.href = "home.html";
    return;
  }
  setupPasswordToggles();

  const form = document.getElementById("signinForm");
  const banner = document.getElementById("formMsg");
  const emailField = form.elements.email;
  const passwordField = form.elements.password;

  if (new URLSearchParams(window.location.search).get("authRequired")) {
    showFormMessage(banner, "Please sign in to open that page.", "error");
  }

  emailField.addEventListener("blur", function () {
    if (emailField.value !== "") {
      validateField(emailField);
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideFormMessage(banner);

    // 1. Check the format first
    if (!patterns.email.test(emailField.value.trim())) {
      validateField(emailField);
      showFormMessage(banner, "That email doesn't look right. Use a format like name@example.com.", "error");
      emailField.focus();
      return;
    }
    if (passwordField.value === "") {
      showFormMessage(banner, "Enter your password.", "error");
      passwordField.focus();
      return;
    }

    // 2. Then check the account
    const result = signIn(emailField.value, passwordField.value);
    if (!result.ok) {
      showFormMessage(banner, result.error, "error");
      return;
    }
    window.location.href = "home.html";
  });
}

/* ===================================================================
   Dashboard (home.html)
   =================================================================== */

function initHome() {
  const session = requireLogin();
  if (!session) return;

  const expenses = getExpenses(session.userId);
  const profile = getProfile(session.userId);
  const monthly = totalMonthly(expenses);

  document.getElementById("greeting").textContent = "Hello, " + session.name.split(" ")[0];
  document.getElementById("metricMonthly").textContent = formatMoney(monthly);
  document.getElementById("metricAnnual").textContent = formatMoney(monthly * 12);
  document.getElementById("metricGrowth").textContent = formatMoney(futureValueOfMonthly(monthly, 10, GROWTH_RATE));
  document.getElementById("metricCount").textContent =
    expenses.length + (expenses.length === 1 ? " active expense" : " active expenses");

  if (expenses.length === 0) {
    document.getElementById("dashboardEmpty").hidden = false;
  }

  const chartBox = document.getElementById("spendChart");
  if (monthly > 0) {
    drawSpendChart(chartBox, monthly, 10);
  } else {
    chartBox.innerHTML = '<p class="muted">Add an expense and your 10-year chart shows up here.</p>';
  }

  const totals = categoryTotals(expenses);
  renderBudget(monthly, profile);
  renderCategories(totals, monthly);
  renderSnapshot(expenses.length, profile, totals);
}

// { "Food & Drink": 245.2, "Software": 29.48, ... }
function categoryTotals(expenses) {
  const totals = {};
  for (const expense of expenses) {
    const monthly = monthlyCostOf(expense.cost, expense.frequency);
    totals[expense.category] = (totals[expense.category] || 0) + monthly;
  }
  return totals;
}

function renderBudget(monthly, profile) {
  const box = document.getElementById("budgetWidget");
  const threshold = Number(profile.budgetThreshold) || 0;

  if (threshold <= 0) {
    box.innerHTML = '<p class="muted">Set a monthly budget on your <a href="profile.html">profile</a> to see how your recurring spend measures up.</p>';
    return;
  }

  const percent = (monthly / threshold) * 100;
  let level = "ok";
  let status = "Comfortably under your budget.";
  if (percent >= 90) {
    level = "danger";
    status = "Close to or over your budget. Time to trim something.";
  } else if (percent >= 50) {
    level = "warning";
    status = "Over half of your budget is used.";
  }

  box.innerHTML =
    '<div class="budget-head"><h3>Budget</h3><span class="budget-pct">' + percent.toFixed(0) + "%</span></div>" +
    '<div class="budget-track" role="progressbar" aria-label="Budget used" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
    Math.min(percent, 100).toFixed(0) + '"><div class="budget-fill" data-level="' + level +
    '" style="width:' + Math.min(percent, 100) + '%"></div></div>' +
    '<p class="budget-status">' + status + "</p>" +
    '<p class="muted">' + formatMoney(monthly) + " of " + formatMoney(threshold) + " per month.</p>";
}

function renderCategories(totals, monthly) {
  const box = document.getElementById("categoryBreakdown");
  const names = Object.keys(totals);

  if (names.length === 0) {
    box.innerHTML = '<p class="muted">No expenses yet. <a href="add-expense.html">Add your first one</a> to see a breakdown.</p>';
    return;
  }

  names.sort(function (a, b) {
    return totals[b] - totals[a];
  });

  let html = "";
  for (const name of names) {
    const percent = monthly > 0 ? (totals[name] / monthly) * 100 : 0;
    html +=
      '<div class="cat-row"><div class="cat-row-top">' +
      '<span class="cat-name"><span class="cat-dot" style="background:' + categoryColor(name) + '"></span>' + escapeHtml(name) + "</span>" +
      "<strong>" + formatMoney(totals[name]) + "</strong></div>" +
      '<div class="cat-track"><div class="cat-fill" style="width:' + percent + "%;background:" + categoryColor(name) + '"></div></div></div>';
  }
  box.innerHTML = html;
}

function renderSnapshot(count, profile, totals) {
  const names = Object.keys(totals);
  let biggest = "None yet";
  for (const name of names) {
    if (biggest === "None yet" || totals[name] > totals[biggest]) {
      biggest = name;
    }
  }

  const rows = [
    ["Active expenses", String(count)],
    ["Biggest category", biggest],
    ["Savings goal", formatMoney(Number(profile.savingsGoal) || 0) + " / month"]
  ];
  let html = "";
  for (const row of rows) {
    html += '<div class="snapshot-row"><span class="k">' + row[0] + '</span><span class="v">' + escapeHtml(row[1]) + "</span></div>";
  }
  document.getElementById("snapshot").innerHTML = html;
}

/* ===================================================================
   Add expense (add-expense.html)
   =================================================================== */

function initAddExpense() {
  const session = requireLogin();
  if (!session) return;

  const categorySelect = document.getElementById("category");
  for (const category of CATEGORIES) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  }

  updateActiveCount(session.userId);

  const form = document.getElementById("addExpenseForm");
  setupFormValidation(form, function () {
    const name = form.elements.expenseName.value.trim();
    addExpense(session.userId, {
      category: form.elements.category.value,
      name: name,
      cost: Number(form.elements.cost.value),
      frequency: form.elements.frequency.value
    });
    showToast('Added "' + name + '".');
    form.reset();
    updateActiveCount(session.userId);
  });

  loadPresets(session.userId);
}

function addExpense(userId, data) {
  const expenses = getExpenses(userId);
  expenses.push({
    id: generateId(),
    category: data.category,
    name: data.name,
    cost: data.cost,
    frequency: data.frequency,
    dateAdded: new Date().toISOString()
  });
  saveExpenses(userId, expenses);
}

function updateActiveCount(userId) {
  const count = getExpenses(userId).length;
  document.getElementById("activeCount").textContent =
    count + (count === 1 ? " active expense" : " active expenses");
}

// Quick-add presets come from subscriptions.json (needs a web server, e.g. Live Server or Vercel)
function loadPresets(userId) {
  const grid = document.getElementById("presetGrid");

  fetch("subscriptions.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Could not load presets");
      return response.json();
    })
    .then(function (presets) {
      grid.innerHTML = "";
      presets.forEach(function (preset) {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "preset-card";
        card.style.borderLeftColor = categoryColor(preset.category);
        card.innerHTML =
          '<span class="preset-cat">' + escapeHtml(preset.category) + "</span>" +
          '<span class="preset-name">' + escapeHtml(preset.name) + "</span>" +
          '<span class="preset-cost">' + formatMoney(preset.cost) + (preset.frequency === "daily" ? " / day" : " / month") + "</span>";
        card.addEventListener("click", function () {
          addExpense(userId, preset);
          showToast('Added "' + preset.name + '".');
          updateActiveCount(userId);
        });
        grid.appendChild(card);
      });
    })
    .catch(function () {
      grid.innerHTML = '<p class="muted">Presets could not load. Open the site through a web server (Live Server or Vercel), not by double-clicking the file.</p>';
    });
}

/* ===================================================================
   Ledger (analytics.html): filter, search, edit, delete
   =================================================================== */

let ledgerUserId = null;
let ledgerFilter = "All";
let ledgerSearch = "";
let editingId = null;     // id of the row being edited
let confirmingId = null;  // id of the row waiting for "Delete? Yes / No"

function initLedger() {
  const session = requireLogin();
  if (!session) return;
  ledgerUserId = session.userId;

  // Category filter buttons
  const chips = document.getElementById("filterChips");
  ["All"].concat(CATEGORIES).forEach(function (name) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip" + (name === "All" ? " active" : "");
    chip.textContent = name;
    chip.setAttribute("aria-pressed", name === "All");
    chip.addEventListener("click", function () {
      ledgerFilter = name;
      editingId = null;
      confirmingId = null;
      chips.querySelectorAll(".chip").forEach(function (other) {
        other.classList.remove("active");
        other.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("active");
      chip.setAttribute("aria-pressed", "true");
      renderLedger();
    });
    chips.appendChild(chip);
  });

  document.getElementById("searchExpenses").addEventListener("input", function (event) {
    ledgerSearch = event.target.value.trim().toLowerCase();
    renderLedger();
  });

  // One listener on the table handles every Edit / Delete / Save button
  document.getElementById("ledgerBody").addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const row = button.closest("tr");
    const id = row.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
      editingId = id;
      confirmingId = null;
    } else if (action === "cancel") {
      editingId = null;
    } else if (action === "delete") {
      confirmingId = id;
      editingId = null;
    } else if (action === "confirm-no") {
      confirmingId = null;
    } else if (action === "confirm-yes") {
      deleteExpense(id);
      confirmingId = null;
    } else if (action === "save") {
      if (!saveEdit(row, id)) return; // stay in edit mode if the values are wrong
      editingId = null;
    }
    renderLedger();
  });

  renderLedger();
}

function deleteExpense(id) {
  const remaining = getExpenses(ledgerUserId).filter(function (expense) {
    return expense.id !== id;
  });
  saveExpenses(ledgerUserId, remaining);
  showToast("Expense deleted.", true);
}

function saveEdit(row, id) {
  const name = row.querySelector(".edit-name").value.trim();
  const costText = row.querySelector(".edit-cost").value;
  const errorBox = row.querySelector(".edit-error");

  if (name === "") {
    errorBox.textContent = "Name can't be empty.";
    return false;
  }
  if (costText === "" || Number(costText) <= 0) {
    errorBox.textContent = "Cost must be greater than 0.";
    return false;
  }

  const expenses = getExpenses(ledgerUserId);
  for (const expense of expenses) {
    if (expense.id === id) {
      expense.category = row.querySelector(".edit-category").value;
      expense.name = name;
      expense.cost = Number(costText);
      expense.frequency = row.querySelector(".edit-frequency").value;
    }
  }
  saveExpenses(ledgerUserId, expenses);
  showToast("Expense updated.");
  return true;
}

function renderLedger() {
  let expenses = getExpenses(ledgerUserId);

  if (ledgerFilter !== "All") {
    expenses = expenses.filter(function (e) {
      return e.category === ledgerFilter;
    });
  }
  if (ledgerSearch !== "") {
    expenses = expenses.filter(function (e) {
      return e.name.toLowerCase().includes(ledgerSearch);
    });
  }
  // newest first
  expenses.sort(function (a, b) {
    return new Date(b.dateAdded) - new Date(a.dateAdded);
  });

  const table = document.getElementById("ledgerTable");
  const empty = document.getElementById("ledgerEmpty");
  table.hidden = expenses.length === 0;
  empty.hidden = expenses.length !== 0;

  document.getElementById("ledgerBody").innerHTML = expenses.map(ledgerRowHtml).join("");
}

function ledgerRowHtml(expense) {
  if (editingId === expense.id) {
    return editRowHtml(expense);
  }

  const date = new Date(expense.dateAdded).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const unit = expense.frequency === "daily" ? " / day" : " / month";

  let actions =
    '<div class="row-actions">' +
    '<button type="button" class="btn btn-secondary btn-small" data-action="edit">Edit</button>' +
    '<button type="button" class="btn btn-danger btn-small" data-action="delete">Delete</button></div>';
  if (confirmingId === expense.id) {
    actions =
      '<div class="row-actions"><span>Delete this?</span>' +
      '<button type="button" class="btn btn-danger btn-small" data-action="confirm-yes">Yes</button>' +
      '<button type="button" class="btn btn-secondary btn-small" data-action="confirm-no">No</button></div>';
  }

  return (
    '<tr data-id="' + expense.id + '">' +
    '<td><span class="cat-pill" style="background:' + categoryColor(expense.category) + '">' + escapeHtml(expense.category) + "</span></td>" +
    "<td>" + escapeHtml(expense.name) + "</td>" +
    '<td class="num">' + formatMoney(expense.cost) + '<span class="muted">' + unit + "</span></td>" +
    '<td class="num">' + formatMoney(monthlyCostOf(expense.cost, expense.frequency)) + "</td>" +
    "<td>" + date + "</td>" +
    "<td>" + actions + "</td></tr>"
  );
}

function editRowHtml(expense) {
  let categoryOptions = "";
  for (const category of CATEGORIES) {
    categoryOptions += '<option value="' + escapeHtml(category) + '"' + (category === expense.category ? " selected" : "") + ">" + escapeHtml(category) + "</option>";
  }

  return (
    '<tr data-id="' + expense.id + '">' +
    '<td><select class="edit-category" aria-label="Category">' + categoryOptions + "</select></td>" +
    '<td><input class="edit-name" type="text" aria-label="Expense name" value="' + escapeHtml(expense.name) + '"></td>' +
    '<td class="num"><input class="edit-cost" type="number" min="0.01" step="0.01" aria-label="Cost" value="' + expense.cost + '"> ' +
    '<select class="edit-frequency" aria-label="Frequency">' +
    '<option value="daily"' + (expense.frequency === "daily" ? " selected" : "") + ">per day</option>" +
    '<option value="monthly"' + (expense.frequency === "monthly" ? " selected" : "") + ">per month</option></select></td>" +
    '<td class="num muted">-</td>' +
    "<td>" + new Date(expense.dateAdded).toLocaleDateString() + "</td>" +
    '<td><div class="row-actions">' +
    '<button type="button" class="btn btn-small" data-action="save">Save</button>' +
    '<button type="button" class="btn btn-secondary btn-small" data-action="cancel">Cancel</button></div>' +
    '<span class="error-msg edit-error" role="alert"></span></td></tr>'
  );
}

/* ===================================================================
   Profile (profile.html)
   =================================================================== */

function initProfile() {
  const session = requireLogin();
  if (!session) return;

  if (new URLSearchParams(window.location.search).get("welcome")) {
    showToast("Account created. Set your budget below to unlock the dashboard.");
  }

  // Account details (the register form also saves Register ID, mobile and division)
  const user = getUsers().find(function (u) {
    return u.id === session.userId;
  }) || {};
  const accountRows = [["Name", session.name], ["Email", session.email]];
  if (user.empId) accountRows.push(["Register ID", user.empId]);
  if (user.mobile) accountRows.push(["Mobile", user.mobile]);
  if (user.dept) accountRows.push(["Division", user.dept]);

  let html = "";
  for (const row of accountRows) {
    html += '<div class="snapshot-row"><span class="k">' + row[0] + '</span><span class="v">' + escapeHtml(row[1]) + "</span></div>";
  }
  document.getElementById("accountRows").innerHTML = html;

  // Budget form
  const profile = getProfile(session.userId);
  const form = document.getElementById("profileForm");
  form.elements.salary.value = profile.salary || "";
  form.elements.budgetThreshold.value = profile.budgetThreshold || "";
  form.elements.savingsGoal.value = profile.savingsGoal || "";

  setupFormValidation(form, function () {
    saveProfile(session.userId, {
      salary: Number(form.elements.salary.value),
      budgetThreshold: Number(form.elements.budgetThreshold.value),
      savingsGoal: Number(form.elements.savingsGoal.value)
    });
    showToast("Profile saved.");
    renderProfileSummary(session.userId);
  });

  renderProfileSummary(session.userId);
}

function renderProfileSummary(userId) {
  const expenses = getExpenses(userId);
  const profile = getProfile(userId);
  const rows = [
    ["Active expenses", String(expenses.length)],
    ["Current monthly spend", formatMoney(totalMonthly(expenses))],
    ["Monthly income", formatMoney(profile.salary || 0)],
    ["Budget threshold", formatMoney(profile.budgetThreshold || 0)],
    ["Savings goal", formatMoney(profile.savingsGoal || 0)]
  ];
  let html = "";
  for (const row of rows) {
    html += '<div class="snapshot-row"><span class="k">' + row[0] + '</span><span class="v">' + row[1] + "</span></div>";
  }
  document.getElementById("profileSummary").innerHTML = html;
}

// calculator.js - floating calculator (FR-08).
// A button sits to the left of the chat button on every page and opens this calculator.
// It works with three pieces of state: the number on screen, the first number, and the operator.
// Example: typing 7 + 5 = stores firstNumber = 7, operator = "+", then calculates with 5.

let currentText = "0";        // the text on the big screen
let firstNumber = null;       // the number typed before the operator
let pendingOperator = null;   // "+", "-", "*" or "/"
let startNewNumber = false;   // true right after an operator or "=": the next digit starts a new number
let hasError = false;         // true while an error message is on the screen

let displayEl = null;
let exprEl = null;
let calcPanel = null;

const operatorSymbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

function updateScreen() {
  displayEl.textContent = currentText;
  displayEl.classList.toggle("error", hasError);
  exprEl.textContent = pendingOperator ? formatNumber(firstNumber) + " " + operatorSymbols[pendingOperator] : "";
}

// Removes tiny floating point errors: 0.1 + 0.2 -> 0.3
function formatNumber(number) {
  return String(Number(number.toPrecision(12)));
}

function clearAll() {
  currentText = "0";
  firstNumber = null;
  pendingOperator = null;
  startNewNumber = false;
  hasError = false;
  updateScreen();
}

function showError(message) {
  clearAll();
  currentText = message;
  hasError = true;
  updateScreen();
}

// Returns the answer, or null if it cannot be calculated
function calculate(a, operator, b) {
  if (operator === "+") return a + b;
  if (operator === "-") return a - b;
  if (operator === "*") return a * b;
  if (operator === "/") {
    if (b === 0) return null; // zero-division check
    return a / b;
  }
  return null;
}

function pressDigit(digit) {
  if (hasError) clearAll();
  if (startNewNumber || currentText === "0") {
    currentText = digit;
    startNewNumber = false;
  } else if (currentText.length < 12) {
    currentText += digit;
  }
  updateScreen();
}

function pressDot() {
  if (hasError) clearAll();
  if (startNewNumber) {
    currentText = "0.";
    startNewNumber = false;
  } else if (!currentText.includes(".")) {
    currentText += ".";
  }
  updateScreen();
}

function pressOperator(operator) {
  if (hasError) return;

  if (pendingOperator === null) {
    firstNumber = Number(currentText);
  } else if (!startNewNumber) {
    // Chained calculation such as 2 + 3 + ... : finish 2 + 3 first
    const result = calculate(firstNumber, pendingOperator, Number(currentText));
    if (result === null) {
      showError("Cannot divide by 0");
      return;
    }
    firstNumber = result;
    currentText = formatNumber(result);
  }
  // If an operator was just pressed, pressing another one simply replaces it

  pendingOperator = operator;
  startNewNumber = true;
  updateScreen();
}

function pressEquals() {
  if (hasError || pendingOperator === null) return;

  if (startNewNumber) {
    // Something like "5 +" then "=": the second number is missing
    showError("Invalid expression");
    return;
  }

  const result = calculate(firstNumber, pendingOperator, Number(currentText));
  if (result === null) {
    showError("Cannot divide by 0");
    return;
  }
  currentText = formatNumber(result);
  firstNumber = null;
  pendingOperator = null;
  startNewNumber = true;
  updateScreen();
}

// ----- Building the calculator window -----
function buildCalculatorWidget() {
  // Floating button, fixed at the bottom-right, just left of the chat button
  const fab = document.createElement("button");
  fab.type = "button";
  fab.id = "calcFab";
  fab.className = "calc-fab";
  fab.setAttribute("aria-label", "Open calculator");
  fab.setAttribute("aria-expanded", "false");
  fab.setAttribute("aria-controls", "calcPanel");
  fab.innerHTML =
    '<svg class="icon-open" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1.5 2.5v3.5h9V5.5h-9zM8 11.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zm4 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zm4 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM8 16a1.2 1.2 0 1 0 0 2.4A1.2 1.2 0 0 0 8 16zm4 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zm4 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z" fill="currentColor"/></svg>' +
    '<svg class="icon-close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>';

  calcPanel = document.createElement("section");
  calcPanel.id = "calcPanel";
  calcPanel.className = "float-panel calc-panel";
  calcPanel.dataset.fab = "calcFab";
  calcPanel.setAttribute("aria-label", "Calculator");
  calcPanel.innerHTML =
    '<div class="chat-head"><strong>Calculator</strong></div>' +
    '<div class="calc-body">' +
    '<div class="calc-expr" id="calcExpr" aria-hidden="true"></div>' +
    '<output id="calcDisplay" class="calc-display" aria-live="polite">0</output>' +
    '<div class="calc-keys" id="calcKeys">' +
    '<button type="button" class="calc-key" data-digit="7">7</button>' +
    '<button type="button" class="calc-key" data-digit="8">8</button>' +
    '<button type="button" class="calc-key" data-digit="9">9</button>' +
    '<button type="button" class="calc-key op" data-op="/" aria-label="divide">÷</button>' +
    '<button type="button" class="calc-key" data-digit="4">4</button>' +
    '<button type="button" class="calc-key" data-digit="5">5</button>' +
    '<button type="button" class="calc-key" data-digit="6">6</button>' +
    '<button type="button" class="calc-key op" data-op="*" aria-label="multiply">×</button>' +
    '<button type="button" class="calc-key" data-digit="1">1</button>' +
    '<button type="button" class="calc-key" data-digit="2">2</button>' +
    '<button type="button" class="calc-key" data-digit="3">3</button>' +
    '<button type="button" class="calc-key op" data-op="-" aria-label="subtract">−</button>' +
    '<button type="button" class="calc-key" data-digit="0">0</button>' +
    '<button type="button" class="calc-key" data-action="dot" aria-label="decimal point">.</button>' +
    '<button type="button" class="calc-key equals" data-action="equals" aria-label="equals">=</button>' +
    '<button type="button" class="calc-key op" data-op="+" aria-label="add">+</button>' +
    '<button type="button" class="calc-key clear" data-action="clear">Clear</button>' +
    "</div></div>";

  document.body.appendChild(calcPanel);
  document.body.appendChild(fab);

  displayEl = document.getElementById("calcDisplay");
  exprEl = document.getElementById("calcExpr");

  function setCalcOpen(isOpen) {
    if (isOpen) closeFloatingPanels("calcPanel"); // only one pop-up at a time
    calcPanel.classList.toggle("open", isOpen);
    fab.setAttribute("aria-expanded", isOpen);
    fab.setAttribute("aria-label", isOpen ? "Close calculator" : "Open calculator");
  }

  fab.addEventListener("click", function () {
    setCalcOpen(!calcPanel.classList.contains("open"));
  });

  // Clicks on the on-screen keys
  document.getElementById("calcKeys").addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.digit !== undefined) pressDigit(button.dataset.digit);
    else if (button.dataset.op) pressOperator(button.dataset.op);
    else if (button.dataset.action === "dot") pressDot();
    else if (button.dataset.action === "equals") pressEquals();
    else if (button.dataset.action === "clear") clearAll();
  });

  // Keyboard support: only while the calculator is open and you are not typing in a form field
  document.addEventListener("keydown", function (event) {
    if (!calcPanel.classList.contains("open")) return;
    const tag = document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const key = event.key;
    if (key >= "0" && key <= "9") pressDigit(key);
    else if (key === ".") pressDot();
    else if (key === "+" || key === "-" || key === "*" || key === "/") pressOperator(key);
    else if (key === "Enter" || key === "=") {
      event.preventDefault(); // stops Enter from also "clicking" a focused button
      pressEquals();
    } else if (key.toLowerCase() === "c") clearAll();
    else if (key === "Escape") {
      setCalcOpen(false);
      fab.focus();
    }
  });

  updateScreen();
}

document.addEventListener("DOMContentLoaded", buildCalculatorWidget);

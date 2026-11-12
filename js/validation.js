// validation.js - form validation with Regular Expressions (FR-02, FR-03, FR-04).
//
// How to use it in HTML:  <input name="email" data-validate="email">
// The value of data-validate picks which rule runs (see getMessage below).

// ----- Regex patterns -----
const patterns = {
  fullName: /^[a-zA-Z\s]{2,50}$/,                              // letters and spaces only
  empId: /^[A-Z0-9]{6,12}$/i,                                   // 6-12 letters/digits
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,   // name@site.com
  mobile: /^[6-9]\d{9}$/,                                       // 10 digits, starts with 6-9
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/ // 8+ chars, upper, lower, digit, symbol
};

const errorMessages = {
  fullName: "Use letters and spaces only (2 to 50 characters).",
  empId: "Use 6 to 12 letters or numbers, with no spaces.",
  email: "Enter a valid email, like name@example.com.",
  mobile: "Enter 10 digits starting with 6, 7, 8 or 9.",
  password: "Use 8+ characters with an uppercase letter, a lowercase letter, a number and a symbol (@$!%*?&)."
};

// Returns "" when the field is valid, or the error text when it is not
function getMessage(field) {
  const rule = field.dataset.validate;
  const value = field.value.trim();

  if (rule === "terms") {
    return field.checked ? "" : "Please accept the Terms of Service to continue.";
  }
  if (rule === "confirm") {
    const password = field.form.elements.password.value;
    return value !== "" && field.value === password ? "" : "The passwords do not match.";
  }
  if (rule === "password") {
    return patterns.password.test(field.value) ? "" : errorMessages.password;
  }
  if (rule === "dept") {
    return value !== "" ? "" : "Please choose your division.";
  }
  if (rule === "required") {
    return value !== "" ? "" : "This field is required.";
  }
  if (rule === "positive") {
    return value !== "" && Number(value) > 0 ? "" : "Enter an amount greater than 0.";
  }
  if (rule === "nonNegative") {
    return value !== "" && Number(value) >= 0 ? "" : "Enter 0 or more.";
  }
  if (patterns[rule]) {
    return patterns[rule].test(value) ? "" : errorMessages[rule];
  }
  return "";
}

// Show the result on the page: red border + error badge, or green border
function showFieldState(field, message) {
  const wrapper = field.closest(".field");
  const errorSpan = wrapper ? wrapper.querySelector(".error-msg") : null;
  const isInvalid = message !== "";

  field.classList.toggle("invalid", isInvalid);
  field.classList.toggle("valid", !isInvalid);
  field.setAttribute("aria-invalid", isInvalid ? "true" : "false");
  if (errorSpan) {
    errorSpan.textContent = message;
  }
}

function clearFieldState(field) {
  const wrapper = field.closest(".field");
  const errorSpan = wrapper ? wrapper.querySelector(".error-msg") : null;
  field.classList.remove("invalid", "valid");
  field.removeAttribute("aria-invalid");
  if (errorSpan) {
    errorSpan.textContent = "";
  }
}

// Check one field and show the result. Returns true if it is valid.
function validateField(field) {
  const message = getMessage(field);
  showFieldState(field, message);
  return message === "";
}

// Connects a whole form:
//  - validates each field on "blur" and again on submit
//  - keeps the submit button disabled until every field is valid
//  - calls onValid() when a valid form is submitted
function setupFormValidation(form, onValid) {
  const fields = form.querySelectorAll("[data-validate]");
  const button = form.querySelector("button[type='submit']");

  function allFieldsValid() {
    for (const field of fields) {
      if (getMessage(field) !== "") {
        return false;
      }
    }
    return true;
  }

  function updateButton() {
    button.disabled = !allFieldsValid();
  }

  fields.forEach(function (field) {
    // Screen readers read the error text together with the field
    const errorSpan = field.closest(".field").querySelector(".error-msg");
    if (errorSpan) {
      errorSpan.setAttribute("aria-live", "polite");
    }

    field.addEventListener("blur", function () {
      validateField(field);
    });

    field.addEventListener("input", function () {
      // Fields the user already visited are re-checked while typing
      fields.forEach(function (other) {
        if (other.classList.contains("invalid") || other.classList.contains("valid")) {
          validateField(other);
        }
      });
      updateButton();
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    let everythingValid = true;
    fields.forEach(function (field) {
      if (!validateField(field)) {
        everythingValid = false;
      }
    });
    if (everythingValid) {
      onValid();
    }
  });

  // form.reset() clears the values, so clear the red/green states too
  form.addEventListener("reset", function () {
    setTimeout(function () {
      fields.forEach(clearFieldState);
      updateButton();
    }, 0);
  });

  updateButton();
}

// Eye button: switches a password input between type="password" and type="text"
function setupPasswordToggles() {
  document.querySelectorAll("[data-toggle-password]").forEach(function (button) {
    button.addEventListener("click", function () {
      const input = document.getElementById(button.dataset.togglePassword);
      const showIt = input.type === "password";
      input.type = showIt ? "text" : "password";
      button.setAttribute("aria-pressed", showIt);
      button.setAttribute("aria-label", showIt ? "Hide password" : "Show password");
    });
  });
}

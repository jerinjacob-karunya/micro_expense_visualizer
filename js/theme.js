// theme.js - light / dark mode switcher (FR-07).
// Loaded in the <head> (no defer) so the saved theme is applied before the page paints.

const THEME_KEY = "mev_theme";

function getSavedTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
  } catch (error) {
    // localStorage can be blocked; fall through to the default
  }
  // First visit: follow the device setting
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  // CSS variables in styles.css switch when data-theme changes
  document.documentElement.setAttribute("data-theme", theme);

  const button = document.getElementById("themeToggle");
  if (button) {
    const isDark = theme === "dark";
    button.setAttribute("aria-pressed", isDark);
    button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }
}

applyTheme(getSavedTheme());

document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("themeToggle");
  applyTheme(getSavedTheme()); // update the button icon now that it exists
  if (!button) return;

  button.addEventListener("click", function () {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (error) {
      console.error("Could not save theme", error);
    }
  });
});

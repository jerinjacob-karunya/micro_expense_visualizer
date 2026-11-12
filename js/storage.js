// storage.js - everything that reads or writes window.localStorage lives here.

const USERS_KEY = "mev_users";
const SESSION_KEY = "mev_session";
const CHAT_KEY = "mev_chat";

// Save any value (object, array, text) under a key
function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Could not save " + key, error);
  }
}

// Load a value; if it is missing or broken, return the fallback instead
function loadLocal(key, fallback) {
  try {
    const text = localStorage.getItem(key);
    return text === null ? fallback : JSON.parse(text);
  } catch (error) {
    return fallback;
  }
}

function removeLocal(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Could not remove " + key, error);
  }
}

// ----- Users and login session -----
function getUsers() {
  return loadLocal(USERS_KEY, []);
}
function saveUsers(users) {
  saveLocal(USERS_KEY, users);
}
function getSession() {
  return loadLocal(SESSION_KEY, null);
}
function saveSession(session) {
  saveLocal(SESSION_KEY, session);
}
function clearSession() {
  removeLocal(SESSION_KEY);
}

// ----- Per-user data (profile and expenses) -----
function getProfile(userId) {
  return loadLocal("mev_profile_" + userId, { salary: 0, budgetThreshold: 0, savingsGoal: 0 });
}
function saveProfile(userId, profile) {
  saveLocal("mev_profile_" + userId, profile);
}
function getExpenses(userId) {
  return loadLocal("mev_expenses_" + userId, []);
}
function saveExpenses(userId, expenses) {
  saveLocal("mev_expenses_" + userId, expenses);
}

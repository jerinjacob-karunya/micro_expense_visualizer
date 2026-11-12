// auth.js - create account, sign in, sign out.
// NOTE: this is a browser-only demo. Passwords are stored in localStorage with a very simple
// scramble, which is NOT real security. A real site would check passwords on a server.

function hashPassword(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % 1000000007;
  }
  return "h" + hash;
}

// The first version of this site scrambled passwords differently. Accounts made back then
// are still in the browser, so we recognise that format too and upgrade it on the next sign-in.
function oldHashPassword(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return "h" + hash.toString(36) + btoa(unescape(encodeURIComponent(text))).slice(0, 12);
}

// userData: { name, email, password, empId?, mobile?, dept? }
function createAccount(userData) {
  const users = getUsers();
  const email = userData.email.trim().toLowerCase();

  for (const user of users) {
    if (user.email.toLowerCase() === email) {
      return { ok: false, error: "There's already an account with that email. Try signing in." };
    }
  }

  const newUser = {
    id: generateId(),
    name: userData.name,
    email: email,
    empId: userData.empId || "",
    mobile: userData.mobile || "",
    dept: userData.dept || "",
    passwordHash: hashPassword(userData.password)
  };
  users.push(newUser);
  saveUsers(users);
  saveSession({ userId: newUser.id, name: newUser.name, email: newUser.email });
  return { ok: true };
}

function signIn(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  const users = getUsers();

  for (const user of users) {
    // Compare emails ignoring capital letters (older accounts kept the capitals as typed)
    if (user.email.toLowerCase() !== cleanEmail) continue;

    const matchesNew = user.passwordHash === hashPassword(password);
    const matchesOld = user.passwordHash === oldHashPassword(password);

    if (!matchesNew && !matchesOld) {
      return { ok: false, error: "That password doesn't match this email." };
    }
    if (matchesOld) {
      user.passwordHash = hashPassword(password); // upgrade the old account
      saveUsers(users);
    }
    saveSession({ userId: user.id, name: user.name, email: user.email });
    return { ok: true };
  }
  return { ok: false, error: "We couldn't find an account with that email. Check the spelling or sign up." };
}

function logout() {
  clearSession();
  window.location.href = "index.html";
}

// Pages that need a login call this first. It sends visitors to the sign-in page if needed.
function requireLogin() {
  const session = getSession();
  if (!session) {
    window.location.href = "signin.html?authRequired=1";
    return null;
  }
  return session;
}

// Saves and reads the admin login (token) in the browser

const TOKEN_KEY = "adminToken";
const USER_KEY = "adminUsername";

export function saveLogin(token, username) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, username);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUsername() {
  return localStorage.getItem(USER_KEY) || "";
}

// Returns the token, or null if there is none or it has expired
export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      logout();
      return null;
    }
    return token;
  } catch {
    logout();
    return null;
  }
}

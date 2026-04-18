// Cookie utility functions
const PROFILE_COOKIE_KEY = "signlearn_profile";
const SESSION_COOKIE_KEY = "signlearn_session";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export function getCookie(name) {
  if (typeof document === "undefined") return null;

  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  
  return null;
}

export function setCookie(name, value, options = {}) {
  if (typeof document === "undefined") return;

  const maxAge = options.maxAge || COOKIE_MAX_AGE;
  const path = options.path || "/";
  const secure = options.secure !== false;
  const sameSite = options.sameSite || "Lax";

  let cookieString = `${name}=${encodeURIComponent(value)}`;
  cookieString += `; max-age=${maxAge}`;
  cookieString += `; path=${path}`;
  cookieString += `; samesite=${sameSite}`;
  
  if (secure && window.location.protocol === "https:") {
    cookieString += "; secure";
  }

  document.cookie = cookieString;
}

export function deleteCookie(name) {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; max-age=0; path=/`;
}

export function getStoredProfileFromCookie() {
  try {
    const rawProfile = getCookie(PROFILE_COOKIE_KEY);
    return rawProfile ? JSON.parse(rawProfile) : null;
  } catch {
    return null;
  }
}

export function saveStoredProfileToCookie(profile) {
  try {
    setCookie(PROFILE_COOKIE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to save profile to cookie:", error);
  }
}

export function getSessionFromCookie() {
  try {
    const rawSession = getCookie(SESSION_COOKIE_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
}

export function saveSessionToCookie(session) {
  try {
    setCookie(SESSION_COOKIE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to save session to cookie:", error);
  }
}

export function clearAuthCookies() {
  deleteCookie(PROFILE_COOKIE_KEY);
  deleteCookie(SESSION_COOKIE_KEY);
}

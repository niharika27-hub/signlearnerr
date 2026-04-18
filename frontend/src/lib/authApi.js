const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Request failed. Please try again.");
  }

  return data;
}

export async function signupUser(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
}

export async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
}

export async function logoutUser() {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return parseJsonResponse(response);
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return parseJsonResponse(response);
}

export async function updateUser(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/update`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
}

export async function deleteUser(password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ password }),
  });

  return parseJsonResponse(response);
}

export async function changePassword(currentPassword, newPassword) {
  const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  return parseJsonResponse(response);
}

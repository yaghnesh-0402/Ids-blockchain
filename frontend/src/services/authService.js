import api from "./api";

export async function getCurrentUser() {
  const { data } = await api.get("/api/auth/me");
  return data;
}

export async function loginUser(credentials) {
  const { data } = await api.post("/api/auth/login", credentials);
  return data;
}

export async function registerUser(payload) {
  const { data } = await api.post("/api/auth/register", payload);
  return data;
}

export async function logoutUser() {
  const { data } = await api.post("/api/auth/logout");
  return data;
}

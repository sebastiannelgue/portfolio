import api from "./api";

// POST /api/auth/login -> { message, token, admin: { id, username } }
export async function login(username, password) {
  const { data } = await api.post("/auth/login", { username, password });
  return data;
}

// GET /api/auth/me -> { id, username }
export async function getProfile() {
  const { data } = await api.get("/auth/me");
  return data;
}

import api from "./api";

// GET /api/players -> [{ id, firstName, lastName, fullName, category, team: { id, name } | null }]
export async function getPlayers() {
  const { data } = await api.get("/players");
  return data;
}

// POST /api/players  (admin) body: { firstName, lastName, category, teamId }
export async function createPlayer(payload) {
  const { data } = await api.post("/players", payload);
  return data;
}

// PUT /api/players/:id  (admin) body: { firstName?, lastName?, category?, teamId? }
export async function updatePlayer(playerId, payload) {
  const { data } = await api.put(`/players/${playerId}`, payload);
  return data;
}

// DELETE /api/players/:id  (admin)
export async function deletePlayer(playerId) {
  const { data } = await api.delete(`/players/${playerId}`);
  return data;
}

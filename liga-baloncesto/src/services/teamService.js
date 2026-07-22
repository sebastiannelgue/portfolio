import api from "./api";

// GET /api/teams -> [{ id, name, coachName, playerCount }]
export async function getTeams() {
  const { data } = await api.get("/teams");
  return data;
}

// GET /api/teams/:id -> detalle con players, playedMatches, pendingMatches y standings
// (opcionalmente filtrado por temporada y categoria)
export async function getTeam(teamId, seasonId, category) {
  const { data } = await api.get(`/teams/${teamId}`, {
    params: { season: seasonId || undefined, category: category || undefined }
  });
  return data;
}

// POST /api/teams  (admin) body: { name, coachName }
export async function createTeam(payload) {
  const { data } = await api.post("/teams", payload);
  return data;
}

// PUT /api/teams/:id  (admin) body: { name?, coachName? }
export async function updateTeam(teamId, payload) {
  const { data } = await api.put(`/teams/${teamId}`, payload);
  return data;
}

// DELETE /api/teams/:id  (admin)
export async function deleteTeam(teamId) {
  const { data } = await api.delete(`/teams/${teamId}`);
  return data;
}

import api from "./api";

// GET /api/seasons -> [{ id, name, year, isActive }]
export async function getSeasons() {
  const { data } = await api.get("/seasons");
  return data;
}

export async function createSeason(payload) {
  const { data } = await api.post("/seasons", payload);
  return data;
}

export async function updateSeason(seasonId, payload) {
  const { data } = await api.put(`/seasons/${seasonId}`, payload);
  return data;
}

export async function activateSeason(seasonId) {
  const { data } = await api.patch(`/seasons/${seasonId}/activate`);
  return data;
}

export async function deleteSeason(seasonId) {
  const { data } = await api.delete(`/seasons/${seasonId}`);
  return data;
}

import api from "./api";

// GET /api/standings?season=&category= -> tabla del torneo (temporada + categoria),
// ya ordenada por el backend (puntos, dif, tantos a favor).
export async function getStandings(seasonId, category) {
  const { data } = await api.get("/standings", {
    params: { season: seasonId || undefined, category: category || undefined }
  });
  return data;
}

// GET /api/standings/champions -> { champions: [...], palmares: [...] }
export async function getChampions() {
  const { data } = await api.get("/standings/champions");
  return data;
}

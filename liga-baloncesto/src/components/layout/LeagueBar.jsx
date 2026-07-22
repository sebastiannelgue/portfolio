import { useLeague } from "../../context/LeagueContext";

// Barra publica para elegir temporada y categoria (el torneo que se esta viendo).
export default function LeagueBar() {
  const { seasons, categories, seasonId, category, setSeasonId, setCategory } =
    useLeague();

  if (seasons.length === 0 && categories.length === 0) {
    return null;
  }

  return (
    <div className="league-bar">
      <div className="container league-bar__inner">
        <span className="league-bar__title">🏀 Torneo</span>

        <div className="league-bar__group">
          <label htmlFor="season-select">Temporada</label>
          <select
            id="season-select"
            className="league-select"
            value={seasonId}
            onChange={(event) => setSeasonId(event.target.value)}
          >
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        </div>

        <div className="league-bar__group">
          <label htmlFor="category-select">Categoria</label>
          <select
            id="category-select"
            className="league-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

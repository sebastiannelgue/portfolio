import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { getSeasons } from "../services/seasonService";
import { getCategories } from "../services/categoryService";

const LeagueContext = createContext(null);

// Mantiene las temporadas y categorias disponibles y la seleccion actual
// (temporada + categoria) que comparten la barra selectora y las vistas publicas.
export function LeagueProvider({ children }) {
  const [seasons, setSeasons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [seasonId, setSeasonId] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const loadOptions = async () => {
    const [seasonList, categoryList] = await Promise.all([
      getSeasons(),
      getCategories()
    ]);
    setSeasons(seasonList);
    setCategories(categoryList);
    setSeasonId((current) => {
      if (current && seasonList.some((s) => s.id === current)) return current;
      const active = seasonList.find((s) => s.isActive) || seasonList[0];
      return active ? active.id : "";
    });
    setCategory((current) => {
      if (current && categoryList.some((c) => c.name === current)) return current;
      return categoryList[0] ? categoryList[0].name : "";
    });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadOptions();
      } catch {
        // Sin opciones: las vistas muestran su propio estado vacio/error.
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      seasons,
      categories,
      seasonId,
      category,
      setSeasonId,
      setCategory,
      loading,
      refreshOptions: loadOptions
    }),
    [seasons, categories, seasonId, category, loading]
  );

  return <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>;
}

export function useLeague() {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error("useLeague debe usarse dentro de un LeagueProvider.");
  }
  return context;
}

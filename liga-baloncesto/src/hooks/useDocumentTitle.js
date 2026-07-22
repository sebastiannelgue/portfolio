import { useEffect } from "react";

import { LEAGUE } from "../config";

// Pone el titulo de la pestaña del navegador: "<titulo> — <Liga>".
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${LEAGUE.shortName}` : LEAGUE.name;
    return () => {
      document.title = LEAGUE.name;
    };
  }, [title]);
}

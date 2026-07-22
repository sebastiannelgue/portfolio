import { useEffect, useMemo, useState } from "react";

import { useAsync } from "../../hooks/useAsync";
import { useMutation } from "../../hooks/useMutation";
import { useToast } from "../../context/ToastContext";
import {
  getMatches,
  createMatch,
  updateMatch,
  loadResult,
  deleteMatch
} from "../../services/matchService";
import { getTeams } from "../../services/teamService";
import { getSeasons } from "../../services/seasonService";
import { getCategories } from "../../services/categoryService";

import MatchCard from "../../components/MatchCard";
import MatchForm from "../../components/admin/MatchForm";
import ResultForm from "../../components/admin/ResultForm";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Loading from "../../components/ui/Loading";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";

const PAGE_SIZES = [10, 20, 50];
const INITIAL_FILTERS = { season: "", category: "", team: "", status: "" };

// Trae los partidos de TODAS las temporadas (getMatches sin temporada solo devuelve
// la activa), para poder filtrar por temporada desde el panel.
async function loadAllMatches() {
  const seasonList = await getSeasons();
  if (!seasonList.length) return getMatches();
  const perSeason = await Promise.all(
    seasonList.map((season) => getMatches(undefined, season.id, undefined))
  );
  return perSeason.flat();
}

export default function AdminMatchesPage() {
  const matches = useAsync(loadAllMatches, []);
  const teams = useAsync(getTeams, []);
  const seasons = useAsync(getSeasons, []);
  const categories = useAsync(getCategories, []);
  const [formModal, setFormModal] = useState(null); // { mode, match }
  const [resultModal, setResultModal] = useState(null); // match
  const [confirm, setConfirm] = useState(null); // match a eliminar
  const { notify } = useToast();
  const save = useMutation();
  const result = useMutation();
  const remove = useMutation();

  // ---- Filtros, orden y paginación ----
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sort, setSort] = useState("desc"); // desc = más nuevos primero
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSort("desc");
  };

  const loading =
    matches.loading || teams.loading || seasons.loading || categories.loading;
  const error = matches.error || teams.error || seasons.error || categories.error;
  const teamList = teams.data || [];
  const seasonList = seasons.data || [];
  const categoryList = categories.data || [];
  const allMatches = matches.data || [];
  const missingSetup =
    !loading &&
    (teamList.length < 2 || seasonList.length === 0 || categoryList.length === 0);

  // Partidos filtrados + ordenados.
  const filtered = useMemo(() => {
    const list = allMatches.filter((m) => {
      if (filters.season && m.season?.id !== filters.season) return false;
      if (filters.category && m.category !== filters.category) return false;
      if (filters.status && m.status !== filters.status) return false;
      if (
        filters.team &&
        m.homeTeam?.id !== filters.team &&
        m.awayTeam?.id !== filters.team
      )
        return false;
      return true;
    });
    const key = (m) => `${m.date} ${m.time}`;
    list.sort((a, b) =>
      sort === "desc" ? key(b).localeCompare(key(a)) : key(a).localeCompare(key(b))
    );
    return list;
  }, [allMatches, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Al cambiar filtros/orden/tamaño, volver a la primera página.
  useEffect(() => {
    setPage(1);
  }, [filters, sort, pageSize]);

  const openCreate = () => {
    save.reset();
    setFormModal({ mode: "create" });
  };
  const openEdit = (match) => {
    save.reset();
    setFormModal({ mode: "edit", match });
  };
  const openResult = (match) => {
    result.reset();
    setResultModal(match);
  };

  const handleFormSubmit = (payload) => {
    save.run(
      () =>
        formModal.mode === "create"
          ? createMatch(payload)
          : updateMatch(formModal.match.id, payload),
      async () => {
        const created = formModal.mode === "create";
        setFormModal(null);
        await matches.reload();
        notify(created ? "Partido creado correctamente." : "Partido actualizado.");
      }
    );
  };

  const handleResultSubmit = (payload) => {
    result.run(
      () => loadResult(resultModal.id, payload.homeScore, payload.awayScore),
      async () => {
        setResultModal(null);
        await matches.reload();
        notify("Resultado cargado correctamente.");
      }
    );
  };

  const handleDelete = () => {
    remove.run(
      () => deleteMatch(confirm.id),
      async () => {
        setConfirm(null);
        await matches.reload();
        notify("Partido eliminado.");
      }
    );
  };

  return (
    <>
      <div className="toolbar">
        <h1>Partidos</h1>
        <button
          className="btn btn--primary"
          onClick={openCreate}
          disabled={missingSetup}
        >
          + Nuevo partido
        </button>
      </div>

      {missingSetup && (
        <div className="section">
          <Alert type="info">
            Para programar un partido necesitas al menos dos equipos, una temporada y
            una categoría creadas.
          </Alert>
        </div>
      )}

      {/* ---- Barra de filtros ---- */}
      {!loading && !error && allMatches.length > 0 && (
        <div className="admin-filters">
          <div className="admin-filter">
            <label htmlFor="f-season">Temporada</label>
            <select
              id="f-season"
              className="league-select"
              value={filters.season}
              onChange={(e) => setFilter("season", e.target.value)}
            >
              <option value="">Todas</option>
              {seasonList.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="admin-filter">
            <label htmlFor="f-category">Categoría</label>
            <select
              id="f-category"
              className="league-select"
              value={filters.category}
              onChange={(e) => setFilter("category", e.target.value)}
            >
              <option value="">Todas</option>
              {categoryList.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="admin-filter">
            <label htmlFor="f-team">Equipo</label>
            <select
              id="f-team"
              className="league-select"
              value={filters.team}
              onChange={(e) => setFilter("team", e.target.value)}
            >
              <option value="">Todos</option>
              {teamList.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="admin-filter">
            <label htmlFor="f-status">Estado</label>
            <select
              id="f-status"
              className="league-select"
              value={filters.status}
              onChange={(e) => setFilter("status", e.target.value)}
            >
              <option value="">Todos</option>
              <option value="played">Finalizados</option>
              <option value="scheduled">Próximos (programados)</option>
            </select>
          </div>

          <div className="admin-filter">
            <label htmlFor="f-sort">Orden</label>
            <select
              id="f-sort"
              className="league-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="desc">Más recientes</option>
              <option value="asc">Más antiguos</option>
            </select>
          </div>

          <button className="btn btn--ghost btn--sm" onClick={clearFilters}>
            Limpiar
          </button>
        </div>
      )}

      {loading ? (
        <Loading label="Cargando partidos..." />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : allMatches.length === 0 ? (
        <EmptyState
          icon="🏀"
          title="Sin partidos"
          message="Programa el primer partido de la temporada."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔎"
          title="Sin resultados"
          message="Ningún partido coincide con los filtros seleccionados."
        />
      ) : (
        <>
          {/* Info de resultados + tamaño de página */}
          <div className="pager pager--top">
            <span className="pager__info">
              Mostrando {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filtered.length)} de {filtered.length}{" "}
              partidos
            </span>
            <div className="admin-filter">
              <label htmlFor="f-pagesize">Por página</label>
              <select
                id="f-pagesize"
                className="league-select"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid--cards">
            {pageItems.map((match) => (
              <div key={match.id}>
                <MatchCard match={match} />
                <div className="flex gap-2 flex-wrap" style={{ marginTop: "8px" }}>
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => openResult(match)}
                  >
                    {match.status === "played" ? "Editar resultado" : "Cargar resultado"}
                  </button>
                  <button
                    className="btn btn--secondary btn--sm"
                    onClick={() => openEdit(match)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn--danger btn--sm"
                    onClick={() => setConfirm(match)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="pager pager--bottom">
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                ← Anterior
              </button>
              <span className="pager__info">
                Página {currentPage} de {totalPages}
              </span>
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {formModal && (
        <Modal
          title={formModal.mode === "create" ? "Nuevo partido" : "Editar partido"}
          onClose={() => setFormModal(null)}
        >
          <MatchForm
            initial={formModal.match}
            teams={teamList}
            seasons={seasonList}
            categories={categoryList}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormModal(null)}
            submitting={save.submitting}
            submitError={save.error}
          />
        </Modal>
      )}

      {resultModal && (
        <Modal title="Cargar resultado" onClose={() => setResultModal(null)}>
          <ResultForm
            match={resultModal}
            onSubmit={handleResultSubmit}
            onCancel={() => setResultModal(null)}
            submitting={result.submitting}
            submitError={result.error}
          />
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title="Eliminar partido"
          message={`¿Seguro que deseas eliminar el partido entre "${confirm.homeTeam?.name}" y "${confirm.awayTeam?.name}"?`}
          loading={remove.submitting}
          error={remove.error}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

import { useState } from "react";

import { useAsync } from "../../hooks/useAsync";
import { useMutation } from "../../hooks/useMutation";
import { useLeague } from "../../context/LeagueContext";
import {
  getSeasons,
  createSeason,
  updateSeason,
  activateSeason,
  deleteSeason
} from "../../services/seasonService";

import SeasonForm from "../../components/admin/SeasonForm";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Badge from "../../components/ui/Badge";
import Loading from "../../components/ui/Loading";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";

export default function AdminSeasonsPage() {
  const { data: seasons, loading, error, reload } = useAsync(getSeasons, []);
  const { refreshOptions } = useLeague();
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const save = useMutation();
  const act = useMutation();
  const remove = useMutation();

  const refresh = async () => {
    await reload();
    await refreshOptions();
  };

  const handleSubmit = (payload) => {
    save.run(
      () =>
        modal.mode === "create"
          ? createSeason(payload)
          : updateSeason(modal.season.id, payload),
      async () => {
        setModal(null);
        await refresh();
      }
    );
  };

  const handleActivate = (season) => {
    act.run(() => activateSeason(season.id), refresh);
  };

  const handleDelete = () => {
    remove.run(
      () => deleteSeason(confirm.id),
      async () => {
        setConfirm(null);
        await refresh();
      }
    );
  };

  return (
    <>
      <div className="toolbar">
        <h1>Temporadas</h1>
        <button
          className="btn btn--primary"
          onClick={() => {
            save.reset();
            setModal({ mode: "create" });
          }}
        >
          + Nueva temporada
        </button>
      </div>

      {loading ? (
        <Loading label="Cargando temporadas..." />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : seasons.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Sin temporadas"
          message="Crea la primera temporada para empezar a cargar partidos."
        />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Temporada</th>
                <th>Anio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {seasons.map((season) => (
                <tr key={season.id}>
                  <td className="cell-strong">{season.name}</td>
                  <td>{season.year}</td>
                  <td>
                    {season.isActive ? (
                      <Badge variant="played">Activa</Badge>
                    ) : (
                      <Badge variant="neutral">Inactiva</Badge>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      {!season.isActive && (
                        <button
                          className="btn btn--secondary btn--sm"
                          onClick={() => handleActivate(season)}
                          disabled={act.submitting}
                        >
                          Activar
                        </button>
                      )}
                      <button
                        className="btn btn--secondary btn--sm"
                        onClick={() => {
                          save.reset();
                          setModal({ mode: "edit", season });
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => {
                          remove.reset();
                          setConfirm(season);
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {act.error && (
        <div className="mt-4">
          <Alert type="error">{act.error}</Alert>
        </div>
      )}

      {modal && (
        <Modal
          title={modal.mode === "create" ? "Nueva temporada" : "Editar temporada"}
          onClose={() => setModal(null)}
        >
          <SeasonForm
            initial={modal.season}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
            submitting={save.submitting}
            submitError={save.error}
          />
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title="Eliminar temporada"
          message={`¿Seguro que deseas eliminar "${confirm.name}"? Solo es posible si no tiene partidos asociados.`}
          loading={remove.submitting}
          error={remove.error}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

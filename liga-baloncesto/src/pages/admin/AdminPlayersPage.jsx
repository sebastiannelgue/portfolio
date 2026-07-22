import { useState } from "react";

import { useAsync } from "../../hooks/useAsync";
import { useMutation } from "../../hooks/useMutation";
import { useToast } from "../../context/ToastContext";
import {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer
} from "../../services/playerService";
import { getTeams } from "../../services/teamService";
import { getCategories } from "../../services/categoryService";

import PlayerForm from "../../components/admin/PlayerForm";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Loading from "../../components/ui/Loading";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";

export default function AdminPlayersPage() {
  const players = useAsync(getPlayers, []);
  const teams = useAsync(getTeams, []);
  const categories = useAsync(getCategories, []);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const { notify } = useToast();
  const save = useMutation();
  const remove = useMutation();

  const loading = players.loading || teams.loading || categories.loading;
  const error = players.error || teams.error || categories.error;
  const teamList = teams.data || [];
  const categoryList = categories.data || [];
  const visiblePlayers = categoryFilter
    ? (players.data || []).filter((player) => player.category === categoryFilter)
    : players.data || [];

  const openCreate = () => {
    save.reset();
    setModal({ mode: "create" });
  };

  const openEdit = (player) => {
    save.reset();
    setModal({ mode: "edit", player });
  };

  const handleSubmit = (payload) => {
    save.run(
      () =>
        modal.mode === "create"
          ? createPlayer(payload)
          : updatePlayer(modal.player.id, payload),
      async () => {
        setModal(null);
        await players.reload();
        notify(
          modal.mode === "create"
            ? "Jugador creado correctamente."
            : "Jugador actualizado correctamente."
        );
      }
    );
  };

  const handleDelete = () => {
    remove.run(
      () => deletePlayer(confirm.id),
      async () => {
        setConfirm(null);
        await players.reload();
        await teams.reload();
        notify("Jugador eliminado.");
      }
    );
  };

  const cannotCreate =
    !loading && (teamList.length === 0 || categoryList.length === 0);

  return (
    <>
      <div className="toolbar">
        <h1>Jugadores</h1>
        <button
          className="btn btn--primary"
          onClick={openCreate}
          disabled={cannotCreate}
        >
          + Nuevo jugador
        </button>
      </div>

      {cannotCreate && (
        <div className="section">
          <Alert type="info">
            Para cargar jugadores necesitas al menos un equipo y una categoría creados.
          </Alert>
        </div>
      )}

      {!loading && !error && categoryList.length > 0 && (players.data || []).length > 0 && (
        <div
          className="flex gap-2"
          style={{ alignItems: "center", marginBottom: "var(--space-4)" }}
        >
          <span className="text-muted">Filtrar por categoría:</span>
          <select
            className="league-select"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="">Todas</option>
            {categoryList.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <Loading label="Cargando jugadores..." />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : visiblePlayers.length === 0 ? (
        <EmptyState
          icon="🏃"
          title="Sin jugadores"
          message={
            categoryFilter
              ? "No hay jugadores en esa categoría."
              : "Todavia no hay jugadores cargados en la liga."
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Jugador</th>
                <th>Categoria</th>
                <th>Equipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visiblePlayers.map((player) => (
                <tr key={player.id}>
                  <td className="cell-strong">{player.fullName}</td>
                  <td>
                    <Badge variant="primary">{player.category}</Badge>
                    {player.extraCategory && (
                      <Badge variant="warning" style={{ marginLeft: 6 }}>
                        ↑ {player.extraCategory}
                      </Badge>
                    )}
                  </td>
                  <td>{player.team?.name ?? "—"}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn--secondary btn--sm"
                        onClick={() => openEdit(player)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => setConfirm(player)}
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

      {modal && (
        <Modal
          title={modal.mode === "create" ? "Nuevo jugador" : "Editar jugador"}
          onClose={() => setModal(null)}
        >
          <PlayerForm
            initial={modal.player}
            teams={teamList}
            categories={categoryList}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
            submitting={save.submitting}
            submitError={save.error}
          />
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title="Eliminar jugador"
          message={`¿Seguro que deseas eliminar a "${confirm.fullName}"?`}
          loading={remove.submitting}
          error={remove.error}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

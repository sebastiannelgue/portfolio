import { useState } from "react";

import { useAsync } from "../../hooks/useAsync";
import { useMutation } from "../../hooks/useMutation";
import {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer
} from "../../services/playerService";
import { getCategories } from "../../services/categoryService";
import { personInitials } from "../../utils/text";

import Modal from "../ui/Modal";
import PlayerForm from "./PlayerForm";
import ConfirmDialog from "../ui/ConfirmDialog";
import Badge from "../ui/Badge";
import Loading from "../ui/Loading";
import Alert from "../ui/Alert";
import EmptyState from "../ui/EmptyState";

// Modal para ver y gestionar el plantel completo de un equipo en contexto:
// listar, agregar, editar y eliminar jugadores de ese equipo.
export default function TeamRosterModal({ team, onClose, onChanged }) {
  const { data, loading, error, reload } = useAsync(getPlayers, []);
  const categories = useAsync(getCategories, []);
  const [form, setForm] = useState(null); // { mode, player }
  const [confirm, setConfirm] = useState(null);
  const save = useMutation();
  const remove = useMutation();

  const roster = (data || []).filter((player) => player.team?.id === team.id);

  const refresh = async () => {
    await reload();
    if (onChanged) onChanged();
  };

  const handleSubmit = (payload) => {
    save.run(
      () =>
        form.mode === "create"
          ? createPlayer(payload)
          : updatePlayer(form.player.id, payload),
      async () => {
        setForm(null);
        await refresh();
      }
    );
  };

  const handleDelete = () => {
    remove.run(
      () => deletePlayer(confirm.id),
      async () => {
        setConfirm(null);
        await refresh();
      }
    );
  };

  return (
    <Modal title={`Plantel de ${team.name}`} onClose={onClose} maxWidth="640px">
      {form ? (
        <PlayerForm
          initial={form.mode === "create" ? { team: { id: team.id } } : form.player}
          teams={[team]}
          categories={categories.data || []}
          onSubmit={handleSubmit}
          onCancel={() => setForm(null)}
          submitting={save.submitting}
          submitError={save.error}
        />
      ) : (
        <>
          <div className="flex-between" style={{ marginBottom: "var(--space-4)" }}>
            <span className="text-muted">
              {roster.length} jugador{roster.length === 1 ? "" : "es"}
            </span>
            <button
              className="btn btn--primary btn--sm"
              onClick={() => {
                save.reset();
                setForm({ mode: "create" });
              }}
            >
              + Agregar jugador
            </button>
          </div>

          {loading ? (
            <Loading label="Cargando plantel..." />
          ) : error ? (
            <Alert type="error">{error}</Alert>
          ) : roster.length === 0 ? (
            <EmptyState
              icon="🏃"
              title="Sin jugadores"
              message="Este equipo todavia no tiene jugadores. Agrega el primero."
            />
          ) : (
            <div className="player-list">
              {roster.map((player) => (
                <div key={player.id} className="player-row">
                  <span className="player-row__avatar" aria-hidden="true">
                    {personInitials(player.firstName, player.lastName)}
                  </span>
                  <span className="player-row__name">{player.fullName}</span>
                  <span className="roster-actions">
                    <Badge variant="primary">{player.category}</Badge>
                    <button
                      className="btn btn--secondary btn--sm"
                      onClick={() => {
                        save.reset();
                        setForm({ mode: "edit", player });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => {
                        remove.reset();
                        setConfirm(player);
                      }}
                    >
                      Eliminar
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
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
    </Modal>
  );
}

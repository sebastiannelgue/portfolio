import { useState } from "react";

import { useAsync } from "../../hooks/useAsync";
import { useMutation } from "../../hooks/useMutation";
import { useLeague } from "../../context/LeagueContext";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../../services/categoryService";

import CategoryForm from "../../components/admin/CategoryForm";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Loading from "../../components/ui/Loading";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";

export default function AdminCategoriesPage() {
  const { data: categories, loading, error, reload } = useAsync(getCategories, []);
  const { refreshOptions } = useLeague();
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const save = useMutation();
  const remove = useMutation();

  const refresh = async () => {
    await reload();
    await refreshOptions();
  };

  const handleSubmit = (payload) => {
    save.run(
      () =>
        modal.mode === "create"
          ? createCategory(payload)
          : updateCategory(modal.category.id, payload),
      async () => {
        setModal(null);
        await refresh();
      }
    );
  };

  const handleDelete = () => {
    remove.run(
      () => deleteCategory(confirm.id),
      async () => {
        setConfirm(null);
        await refresh();
      }
    );
  };

  return (
    <>
      <div className="toolbar">
        <h1>Categorías</h1>
        <button
          className="btn btn--primary"
          onClick={() => {
            save.reset();
            setModal({ mode: "create" });
          }}
        >
          + Nueva categoría
        </button>
      </div>

      <div className="section">
        <Alert type="info">
          Cada categoría es un torneo aparte (U13, U15, U17...). Los partidos y la tabla
          se organizan por categoría.
        </Alert>
      </div>

      {loading ? (
        <Loading label="Cargando categorías..." />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : categories.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="Sin categorías"
          message="Crea la primera categoría (por ejemplo, U17)."
        />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Orden</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="cell-strong">{category.name}</td>
                  <td>{category.order}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn--secondary btn--sm"
                        onClick={() => {
                          save.reset();
                          setModal({ mode: "edit", category });
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => {
                          remove.reset();
                          setConfirm(category);
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

      {modal && (
        <Modal
          title={modal.mode === "create" ? "Nueva categoría" : "Editar categoría"}
          onClose={() => setModal(null)}
        >
          <CategoryForm
            initial={modal.category}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
            submitting={save.submitting}
            submitError={save.error}
          />
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title="Eliminar categoría"
          message={`¿Seguro que deseas eliminar "${confirm.name}"? Solo es posible si no tiene jugadores ni partidos asociados.`}
          loading={remove.submitting}
          error={remove.error}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

import api from "./api";

// GET /api/categories -> [{ id, name, order }]
export async function getCategories() {
  const { data } = await api.get("/categories");
  return data;
}

export async function createCategory(payload) {
  const { data } = await api.post("/categories", payload);
  return data;
}

export async function updateCategory(categoryId, payload) {
  const { data } = await api.put(`/categories/${categoryId}`, payload);
  return data;
}

export async function deleteCategory(categoryId) {
  const { data } = await api.delete(`/categories/${categoryId}`);
  return data;
}

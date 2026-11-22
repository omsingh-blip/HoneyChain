
import api from "../lib/api";

export async function getHives(params = {}) {
  const response = await api.get("/hives", { params });
  return response.data;
}

export async function getHiveById(id) {
  const response = await api.get(`/hives/${id}`);
  return response.data;
}

export async function createHive(hiveData) {
  const response = await api.post("/hives", hiveData);
  return response.data;
}

export async function updateHive(id, updates) {
  const response = await api.patch(`/hives/${id}`, updates);
  return response.data;
}

export async function deactivateHive(id) {
  const response = await api.delete(`/hives/${id}`);
  return response.data;
}

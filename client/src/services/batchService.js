import api from "../lib/api";

export async function getBatches(params = {}) {
  const response = await api.get("/batches", { params });
  return response.data;
}

export async function getBatchById(id) {
  const response = await api.get(`/batches/${id}`);
  return response.data;
}

export async function createBatch(batchData) {
  const response = await api.post("/batches", batchData);
  return response.data;
}

export async function updateBatchStatus(id, status) {
  const response = await api.patch(`/batches/${id}/status`, {
    status,
  });
  return response.data;
}

export async function traceBatch(batchId) {
  const response = await api.get(
    `/batches/trace/${encodeURIComponent(batchId)}`
  );
  return response.data;
}
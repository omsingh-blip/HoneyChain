import api from "./api";

export async function testApiConnection() {
  const response = await api.get("/health");
  return response.data;
}
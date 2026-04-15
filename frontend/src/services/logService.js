import api from "./api";

export async function fetchLogs() {
  const { data } = await api.get("/api/logs");
  return data;
}

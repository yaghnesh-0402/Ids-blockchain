import api from "./api";

export async function startRealtimeCapture(payload = {}) {
  const { data } = await api.post("/api/realtime/start", payload);
  return data;
}

export async function stopRealtimeCapture() {
  const { data } = await api.post("/api/realtime/stop");
  return data;
}

export async function fetchRealtimeStatus() {
  const { data } = await api.get("/api/realtime/status");
  return data;
}

export async function fetchRealtimeEvents() {
  const { data } = await api.get("/api/realtime/events");
  return data;
}

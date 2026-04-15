import api from "./api";

export async function runDetection(packetData) {
  const { data } = await api.post("/api/detect", packetData);
  return data;
}

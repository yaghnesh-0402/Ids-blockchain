import api from "./api";

export async function runDetection(packetData, modelType) {
  const { data } = await api.post("/api/detect", {
    ...packetData,
    modelType
  });
  return data;
}

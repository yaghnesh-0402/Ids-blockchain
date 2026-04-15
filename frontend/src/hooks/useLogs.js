import { useEffect, useState } from "react";
import { fetchLogs } from "../services/logService";

export function useLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLogs() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return { logs, loading, error, reload: loadLogs };
}

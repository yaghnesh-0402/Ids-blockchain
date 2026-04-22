import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusMessage from "../components/StatusMessage";
import {
  fetchRealtimeEvents,
  fetchRealtimeStatus,
  startRealtimeCapture,
  stopRealtimeCapture
} from "../services/realtimeService";

const modelOptions = [
  { id: "ensemble", label: "Ensemble" },
  { id: "rf", label: "Random Forest" },
  { id: "et", label: "Extra Trees" },
  { id: "xgb", label: "XGBoost" }
];

function RealtimeMonitoring() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState(null);
  const [selectedModel, setSelectedModel] = useState("ensemble");
  const [loading, setLoading] = useState(true);
  const [captureLoading, setCaptureLoading] = useState(false);
  const [error, setError] = useState("");

  async function refreshRealtimeData() {
    try {
      const [statusData, eventsData] = await Promise.all([fetchRealtimeStatus(), fetchRealtimeEvents()]);
      setStatus(statusData);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to fetch realtime capture status.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshRealtimeData();
    const timer = setInterval(refreshRealtimeData, 5000);

    return () => clearInterval(timer);
  }, []);

  async function handleStart() {
    setCaptureLoading(true);
    setError("");

    try {
      const response = await startRealtimeCapture({ modelType: selectedModel });
      setStatus(response.status);
      await refreshRealtimeData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to start realtime capture.");
    } finally {
      setCaptureLoading(false);
    }
  }

  async function handleStop() {
    setCaptureLoading(true);
    setError("");

    try {
      const response = await stopRealtimeCapture();
      setStatus(response.status);
      await refreshRealtimeData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to stop realtime capture.");
    } finally {
      setCaptureLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Realtime Detection"
        title="Live Monitoring"
        description="Scapy capture runs in 30-second windows, aggregates flow features, runs intrusion detection, logs each flow, and only anchors suspicious detections to blockchain."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="glass-panel scan-line rounded-3xl p-6">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-100/45">Packet Capture</p>
          <h3 className="mt-2 font-display text-3xl font-bold text-white">
            {status?.running ? "Listening for packets..." : "Capture is currently stopped"}
          </h3>
          <div className="mt-8 rounded-full border border-signal/30 bg-signal/10 p-2">
            <div className={`h-3 rounded-full bg-signal shadow-glow ${status?.running ? "w-2/3" : "w-1/4"}`} />
          </div>
          {error ? (
            <div className="mt-6">
              <StatusMessage type="error">{error}</StatusMessage>
            </div>
          ) : null}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-emerald-100/50">Feed Mode</p>
              <p className="mt-2 text-xl font-bold text-signal">{status?.running ? "Live Scapy" : "Idle"}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-emerald-100/50">Buffer</p>
              <p className="mt-2 text-xl font-bold">{events.length} events</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-emerald-100/50">Flows Processed</p>
              <p className="mt-2 text-xl font-bold">{status?.flowsProcessed || 0}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-emerald-100/50">Suspicious</p>
              <p className="mt-2 text-xl font-bold text-danger">{status?.suspiciousCount || 0}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {modelOptions.map((model) => {
              const isActive = selectedModel === model.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  disabled={status?.running}
                  onClick={() => setSelectedModel(model.id)}
                  className={[
                    "rounded-2xl border px-4 py-3 text-left text-sm font-bold transition",
                    isActive ? "border-amber bg-amber text-obsidian" : "border-white/10 bg-white/5 text-emerald-100/70",
                    status?.running ? "cursor-not-allowed opacity-60" : "hover:border-amber/50 hover:bg-white/10"
                  ].join(" ")}
                >
                  {model.label}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={captureLoading || status?.running}
              onClick={handleStart}
              className="rounded-2xl bg-signal px-5 py-3 font-extrabold text-obsidian shadow-glow transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {captureLoading && !status?.running ? "Starting..." : "Start Capture"}
            </button>
            <button
              type="button"
              disabled={captureLoading || !status?.running}
              onClick={handleStop}
              className="rounded-2xl border border-danger/50 px-5 py-3 font-extrabold text-danger transition hover:bg-danger hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {captureLoading && status?.running ? "Stopping..." : "Stop Capture"}
            </button>
          </div>
          <p className="mt-6 text-sm text-emerald-100/55">
            Packets are sniffed with Scapy, grouped into flow windows, and only suspicious predictions are sent to blockchain.
          </p>
        </section>

        <section className="glass-panel rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-100/45">Live Feed</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">Realtime Flow Detections</h3>
            </div>
            <span className="rounded-full bg-signal/10 px-3 py-1 text-sm font-bold text-signal">
              {status?.running ? "Capture online" : "Capture offline"}
            </span>
          </div>

          {loading ? <StatusMessage>Loading realtime status...</StatusMessage> : null}
          {!loading && !events.length ? (
            <StatusMessage>Start capture to populate realtime detections every 30 seconds.</StatusMessage>
          ) : null}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/50">Flow</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/50">Protocol</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/50">Prediction</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/50">Confidence</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/50">Blockchain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {events.map((event) => (
                  <tr key={event.id} className="transition hover:bg-white/[0.04]">
                    <td className="px-5 py-4 font-mono text-xs text-emerald-100/70">{event.source}</td>
                    <td className="px-5 py-4 text-sm text-emerald-100/70">{event.protocol}</td>
                    <td className="px-5 py-4">
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-sm font-bold",
                          event.suspicious ? "bg-danger/15 text-danger" : "bg-signal/10 text-signal"
                        ].join(" ")}
                      >
                        {event.prediction}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-emerald-100/70">
                      {typeof event.confidence === "number" ? `${(event.confidence * 100).toFixed(1)}%` : "N/A"}
                    </td>
                    <td className="px-5 py-4 text-sm text-emerald-100/70">
                      {event.blockchain?.status === "stored" ? "Stored" : "Skipped"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

export default RealtimeMonitoring;

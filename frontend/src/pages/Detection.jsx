import { useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusMessage from "../components/StatusMessage";
import { runDetection } from "../services/detectionService";

const samplePacket = {
  "Flow Duration": 1200,
  "Total Fwd Packets": 8,
  "Total Backward Packets": 5,
  "Total Length of Fwd Packets": 480,
  "Total Length of Bwd Packets": 260,
  "Flow Bytes/s": 616.6,
  "Flow Packets/s": 10.8,
  "SYN Flag Count": 1,
  "ACK Flag Count": 1
};

function Detection() {
  const [payload, setPayload] = useState(JSON.stringify(samplePacket, null, 2));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const packetData = JSON.parse(payload);
      const data = await runDetection(packetData);
      setResult(data);
    } catch (requestError) {
      if (requestError instanceof SyntaxError) {
        setError("Packet data must be valid JSON.");
      } else {
        setError(requestError.response?.data?.message || "Detection request failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Manual Analysis"
        title="Detection Console"
        description="Submit packet or flow JSON. Missing model fields are safely filled with zero so this can evolve for realtime captures."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form className="glass-panel rounded-3xl p-6" onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <label className="font-display text-2xl font-bold text-white" htmlFor="packet-json">
              Packet JSON
            </label>
            <button
              type="button"
              onClick={() => setPayload(JSON.stringify(samplePacket, null, 2))}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-emerald-100/70 hover:bg-white/10"
            >
              Load Sample
            </button>
          </div>
          <textarea
            id="packet-json"
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            className="min-h-[420px] w-full rounded-3xl border border-white/10 bg-black/40 p-5 font-mono text-sm text-emerald-50 outline-none transition focus:border-signal"
            spellCheck="false"
          />
          {error ? (
            <div className="mt-4">
              <StatusMessage type="error">{error}</StatusMessage>
            </div>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 rounded-2xl bg-signal px-6 py-3 font-extrabold text-obsidian shadow-glow transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Running model..." : "Run Detection"}
          </button>
        </form>

        <section className="glass-panel rounded-3xl p-6">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-100/45">Model Output</p>
          <h3 className="mt-2 font-display text-3xl font-bold text-white">Detection Result</h3>

          {!result ? (
            <div className="mt-8">
              <StatusMessage>Submit packet JSON to receive prediction, confidence, hash, and missing fields.</StatusMessage>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              <div className="rounded-3xl border border-signal/20 bg-signal/10 p-5">
                <p className="text-sm uppercase tracking-[0.28em] text-signal/75">Prediction</p>
                <p className="mt-2 font-display text-4xl font-bold text-signal">{result.prediction}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-emerald-100/50">Confidence</p>
                  <p className="mt-2 text-2xl font-bold">
                    {typeof result.confidence === "number" ? `${(result.confidence * 100).toFixed(2)}%` : "N/A"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-emerald-100/50">Model</p>
                  <p className="mt-2 text-2xl font-bold uppercase">{result.modelType || "rf"}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-black/30 p-4">
                <p className="text-sm text-emerald-100/50">Hash</p>
                <p className="mt-2 break-all font-mono text-xs text-emerald-100/70">{result.hash}</p>
              </div>
              <p className="text-sm text-emerald-100/55">
                Missing fields filled with zero: {result.missingFields?.length || 0}
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default Detection;

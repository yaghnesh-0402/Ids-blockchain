import { useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusMessage from "../components/StatusMessage";
import { runDetection } from "../services/detectionService";
import { examplePayloads, stringifyPayload } from "../services/examplePayloads";

function Detection() {
  const [activeExample, setActiveExample] = useState(examplePayloads[0].id);
  const [payload, setPayload] = useState(stringifyPayload(examplePayloads[0].payload));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const selectedExample = examplePayloads.find((example) => example.id === activeExample);

  function loadExample(example) {
    setActiveExample(example.id);
    setPayload(stringifyPayload(example.payload));
    setResult(null);
    setError("");
  }

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
        description="Submit packet or flow JSON. Use complete pre-configured examples that match the model feature schema exactly, or edit the payload manually."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form className="glass-panel rounded-3xl p-6" onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col gap-4">
            <label className="font-display text-2xl font-bold text-white" htmlFor="packet-json">
              Packet JSON
            </label>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-emerald-100/45">
                    Example Payloads
                  </p>
                  <p className="mt-1 text-sm text-emerald-100/60">
                    Select a complete feature-aligned scenario, then run detection or adjust values.
                  </p>
                </div>
                <span className="rounded-full bg-signal/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-signal">
                  Complete schema
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {examplePayloads.map((example) => {
                  const isActive = activeExample === example.id;

                  return (
                    <button
                      key={example.id}
                      type="button"
                      onClick={() => loadExample(example)}
                      className={[
                        "rounded-2xl border p-4 text-left transition",
                        isActive
                          ? "border-signal bg-signal text-obsidian shadow-glow"
                          : "border-white/10 bg-white/[0.04] text-emerald-50 hover:border-signal/50 hover:bg-white/10"
                      ].join(" ")}
                    >
                      <span className="text-xs font-extrabold uppercase tracking-[0.2em] opacity-70">
                        {example.badge}
                      </span>
                      <span className="mt-2 block font-display text-lg font-bold">{example.label}</span>
                    </button>
                  );
                })}
              </div>

              {selectedExample ? (
                <p className="mt-4 text-sm text-emerald-100/60">{selectedExample.description}</p>
              ) : null}
            </div>
          </div>
          <textarea
            id="packet-json"
            value={payload}
            onChange={(event) => {
              setPayload(event.target.value);
              setActiveExample("custom");
            }}
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

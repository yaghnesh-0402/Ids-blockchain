import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";

const seedEvents = [
  { id: 1, source: "192.168.1.14", protocol: "TCP", prediction: "BENIGN", confidence: 0.91 },
  { id: 2, source: "10.0.0.23", protocol: "UDP", prediction: "Probe", confidence: 0.84 },
  { id: 3, source: "172.16.4.8", protocol: "TCP", prediction: "DoS", confidence: 0.88 }
];

function RealtimeMonitoring() {
  const [events, setEvents] = useState(seedEvents);

  useEffect(() => {
    const timer = setInterval(() => {
      setEvents((currentEvents) => {
        const nextId = currentEvents[0]?.id + 1 || 1;
        const simulated = {
          id: nextId,
          source: `10.10.${nextId % 255}.${(nextId * 7) % 255}`,
          protocol: nextId % 2 ? "TCP" : "UDP",
          prediction: nextId % 4 === 0 ? "BENIGN" : nextId % 3 === 0 ? "PortScan" : "Monitoring",
          confidence: 0.7 + ((nextId % 25) / 100)
        };

        return [simulated, ...currentEvents].slice(0, 8);
      });
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Realtime Ready"
        title="Live Monitoring"
        description="This screen uses simulated feed data today. The component state is isolated so WebSocket or polling events can plug in later."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="glass-panel scan-line rounded-3xl p-6">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-100/45">Packet Capture</p>
          <h3 className="mt-2 font-display text-3xl font-bold text-white">Listening for packets...</h3>
          <div className="mt-8 rounded-full border border-signal/30 bg-signal/10 p-2">
            <div className="h-3 w-2/3 rounded-full bg-signal shadow-glow" />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-emerald-100/50">Feed Mode</p>
              <p className="mt-2 text-xl font-bold text-signal">Simulated</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-emerald-100/50">Buffer</p>
              <p className="mt-2 text-xl font-bold">{events.length} events</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-emerald-100/55">
            Future packet capture can call `/api/realtime/ingest`, then this page can subscribe with WebSocket or poll the latest stream.
          </p>
        </section>

        <section className="glass-panel rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-100/45">Live Feed</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">Dynamic Packet Events</h3>
            </div>
            <span className="rounded-full bg-signal/10 px-3 py-1 text-sm font-bold text-signal">
              Online placeholder
            </span>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/50">Source</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/50">Protocol</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/50">Prediction</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/50">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {events.map((event) => (
                  <tr key={event.id} className="transition hover:bg-white/[0.04]">
                    <td className="px-5 py-4 font-mono text-sm text-emerald-100/70">{event.source}</td>
                    <td className="px-5 py-4 text-sm text-emerald-100/70">{event.protocol}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-signal/10 px-3 py-1 text-sm font-bold text-signal">
                        {event.prediction}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-emerald-100/70">
                      {(event.confidence * 100).toFixed(1)}%
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

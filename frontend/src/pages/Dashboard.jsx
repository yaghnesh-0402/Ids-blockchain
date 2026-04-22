import LogsTable from "../components/LogsTable";
import MetricCard from "../components/MetricCard";
import PageHeader from "../components/PageHeader";
import StatusMessage from "../components/StatusMessage";
import { useLogs } from "../hooks/useLogs";

function isAttack(log) {
  const prediction = String(log.prediction ?? "").trim().toLowerCase();

  if (prediction === "1") {
    return true;
  }

  if (prediction === "0") {
    return false;
  }

  if (prediction.includes("benign") || prediction.includes("normal")) {
    return false;
  }

  return Boolean(prediction);
}

function Dashboard() {
  const { logs, loading, error, reload } = useLogs();
  const attackCount = logs.filter(isAttack).length;
  const normalCount = logs.length - attackCount;
  const recentLogs = logs.slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow="Command Overview"
        title="AI IDS Dashboard"
        description="A compact operational view of model decisions, attack volume, and immutable log hashes."
        action={
          <button
            type="button"
            onClick={reload}
            className="rounded-2xl border border-signal/40 px-5 py-3 font-bold text-signal transition hover:bg-signal hover:text-obsidian"
          >
            Refresh Logs
          </button>
        }
      />

      {error ? (
        <div className="mb-6">
          <StatusMessage type="warning">
            {error} Dashboard metrics need admin log access from `GET /api/logs`.
          </StatusMessage>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-3">
        <MetricCard label="Total Logs" value={loading ? "..." : logs.length} detail="Persisted detection records" />
        <MetricCard label="Attack Count" value={loading ? "..." : attackCount} tone="danger" detail="Non-benign predictions" />
        <MetricCard label="Normal Count" value={loading ? "..." : normalCount} tone="signal" detail="Benign or normal outcomes" />
      </div>

      <section className="glass-panel mt-8 rounded-3xl p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-100/45">Recent Activity</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-white">Latest Decisions</h3>
          </div>
          <span className="rounded-full bg-signal/10 px-3 py-1 text-sm font-bold text-signal">
            {loading ? "Loading" : `${recentLogs.length} shown`}
          </span>
        </div>
        {recentLogs.length ? <LogsTable logs={recentLogs} /> : <StatusMessage>No logs available yet.</StatusMessage>}
      </section>
    </>
  );
}

export default Dashboard;

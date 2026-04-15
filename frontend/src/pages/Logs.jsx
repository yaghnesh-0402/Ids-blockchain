import LogsTable from "../components/LogsTable";
import PageHeader from "../components/PageHeader";
import StatusMessage from "../components/StatusMessage";
import { useLogs } from "../hooks/useLogs";

function Logs() {
  const { logs, loading, error, reload } = useLogs();

  return (
    <>
      <PageHeader
        eyebrow="Audit Trail"
        title="Detection Logs"
        description="Stored model decisions with confidence and SHA-256 hashes for blockchain anchoring."
        action={
          <button
            type="button"
            onClick={reload}
            className="rounded-2xl border border-signal/40 px-5 py-3 font-bold text-signal transition hover:bg-signal hover:text-obsidian"
          >
            Refresh
          </button>
        }
      />

      <section className="glass-panel rounded-3xl p-6">
        {loading ? <StatusMessage>Loading logs...</StatusMessage> : null}
        {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
        {!loading && !error && logs.length ? <LogsTable logs={logs} /> : null}
        {!loading && !error && !logs.length ? <StatusMessage>No logs have been stored yet.</StatusMessage> : null}
      </section>
    </>
  );
}

export default Logs;

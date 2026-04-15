function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(new Date(value));
}

function LogsTable({ logs }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.24em] text-emerald-100/50">
                Timestamp
              </th>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.24em] text-emerald-100/50">
                Prediction
              </th>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.24em] text-emerald-100/50">
                Confidence
              </th>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.24em] text-emerald-100/50">
                Hash
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {logs.map((log) => (
              <tr key={log._id || log.hash} className="transition hover:bg-white/[0.04]">
                <td className="whitespace-nowrap px-5 py-4 text-sm text-emerald-100/70">
                  {formatDate(log.timestamp)}
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-signal/10 px-3 py-1 text-sm font-bold text-signal">
                    {log.prediction}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-emerald-100/70">
                  {typeof log.confidence === "number" ? `${(log.confidence * 100).toFixed(2)}%` : "N/A"}
                </td>
                <td className="max-w-xs truncate px-5 py-4 font-mono text-xs text-emerald-100/55">
                  {log.hash}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LogsTable;

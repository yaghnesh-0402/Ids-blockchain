function MetricCard({ label, value, tone = "signal", detail }) {
  const toneClass = {
    signal: "text-signal",
    amber: "text-amber",
    danger: "text-danger"
  }[tone];

  return (
    <div className="glass-panel rounded-3xl p-6">
      <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-100/45">{label}</p>
      <p className={`mt-5 font-display text-5xl font-bold ${toneClass}`}>{value}</p>
      {detail ? <p className="mt-4 text-sm text-emerald-100/55">{detail}</p> : null}
    </div>
  );
}

export default MetricCard;

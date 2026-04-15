function StatusMessage({ type = "info", children }) {
  const styles = {
    info: "border-signal/20 bg-signal/10 text-signal",
    error: "border-danger/25 bg-danger/10 text-rose-100",
    warning: "border-amber/25 bg-amber/10 text-amber"
  };

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[type]}`}>{children}</div>;
}

export default StatusMessage;

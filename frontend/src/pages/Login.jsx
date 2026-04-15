import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StatusMessage from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="glass-panel scan-line w-full max-w-md rounded-[2rem] p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.42em] text-signal">Secure Access</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-white">IDS Login</h1>
        <p className="mt-3 text-emerald-100/60">Resume monitoring and run AI-powered packet checks.</p>

        <form className="relative z-10 mt-8 space-y-5" onSubmit={handleSubmit}>
          {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
          <label className="block">
            <span className="text-sm font-bold text-emerald-100/70">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-signal"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-emerald-100/70">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-signal"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-signal px-5 py-3 font-extrabold text-obsidian shadow-glow transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Authenticating..." : "Enter Dashboard"}
          </button>
        </form>

        <p className="relative z-10 mt-6 text-center text-sm text-emerald-100/60">
          New operator?{" "}
          <Link to="/register" className="font-bold text-signal">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

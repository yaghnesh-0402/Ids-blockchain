import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StatusMessage from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="glass-panel w-full max-w-md rounded-[2rem] p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.42em] text-signal">Operator Setup</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-white">Create Account</h1>
        <p className="mt-3 text-emerald-100/60">Create a session-secured IDS dashboard account.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
          <label className="block">
            <span className="text-sm font-bold text-emerald-100/70">Username</span>
            <input
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-signal"
              required
            />
          </label>
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-emerald-100/60">
          Already registered?{" "}
          <Link to="/login" className="font-bold text-signal">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

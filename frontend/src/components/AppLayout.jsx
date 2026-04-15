import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Detection", path: "/detect" },
  { label: "Logs", path: "/logs" },
  { label: "Real-Time", path: "/realtime" }
];

function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen text-emerald-50">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/10 bg-black/30 p-6 backdrop-blur-xl lg:block">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.42em] text-signal/70">Neural IDS</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white">
            Threat Command
          </h1>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                [
                  "block rounded-2xl px-4 py-3 text-sm font-bold transition",
                  isActive
                    ? "bg-signal text-obsidian shadow-glow"
                    : "text-emerald-100/70 hover:bg-white/10 hover:text-white"
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-100/50">Signed in</p>
          <p className="mt-2 truncate font-display text-lg font-semibold text-white">{user?.username}</p>
          <p className="text-sm text-emerald-100/60">{user?.role}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full rounded-2xl border border-danger/40 px-4 py-2 text-sm font-bold text-danger transition hover:bg-danger hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="lg:pl-72">
        <div className="sticky top-0 z-10 border-b border-white/10 bg-obsidian/75 px-5 py-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-signal">Neural IDS</p>
              <p className="font-display text-lg font-bold">Threat Command</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold"
            >
              Logout
            </button>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  [
                    "shrink-0 rounded-full px-4 py-2 text-sm font-bold",
                    isActive ? "bg-signal text-obsidian" : "bg-white/10 text-emerald-100/75"
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;


import { Outlet, useNavigate } from "react-router";
import ThemeToggle from "../common/ThemeToggle";
import Sidebar from "./Sidebar";
import { useAuthStore } from "../../store/authStore";

export default function DashboardLayout() {
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-app-border bg-app-bg px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs text-app-muted">
              HONEYCHAIN WORKSPACE
            </p>

            <p className="mt-1 font-semibold text-app-text">
              Apiary Management
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-app-text">
                {user?.name || "Beekeeper"}
              </p>

              <p className="text-xs text-app-muted">
                {user?.email}
              </p>
            </div>

            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="rounded-lg border border-app-border px-4 py-2 text-sm font-medium text-app-muted transition hover:bg-app-elevated hover:text-app-text"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="min-w-0 p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

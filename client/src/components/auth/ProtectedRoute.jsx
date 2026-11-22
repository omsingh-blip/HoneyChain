
import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../store/authStore";

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const isInitializing = useAuthStore(
    (state) => state.isInitializing
  );

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-honey border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-app-muted">
            Restoring your session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

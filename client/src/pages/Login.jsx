
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const result = await login(formData);

    if (result.success) {
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.message);
    }
  }

  return (
    <main className="min-h-screen bg-app-bg text-app-text flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-8">
          <span className="text-3xl font-bold text-honey">
            HoneyChain
          </span>
          <p className="text-app-muted text-sm mt-2">
            Smart Beekeeping. Trusted Honey.
          </p>
        </Link>

        <div className="bg-app-surface border border-app-border rounded-2xl p-7 sm:p-9 shadow-xl">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back
          </h1>

          <p className="text-app-muted text-sm mb-7">
            Sign in to manage your apiaries and honey batches.
          </p>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-app-border bg-app-bg px-4 py-3 outline-none focus:border-honey"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-app-border bg-app-bg px-4 py-3 outline-none focus:border-honey"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-honey px-4 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-app-muted mt-7">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-honey hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-app-muted mt-6">
          HoneyChain — Transparent honey traceability.
        </p>
      </div>
    </main>
  );
}

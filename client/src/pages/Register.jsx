import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../store/authStore";

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [formData, setFormData] = useState({
    name: "",
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

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    const result = await register(formData);

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
            Create your account
          </h1>

          <p className="text-app-muted text-sm mb-7">
            Join HoneyChain and start managing your honey production.
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
                htmlFor="name"
                className="block text-sm font-medium mb-2"
              >
                Full name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                autoComplete="name"
                maxLength={80}
                required
                className="w-full rounded-lg border border-app-border bg-app-bg px-4 py-3 outline-none focus:border-honey"
              />
            </div>

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
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-lg border border-app-border bg-app-bg px-4 py-3 outline-none focus:border-honey"
              />

              <p className="text-xs text-app-muted mt-2">
                Use at least 8 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-honey px-4 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-app-muted mt-7">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-semibold text-honey hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

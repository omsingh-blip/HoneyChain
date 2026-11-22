
import { useEffect, useState } from "react";

const STORAGE_KEY = "honeychain-theme";

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  } catch {
    // Use the default if browser storage is unavailable.
  }

  return "dark";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // The theme still works for this session.
    }
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={!isDark}
      className="inline-flex items-center gap-2 rounded-full
        border border-app-border bg-app-surface px-3 py-2
        text-app-text transition hover:bg-app-elevated
        focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-honey"
    >
      <span aria-hidden="true">{isDark ? "☀️" : "🌙"}</span>
      <span className="text-sm font-medium">
        {isDark ? "Light mode" : "Dark mode"}
      </span>
    </button>
  );
}

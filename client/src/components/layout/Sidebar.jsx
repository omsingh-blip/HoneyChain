
import { NavLink } from "react-router";

const navigationItems = [
  {
    name: "Overview",
    path: "/dashboard",
    icon: "◫",
    end: true,
  },
  {
    name: "Hive Management",
    path: "/hives",
    icon: "♧",
  },
  {
    name: "Honey Batches",
    path: "/batches",
    icon: "⬡",
  },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full min-h-screen flex-col border-r border-app-border bg-app-surface px-4 py-6">
      {/* Brand */}
      <NavLink to="/" className="mb-10 flex items-center gap-3 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-honey text-2xl text-black">
          🐝
        </span>

        <span>
          <span className="block text-lg font-bold tracking-tight text-app-text">
            HoneyChain
          </span>
          <span className="block text-xs text-app-muted">
            Smart Beekeeping
          </span>
        </span>
      </NavLink>

      {/* Navigation */}
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-app-muted">
        Workspace
      </p>

      <nav aria-label="Dashboard navigation" className="flex flex-col gap-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-honey",
                isActive
                  ? "bg-app-elevated text-app-primary"
                  : "text-app-muted hover:bg-app-elevated hover:text-app-text",
              ].join(" ")
            }
          >
            <span aria-hidden="true" className="w-5 text-center text-lg">
              {item.icon}
            </span>

            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-app-border pt-5">
        <p className="px-2 text-xs leading-5 text-app-muted">
          Traceability.
          <br />
          Transparency.
          <br />
          Trust.
        </p>

        <p className="mt-4 px-2 text-xs text-app-muted">
          HoneyChain © 2026
        </p>
      </div>
    </aside>
  );
}

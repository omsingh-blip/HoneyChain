import { useState } from "react";
import { Link, NavLink } from "react-router";

import ThemeToggle from "../common/ThemeToggle";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Traceability", href: "#traceability" },
  { label: "For Beekeepers", href: "#beekeepers" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const dashboardClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive
        ? "text-honey"
        : "text-app-muted hover:text-app-primary"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-app-border bg-app-bg/95 backdrop-blur">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2"
        >
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-xl bg-honey text-xl font-bold text-[#0B0D0C]"
          >
            ⬡
          </span>

          <span className="text-xl font-bold tracking-tight text-app-text">
            Honey<span className="text-honey">Chain</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-app-muted transition hover:text-app-primary"
            >
              {link.label}
            </a>
          ))}

          <NavLink to="/dashboard" className={dashboardClass}>
            Dashboard
          </NavLink>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <Link
            to="/register"
            className="hidden rounded-xl bg-honey px-4 py-2.5 text-sm font-semibold text-[#0B0D0C] transition hover:bg-honey-bright sm:inline-flex"
          >
            Get Started
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-lg border border-app-border text-app-text transition hover:bg-app-surface md:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" className="text-xl">
              {menuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile navigation */}
      {menuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-app-border bg-app-surface px-5 py-4 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="py-1 text-sm font-medium text-app-text transition hover:text-app-primary"
              >
                {link.label}
              </a>
            ))}

            <NavLink
              to="/dashboard"
              onClick={closeMenu}
              className={dashboardClass}
            >
              Dashboard
            </NavLink>

            <div className="flex flex-wrap items-center gap-3 border-t border-app-border pt-4">
              <ThemeToggle />

              <Link
                to="/register"
                onClick={closeMenu}
                className="rounded-xl bg-honey px-4 py-2.5 text-sm font-semibold text-[#0B0D0C] transition hover:bg-honey-bright"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

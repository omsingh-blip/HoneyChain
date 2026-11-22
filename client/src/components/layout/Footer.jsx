
const footerLinks = [
  {
    title: "Platform",
    links: [
      { label: "Features", href: "#features" },
      { label: "Traceability", href: "#traceability" },
      { label: "For Beekeepers", href: "#beekeepers" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Verify a Batch", href: "/verify" },
      { label: "Get Started", href: "#get-started" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-app-border bg-app-surface/50">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <a href="/" className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-xl bg-honey text-xl font-bold text-[#0B0D0C]"
              >
                ⬡
              </span>

              <span className="text-xl font-bold text-app-text">
                Honey<span className="text-honey">Chain</span>
              </span>
            </a>

            <p className="mt-4 max-w-sm text-sm leading-7 text-app-muted">
              Connecting digital beekeeping records with transparent
              honey supply-chain tracking.
            </p>
          </div>

          {/* Footer navigation */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h2 className="font-semibold text-app-text">
                {group.title}
              </h2>

              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-app-muted transition hover:text-app-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-app-border pt-6 text-sm text-app-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} HoneyChain. All rights reserved.
          </p>

          <p className="max-w-xl text-xs leading-5">
            Blockchain records can support data-integrity checks but
            do not independently prove honey purity, safety, or origin.
          </p>
        </div>
      </div>
    </footer>
  );
}

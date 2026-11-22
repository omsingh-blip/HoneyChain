
const features = [
  {
    number: "01",
    icon: "⬡",
    title: "Blockchain Traceability",
    description:
      "Follow registered honey batches through recorded supply-chain events, with tamper-evident data references.",
    tag: "TRANSPARENT RECORDS",
  },
  {
    number: "02",
    icon: "♧",
    title: "Smart Hive Management",
    description:
      "Organize hive registrations, inspections, colony observations, and harvest records in one workspace.",
    tag: "DIGITAL BEEKEEPING",
  },
  {
    number: "03",
    icon: "▦",
    title: "QR Batch Verification",
    description:
      "Let customers scan a batch QR code to explore available origin details and recorded journey history.",
    tag: "CUSTOMER TRUST",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="bg-app-surface/50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-app-primary">
            One connected ecosystem
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-app-text sm:text-5xl">
            Better beekeeping.
            <span className="block text-honey">
              More transparent honey.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-app-muted sm:text-lg">
            Bring hive management and honey traceability together,
            from harvest records to customer verification.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="group rounded-2xl border border-app-border bg-app-bg p-6 transition duration-300 hover:-translate-y-1 hover:border-honey/50 sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-xl bg-honey/10 text-2xl text-app-primary">
                  {feature.icon}
                </span>

                <span className="text-sm font-medium text-app-muted">
                  {feature.number}
                </span>
              </div>

              <h3 className="mt-7 text-xl font-semibold text-app-text">
                {feature.title}
              </h3>

              <p className="mt-3 leading-7 text-app-muted">
                {feature.description}
              </p>

              <div className="mt-7 border-t border-app-border pt-5">
                <span className="text-xs font-semibold tracking-wider text-app-primary">
                  {feature.tag}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

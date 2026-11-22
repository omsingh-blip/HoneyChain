
const steps = [
  {
    number: "01",
    title: "Register your hive",
    description:
      "Create a digital hive record and document inspections, colony observations, and harvest activity.",
    label: "HIVE MANAGEMENT",
  },
  {
    number: "02",
    title: "Create a honey batch",
    description:
      "Associate a harvest with its hive and record the honey type, quantity, harvest date, and origin information.",
    label: "BATCH REGISTRATION",
  },
  {
    number: "03",
    title: "Record each journey",
    description:
      "Authorized participants record supply-chain events. Selected records can be anchored to blockchain for tamper-evident verification.",
    label: "TRACEABILITY",
  },
  {
    number: "04",
    title: "Verify using QR",
    description:
      "Customers scan a batch code to view available product details, recorded events, and data-integrity status.",
    label: "PUBLIC VERIFICATION",
  },
];

export default function HowItWorks() {
  return (
    <section id="traceability" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-app-primary">
            From hive to jar
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-app-text sm:text-5xl">
            Every step has a story.
          </h2>

          <p className="mt-5 leading-7 text-app-muted sm:text-lg">
            Connect beekeeping records and honey batch history in
            one traceable workflow.
          </p>
        </div>

        <div className="relative mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, index) => (
            <article key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute left-6 top-12 hidden h-px w-[calc(100%-1rem)] bg-app-border lg:block"
                />
              )}

              <div className="relative flex size-12 items-center justify-center rounded-xl border border-honey/40 bg-app-surface text-lg font-bold text-app-primary">
                {step.number}
              </div>

              <h3 className="mt-6 text-xl font-semibold text-app-text">
                {step.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-app-muted">
                {step.description}
              </p>

              <p className="mt-5 text-xs font-semibold tracking-wider text-app-primary">
                {step.label}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-app-border bg-app-surface p-6 sm:p-8">
          <p className="font-semibold text-app-text">
            What does blockchain verification mean?
          </p>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-app-muted">
            Blockchain can help verify that recorded data matches
            the information anchored to the ledger. It does not
            independently establish honey purity, safety, or the
            truthfulness of the original information.
          </p>
        </div>
      </div>
    </section>
  );
}

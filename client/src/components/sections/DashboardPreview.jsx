
const metrics = [
  { label: "Registered Hives", value: "24", detail: "Across your apiary" },
  { label: "Active Batches", value: "08", detail: "In the supply chain" },
  { label: "Honey Harvested", value: "186 kg", detail: "Illustrative total" },
];

const activities = [
  { hive: "Hive HC-001", event: "Inspection recorded", date: "Demo entry" },
  { hive: "Hive HC-008", event: "Harvest batch created", date: "Demo entry" },
  { hive: "Hive HC-012", event: "Colony status updated", date: "Demo entry" },
];

const harvestData = [35, 52, 44, 68, 56, 82, 71];

function MetricCard({ label, value, detail }) {
  return (
    <article className="rounded-xl border border-app-border bg-app-bg p-4">
      <p className="text-sm text-app-muted">{label}</p>
      <p className="mt-3 text-2xl font-bold text-app-text">{value}</p>
      <p className="mt-2 text-xs text-app-muted">{detail}</p>
    </article>
  );
}

export default function DashboardPreview() {
  return (
    <section id="beekeepers" className="bg-app-surface/50 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-app-primary">
            Built for beekeepers
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-app-text sm:text-5xl">
            Your apiary.
            <span className="block text-honey">One clear picture.</span>
          </h2>

          <p className="mt-5 leading-7 text-app-muted">
            Keep inspections, hive records, and honey production
            organized in one workspace. Spend less time searching
            through manual records and more time caring for your colonies.
          </p>

          <ul className="mt-7 space-y-4">
            {[
              "Organize hive inspections and colony observations",
              "Track harvest quantities and batch activity",
              "Review production trends and upcoming inspections",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 text-forest" aria-hidden="true">✓</span>
                <span className="text-sm leading-6 text-app-text">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Illustrative dashboard mockup */}
        <div className="rounded-2xl border border-app-border bg-app-bg p-4 shadow-2xl sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-app-muted">
                HONEYCHAIN / OVERVIEW
              </p>
              <h3 className="mt-2 text-lg font-semibold text-app-text">
                Apiary dashboard
              </h3>
            </div>

            <span className="rounded-full border border-app-border px-3 py-1 text-xs text-app-muted">
              Demo data
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-app-border bg-app-surface p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-app-text">Harvest trend</h4>
              <span className="text-xs text-app-muted">Sample values</span>
            </div>

            <div
              className="mt-5 flex h-32 items-end gap-3"
              role="img"
              aria-label="Illustrative harvest chart with seven sample data bars"
            >
              {harvestData.map((value, index) => (
                <div
                  key={index}
                  className="flex flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    className="w-full max-w-10 rounded-t-md bg-honey/80 transition hover:bg-honey"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-xs text-app-muted">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-app-border bg-app-surface p-4">
            <h4 className="font-medium text-app-text">Recent activity</h4>

            <div className="mt-3 divide-y divide-app-border">
              {activities.map((activity) => (
                <div
                  key={activity.hive}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-app-text">
                      {activity.hive}
                    </p>
                    <p className="mt-1 text-xs text-app-muted">
                      {activity.event}
                    </p>
                  </div>
                  <span className="text-xs text-app-muted">
                    {activity.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

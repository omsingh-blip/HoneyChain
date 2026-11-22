import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getDashboardData } from "../services/dashboardService";

function formatQuantity(value) {
  return `${Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 1,
  })} kg`;
}

function getMonthLabel(date) {
  return date.toLocaleDateString("en-IN", { month: "short" });
}

export default function Dashboard() {
  const [hives, setHives] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const data = await getDashboardData();
      setHives(data.hives);
      setBatches(data.batches);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load dashboard data. Check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const activeHives = hives.filter((hive) => hive.isActive !== false);
  const healthyHives = activeHives.filter(
    (hive) => hive.status === "Healthy"
  ).length;
  const needsInspection = activeHives.filter(
    (hive) => hive.status === "Needs inspection"
  ).length;

  const totalHarvest = batches.reduce(
    (total, batch) => total + (Number(batch.quantityKg) || 0),
    0
  );

  const packagedBatches = batches.filter(
    (batch) => batch.status === "Packaged" || batch.status === "Verified"
  ).length;

  const chartData = useMemo(() => {
    const now = new Date();
    const months = [];

    for (let offset = 5; offset >= 0; offset--) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);

      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        name: getMonthLabel(date),
        harvest: 0,
      });
    }

    for (const batch of batches) {
      if (!batch.harvestDate) continue;

      const date = new Date(batch.harvestDate);

      if (Number.isNaN(date.getTime())) continue;

      const month = months.find(
        (item) =>
          item.year === date.getFullYear() &&
          item.month === date.getMonth()
      );

      if (month) {
        month.harvest += Number(batch.quantityKg) || 0;
      }
    }

    return months.map(({ name, harvest }) => ({
      month: name,
      harvest: Math.round(harvest * 10) / 10,
    }));
  }, [batches]);

  const recentBatches = useMemo(
    () =>
      [...batches]
        .sort(
          (a, b) =>
            new Date(b.harvestDate).getTime() -
            new Date(a.harvestDate).getTime()
        )
        .slice(0, 5),
    [batches]
  );

  const metrics = [
    {
      label: "Active Hives",
      value: activeHives.length,
      detail: `${healthyHives} marked healthy`,
    },
    {
      label: "Honey Harvested",
      value: formatQuantity(totalHarvest),
      detail: `${batches.length} registered batches`,
    },
    {
      label: "Need Inspection",
      value: needsInspection,
      detail: "Active hives marked for inspection",
    },
    {
      label: "Packaged Batches",
      value: packagedBatches,
      detail: "Packaged or marked verified",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-app-muted">Apiary overview</p>
          <h1 className="mt-1 text-2xl font-bold text-app-text sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-app-muted">
            Your HoneyChain operation at a glance.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="w-fit rounded-xl border border-app-border bg-app-surface px-4 py-2 text-sm font-medium text-app-text hover:bg-app-elevated disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh data"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {loading && hives.length === 0 && batches.length === 0 ? (
        <div className="rounded-2xl border border-app-border bg-app-surface p-10 text-center text-app-muted">
          Loading your apiary data...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-app-border bg-app-surface p-5"
              >
                <p className="text-sm text-app-muted">{metric.label}</p>
                <p className="mt-3 break-words text-2xl font-bold text-app-text">
                  {metric.value}
                </p>
                <p className="mt-2 text-xs text-app-muted">
                  {metric.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <section className="rounded-2xl border border-app-border bg-app-surface p-5 sm:p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-app-text">
                  Harvest Overview
                </h2>
                <p className="mt-1 text-sm text-app-muted">
                  Registered harvest quantities over the last six calendar months.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="currentColor"
                      opacity={0.12}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "currentColor", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "currentColor", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={45}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `${value} kg`,
                        "Harvest",
                      ]}
                      contentStyle={{
                        background: "var(--color-app-surface)",
                        border: "1px solid var(--color-app-border)",
                        borderRadius: "12px",
                      }}
                    />
                    <Bar
                      dataKey="harvest"
                      name="Harvest"
                      fill="#EAB308"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-app-muted">
                Only batches with recorded harvest dates in this period are included.
              </p>
            </section>

            <section className="rounded-2xl border border-app-border bg-app-surface p-5 sm:p-6">
              <h2 className="text-lg font-bold text-app-text">
                Hive Health
              </h2>
              <p className="mt-1 text-sm text-app-muted">
                Current recorded status of active hives.
              </p>

              <div className="mt-6 space-y-5">
                {[
                  {
                    label: "Healthy",
                    count: healthyHives,
                    color: "bg-green-500",
                  },
                  {
                    label: "Needs inspection",
                    count: needsInspection,
                    color: "bg-amber-500",
                  },
                  {
                    label: "Under observation",
                    count: activeHives.filter(
                      (hive) => hive.status === "Under observation"
                    ).length,
                    color: "bg-blue-500",
                  },
                ].map((item) => {
                  const percentage =
                    activeHives.length > 0
                      ? (item.count / activeHives.length) * 100
                      : 0;

                  return (
                    <div key={item.label}>
                      <div className="mb-2 flex justify-between gap-3 text-sm">
                        <span className="text-app-muted">
                          {item.label}
                        </span>
                        <span className="font-semibold text-app-text">
                          {item.count}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-app-elevated">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeHives.length === 0 && (
                <p className="mt-5 text-sm text-app-muted">
                  Register a hive to start tracking hive health.
                </p>
              )}
            </section>
          </div>

          <section className="overflow-hidden rounded-2xl border border-app-border bg-app-surface">
            <div className="border-b border-app-border p-5 sm:p-6">
              <h2 className="text-lg font-bold text-app-text">
                Recent Harvests
              </h2>
              <p className="mt-1 text-sm text-app-muted">
                The five most recent registered batches by harvest date.
              </p>
            </div>

            {recentBatches.length === 0 ? (
              <p className="p-8 text-center text-sm text-app-muted">
                No harvest records yet. Create your first batch to see it here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="bg-app-elevated text-app-muted">
                    <tr>
                      <th className="px-5 py-4 font-medium">Batch ID</th>
                      <th className="px-5 py-4 font-medium">Honey Type</th>
                      <th className="px-5 py-4 font-medium">Harvest Date</th>
                      <th className="px-5 py-4 font-medium">Quantity</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app-border">
                    {recentBatches.map((batch) => (
                      <tr key={batch._id}>
                        <td className="px-5 py-4 font-semibold text-app-text">
                          {batch.batchId}
                        </td>
                        <td className="px-5 py-4 text-app-muted">
                          {batch.honeyType}
                        </td>
                        <td className="px-5 py-4 text-app-muted">
                          {batch.harvestDate
                            ? new Date(batch.harvestDate).toLocaleDateString(
                                "en-IN"
                              )
                            : "Not recorded"}
                        </td>
                        <td className="px-5 py-4 text-app-text">
                          {formatQuantity(batch.quantityKg)}
                        </td>
                        <td className="px-5 py-4 text-app-muted">
                          {batch.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import {
  getHives,
  createHive,
  updateHive,
  deactivateHive,
} from "../services/hiveService";

const initialForm = {
  hiveId: "",
  name: "",
  location: "",
  beeType: "Indian Honey Bee",
  status: "Needs inspection",
  lastInspection: "",
  notes: "",
};

const statusOptions = [
  "Healthy",
  "Needs inspection",
  "Under observation",
];

function formatDate(date) {
  if (!date) return "Not recorded";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not recorded";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyle(status) {
  switch (status) {
    case "Healthy":
      return "bg-green-500/10 text-green-600";
    case "Needs inspection":
      return "bg-amber-500/10 text-amber-600";
    case "Under observation":
      return "bg-blue-500/10 text-blue-600";
    default:
      return "bg-app-elevated text-app-muted";
  }
}

export default function Hives() {
  const [hives, setHives] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHive, setEditingHive] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadHives() {
    setLoading(true);
    setError("");

    try {
      const response = await getHives({ limit: 100 });
      setHives(response.data ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load hives. Check that the backend and database are running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHives();
  }, []);

  const filteredHives = useMemo(() => {
    const term = search.trim().toLowerCase();

    return hives.filter((hive) => {
      const matchesSearch =
        !term ||
        [hive.hiveId, hive.name, hive.location, hive.beeType]
          .some((value) => value?.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "All" || hive.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [hives, search, statusFilter]);

  const healthyCount = hives.filter(
    (hive) => hive.status === "Healthy"
  ).length;

  const inspectionCount = hives.filter(
    (hive) => hive.status === "Needs inspection"
  ).length;

  function handleInputChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEdit(hive) {
    setEditingHive(hive);

    setForm({
      hiveId: hive.hiveId || "",
      name: hive.name || "",
      location: hive.location || "",
      beeType: hive.beeType || "Indian Honey Bee",
      status: hive.status || "Needs inspection",
      lastInspection: hive.lastInspection
        ? new Date(hive.lastInspection).toISOString().slice(0, 10)
        : "",
      notes: hive.notes || "",
    });

    setError("");
    setSuccess("");
    setIsModalOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      ...form,
      hiveId: form.hiveId.trim(),
      name: form.name.trim(),
      location: form.location.trim(),
      notes: form.notes.trim(),
      lastInspection: form.lastInspection || null,
    };

    try {
      if (editingHive) {
        await updateHive(editingHive._id, payload);
        setSuccess("Hive updated successfully.");
      } else {
        await createHive(payload);
        setSuccess("Hive added successfully.");
      }

      setForm(initialForm);
      setEditingHive(null);
      setIsModalOpen(false);

      await loadHives();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        `Could not ${editingHive ? "update" : "add"} the hive. Please try again.`
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(hive) {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${hive.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deactivateHive(hive._id);

      setSuccess("Hive deactivated successfully.");
      await loadHives();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not deactivate the hive. Please try again."
      );
    }
  }


  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-app-muted">Apiary management</p>
          <h1 className="mt-1 text-2xl font-bold text-app-text sm:text-3xl">
            Hive Management
          </h1>
          <p className="mt-2 text-sm text-app-muted">
            Manage your registered hives and monitor their health.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingHive(null);
            setForm(initialForm);
            setError("");
            setSuccess("");
            setIsModalOpen(true);
          }}
          className="rounded-xl bg-honey px-5 py-3 font-semibold text-black transition hover:opacity-90"
        >
          + Add Hive
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600"
        >
          <span>{error}</span>

          {!isModalOpen && (
            <button
              type="button"
              onClick={loadHives}
              className="font-semibold underline"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {success && (
        <p
          role="status"
          className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-600"
        >
          {success}
        </p>
      )}

      {/* STATISTICS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5">
          <p className="text-sm text-app-muted">Total Active Hives</p>
          <p className="mt-2 text-3xl font-bold text-app-text">
            {hives.length}
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5">
          <p className="text-sm text-app-muted">Healthy Hives</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {healthyCount}
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5">
          <p className="text-sm text-app-muted">Need Inspection</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {inspectionCount}
          </p>
        </div>
      </div>

      {/* SEARCH AND FILTER */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by hive ID, name, location..."
          className="min-w-0 flex-1 rounded-xl border border-app-border bg-app-surface px-4 py-3 text-app-text outline-none focus:border-honey"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-app-border bg-app-surface px-4 py-3 text-app-text outline-none focus:border-honey"
        >
          <option value="All">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* HIVE TABLE */}
      <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface">
        {loading ? (
          <div className="p-10 text-center text-app-muted">
            Loading hives from the database...
          </div>
        ) : filteredHives.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-app-text">
              {hives.length === 0
                ? "No hives registered yet"
                : "No hives found"}
            </p>

            <p className="mt-2 text-sm text-app-muted">
              {hives.length === 0
                ? "Add your first hive to start tracking your apiary."
                : "Try changing your search or status filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-app-border bg-app-elevated text-app-muted">
                <tr>
                  <th className="px-5 py-4 font-medium">Hive</th>
                  <th className="px-5 py-4 font-medium">Location</th>
                  <th className="px-5 py-4 font-medium">Bee Type</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">
                    Last Inspection
                  </th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-app-border">
                {filteredHives.map((hive) => (
                  <tr
                    key={hive._id}
                    className="transition hover:bg-app-elevated/50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-app-text">
                        {hive.name}
                      </p>
                      <p className="mt-1 text-xs text-app-muted">
                        {hive.hiveId}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-app-muted">
                      {hive.location}
                    </td>

                    <td className="px-5 py-4 text-app-muted">
                      {hive.beeType}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(hive.status)}`}
                      >
                        {hive.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-app-muted">
                      {formatDate(hive.lastInspection)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(hive)}
                          className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeactivate(hive)}
                          className="text-sm font-medium text-red-400 transition hover:text-red-300"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT HIVE MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setIsModalOpen(false);
              setEditingHive(null);
              setForm(initialForm);
              setError("");
            }
          }}
        >
          <div className="my-auto w-full max-w-xl rounded-2xl border border-app-border bg-app-surface p-6 shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-app-text">
                  {editingHive ? "Edit Hive" : "Register a Hive"}
                </h2>

                <p className="mt-1 text-sm text-app-muted">
                  {editingHive
                    ? "Update your hive information."
                    : "Enter the details for your new hive."}
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingHive(null);
                  setForm(initialForm);
                  setError("");
                }}
                aria-label="Close dialog"
                className="rounded-lg px-3 py-1 text-xl text-app-muted hover:bg-app-elevated disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* HIVE FORM */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* HIVE ID */}
                <div>
                  <label className="mb-2 block text-sm text-app-muted">
                    Hive ID *
                  </label>

                  <input
                    name="hiveId"
                    value={form.hiveId}
                    onChange={handleInputChange}
                    placeholder="e.g. H-001"
                    required
                    maxLength={40}
                    disabled={Boolean(editingHive)}
                    className="w-full rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text outline-none focus:border-honey disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* HIVE NAME */}
                <div>
                  <label className="mb-2 block text-sm text-app-muted">
                    Hive Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Golden Meadow"
                    required
                    maxLength={80}
                    className="w-full rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text outline-none focus:border-honey"
                  />
                </div>

                {/* LOCATION */}
                <div>
                  <label className="mb-2 block text-sm text-app-muted">
                    Apiary Location *
                  </label>

                  <input
                    name="location"
                    value={form.location}
                    onChange={handleInputChange}
                    placeholder="e.g. North Apiary"
                    required
                    maxLength={120}
                    className="w-full rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text outline-none focus:border-honey"
                  />
                </div>

                {/* BEE TYPE */}
                <div>
                  <label className="mb-2 block text-sm text-app-muted">
                    Bee Type
                  </label>

                  <select
                    name="beeType"
                    value={form.beeType}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text outline-none focus:border-honey"
                  >
                    <option>Indian Honey Bee</option>
                    <option>Italian Honey Bee</option>
                    <option>Carniolan Honey Bee</option>
                    <option>Other / Unknown</option>
                  </select>
                </div>

                {/* STATUS */}
                <div>
                  <label className="mb-2 block text-sm text-app-muted">
                    Hive Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text outline-none focus:border-honey"
                  >
                    {statusOptions.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* LAST INSPECTION */}
                <div>
                  <label className="mb-2 block text-sm text-app-muted">
                    Last Inspection
                  </label>

                  <input
                    type="date"
                    name="lastInspection"
                    value={form.lastInspection}
                    onChange={handleInputChange}
                    max={new Date().toISOString().slice(0, 10)}
                    className="w-full rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text outline-none focus:border-honey"
                  />
                </div>
              </div>

              {/* NOTES */}
              <div>
                <label className="mb-2 block text-sm text-app-muted">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={1000}
                  placeholder="Optional hive observations..."
                  className="w-full resize-y rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text outline-none focus:border-honey"
                />
              </div>

              {/* FORM ERROR */}
              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingHive(null);
                    setForm(initialForm);
                    setError("");
                  }}
                  className="rounded-xl border border-app-border px-5 py-3 text-app-text hover:bg-app-elevated disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-honey px-5 py-3 font-semibold text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingHive
                      ? "Update Hive"
                      : "Save Hive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

}
import { useEffect, useMemo, useState } from "react";
import { getHives } from "../services/hiveService";
import { createBatch, getBatches } from "../services/batchService";
import {
  generateBatchQR,
  downloadBatchQR,
} from "../lib/qrCode";
import api from "../lib/api";

const batchStatuses = [
  "Harvested",
  "Processing",
  "Packaged",
  "Verified",
];

const editableBatchStatuses = ["Harvested", "Processing", "Packaged"];


async function requestBatchStatusUpdate(batchId, status) {
  const response = await api.patch(`/batches/${batchId}/status`, {
    status,
  });

  return response.data;
}


const initialForm = {
  batchId: "",
  honeyType: "",
  sourceHive: "",
  harvestDate: new Date().toISOString().slice(0, 10),
  quantityKg: "",
  apiaryLocation: "",
  notes: "",
};

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

function printBatchLabel(selectedQR) {
  if (!selectedQR) return;

  const { batch, qrDataUrl } = selectedQR;

  const printWindow = window.open(
    "",
    "_blank",
    "width=700,height=800"
  );

  if (!printWindow) {
    alert("Please allow pop-ups to print the batch label.");
    return;
  }

  const escapeHtml = (value) =>
    String(value ?? "Not recorded").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char]
    );

  const batchId = escapeHtml(batch.batchId);
  const honeyType = escapeHtml(batch.honeyType);
  const harvestDate = escapeHtml(formatDate(batch.harvestDate));
  const quantity = escapeHtml(`${batch.quantityKg ?? "Not recorded"} kg`);
  const location = escapeHtml(batch.apiaryLocation);
  const hiveId = escapeHtml(batch.sourceHive?.hiveId);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>HoneyChain - ${batchId}</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 30px;
            font-family: Arial, sans-serif;
            background: #fff;
            color: #171717;
          }

          .label {
            width: 100%;
            max-width: 480px;
            margin: 20px auto;
            padding: 28px;
            border: 2px solid #d69e18;
            border-radius: 16px;
            text-align: center;
          }

          .brand {
            font-size: 25px;
            font-weight: 800;
            color: #9a6500;
            letter-spacing: 1px;
          }

          .subtitle {
            margin-top: 5px;
            font-size: 11px;
            letter-spacing: 2px;
            color: #666;
          }

          .honey {
            margin: 22px 0 8px;
            font-size: 23px;
            font-weight: bold;
          }

          .batch {
            font-size: 14px;
            color: #555;
          }

          .details {
            margin-top: 20px;
            padding: 15px;
            background: #fff9e9;
            border-radius: 10px;
            text-align: left;
          }

          .details p {
            margin: 8px 0;
            font-size: 13px;
          }

          .qr {
            width: 190px;
            height: 190px;
            margin: 20px auto 10px;
          }

          .qr img {
            width: 100%;
            height: 100%;
          }

          .scan {
            font-size: 15px;
            font-weight: bold;
          }

          .footer {
            margin-top: 18px;
            font-size: 10px;
            color: #666;
          }

          @media print {
            body {
              padding: 0;
            }

            .label {
              margin: 0 auto;
              break-inside: avoid;
            }
          }
        </style>
      </head>

      <body>
        <div class="label">
          <div class="brand">🍯 HONEYCHAIN</div>
          <div class="subtitle">BLOCKCHAIN-POWERED TRACEABILITY</div>

          <div class="honey">${honeyType} Honey</div>
          <div class="batch">Batch ID: ${batchId}</div>

          <div class="details">
            <p><strong>Harvest Date:</strong> ${harvestDate}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Apiary Location:</strong> ${location}</p>
            <p><strong>Source Hive:</strong> ${hiveId}</p>
          </div>

          <div class="qr">
            <img src="${qrDataUrl}" alt="Batch QR Code" />
          </div>

          <div class="scan">SCAN TO VERIFY THIS HONEY</div>

          <div class="footer">
            Verify the recorded batch information through HoneyChain.
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

function statusStyle(status) {
  switch (status) {
    case "Verified":
      return "bg-green-500/10 text-green-600";
    case "Packaged":
      return "bg-blue-500/10 text-blue-600";
    case "Processing":
      return "bg-amber-500/10 text-amber-600";
    default:
      return "bg-app-elevated text-app-muted";
  }
}

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [hives, setHives] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [updatingBatchId, setUpdatingBatchId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [qrError, setQrError] = useState("");

  const [selectedQR, setSelectedQR] = useState(null);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [batchResponse, hiveResponse] = await Promise.all([
        getBatches({ limit: 100 }),
        getHives({ limit: 100 }),
      ]);

      setBatches(batchResponse.data ?? []);
      setHives(hiveResponse.data ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load batches and hives. Check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const activeHives = useMemo(
    () => hives.filter((hive) => hive.isActive !== false),
    [hives]
  );

  const filteredBatches = useMemo(() => {
    const term = search.trim().toLowerCase();

    return batches.filter((batch) => {
      const matchesSearch =
        !term ||
        [
          batch.batchId,
          batch.honeyType,
          batch.apiaryLocation,
          batch.sourceHive?.hiveId,
          batch.sourceHive?.name,
        ].some((value) => value?.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "All" || batch.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [batches, search, statusFilter]);

  // Generate a QR code for a selected batch.

async function handleGenerateQR(batch) {
  setQrLoading(true);
  setQrError("");

  try {
    const qr = await generateBatchQR(batch.batchId);

    setSelectedQR({
      batchId: batch.batchId,
      batch,
      ...qr,
    });

    setQrModalOpen(true);
  } catch (err) {
    console.error("QR generation error:", err);
    setQrError("Unable to generate QR code. Please try again.");
  } finally {
    setQrLoading(false);
  }
}


  function handleInputChange(event) {
    const { name, value } = event.target;

    setForm((current) => {
      const updated = { ...current, [name]: value };

      if (name === "sourceHive") {
        const selectedHive = hives.find(
          (hive) => hive.hiveId === value
        );

        updated.apiaryLocation = selectedHive?.location ?? "";
      }

      return updated;
    });
  }

  async function handleStatusChange(batch, nextStatus) {
    if (!batch?._id || !editableBatchStatuses.includes(nextStatus)) return;

    setUpdatingBatchId(batch._id);
    setError("");
    setSuccess("");

    try {
      await requestBatchStatusUpdate(batch._id, nextStatus);
      setSuccess(`Batch ${batch.batchId} status updated to ${nextStatus}.`);
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to update batch status. Please try again.");
    } finally {
      setUpdatingBatchId("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      ...form,
      batchId: form.batchId.trim(),
      honeyType: form.honeyType.trim(),
      quantityKg: Number(form.quantityKg),
      harvestDate: form.harvestDate,
      apiaryLocation: form.apiaryLocation.trim(),
      notes: form.notes.trim(),
    };

    try {
      await createBatch(payload);

      setForm(initialForm);
      setModalOpen(false);
      setSuccess("Honey batch created successfully.");

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not create the batch. Check the details and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-app-muted">
            Harvest and traceability
          </p>

          <h1 className="mt-1 text-2xl font-bold text-app-text sm:text-3xl">
            Honey Batches
          </h1>

          <p className="mt-2 text-sm text-app-muted">
            Register harvests and track honey from its source hive.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setModalOpen(true);
          }}
          className="rounded-xl bg-honey px-5 py-3 font-semibold text-black hover:opacity-90"
        >
          + Create Batch
        </button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-600"
        >
          {success}
        </div>
      )}

      {qrError && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600"
        >
          {qrError}
        </div>
      )}

      {/* Batch Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Batches",
            value: batches.length,
          },
          {
            label: "Harvested",
            value: batches.filter(
              (batch) => batch.status === "Harvested"
            ).length,
          },
          {
            label: "Processing",
            value: batches.filter(
              (batch) => batch.status === "Processing"
            ).length,
          },
          {
            label: "Packaged",
            value: batches.filter(
              (batch) => batch.status === "Packaged"
            ).length,
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-app-border bg-app-surface p-5"
          >
            <p className="text-sm text-app-muted">
              {metric.label}
            </p>

            <p className="mt-2 text-3xl font-bold text-app-text">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search batch ID, honey type, or hive..."
          className="min-w-0 flex-1 rounded-xl border border-app-border bg-app-surface px-4 py-3 text-app-text outline-none focus:border-honey"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-app-border bg-app-surface px-4 py-3 text-app-text outline-none focus:border-honey"
        >
          <option value="All">All statuses</option>

          {batchStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Batches Table */}
      <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface">
        {loading ? (
          <p className="p-10 text-center text-app-muted">
            Loading batches from the database...
          </p>
        ) : filteredBatches.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-app-text">
              {batches.length === 0
                ? "No honey batches registered"
                : "No matching batches"}
            </p>

            <p className="mt-2 text-sm text-app-muted">
              Create a batch after registering at least one hive.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left text-sm">
              <thead className="border-b border-app-border bg-app-elevated text-app-muted">
                <tr>
                  <th className="px-5 py-4 font-medium">Batch</th>
                  <th className="px-5 py-4 font-medium">Honey Type</th>
                  <th className="px-5 py-4 font-medium">Source Hive</th>
                  <th className="px-5 py-4 font-medium">Quantity</th>
                  <th className="px-5 py-4 font-medium">Harvest Date</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Update Status</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-app-border">
                {filteredBatches.map((batch) => (
                  <tr
                    key={batch._id}
                    className="transition hover:bg-app-elevated/50"
                  >
                    <td className="px-5 py-4 font-semibold text-app-text">
                      {batch.batchId}
                    </td>

                    <td className="px-5 py-4 text-app-muted">
                      {batch.honeyType}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-app-text">
                        {batch.sourceHive?.name ?? "Unknown hive"}
                      </p>

                      <p className="mt-1 text-xs text-app-muted">
                        {batch.sourceHive?.hiveId ?? "Unavailable"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-app-text">
                      {Number(batch.quantityKg).toLocaleString("en-IN")} kg
                    </td>

                    <td className="px-5 py-4 text-app-muted">
                      {formatDate(batch.harvestDate)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyle(batch.status)}`}
                      >
                        {batch.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {batch.status === "Verified" ? (
                        <span className="text-xs font-medium text-green-600">
                          Verified on blockchain
                        </span>
                      ) : (
                        <select
                          value={batch.status}
                          onChange={(event) =>
                            handleStatusChange(batch, event.target.value)
                          }
                          disabled={updatingBatchId === batch._id}
                          aria-label={`Update status for batch ${batch.batchId}`}
                          className="rounded-lg border border-app-border bg-app-bg px-3 py-2 text-xs text-app-text outline-none focus:border-honey disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {editableBatchStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      )}
                      {updatingBatchId === batch._id && (
                        <p className="mt-1 text-xs text-app-muted">Updating...</p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleGenerateQR(batch)}
                        disabled={qrLoading}
                        className="rounded-lg border border-app-border px-3 py-2 text-xs font-semibold text-app-text transition hover:border-honey hover:text-honey disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {qrLoading ? "Generating..." : "QR Code"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Batch Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl border border-app-border bg-app-surface p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-app-text">
                  Create Honey Batch
                </h2>

                <p className="mt-1 text-sm text-app-muted">
                  Register a harvest and link it to its source hive.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => setModalOpen(false)}
                aria-label="Close dialog"
                className="rounded-lg px-3 py-1 text-xl text-app-muted hover:bg-app-elevated"
              >
                ×
              </button>
            </div>

            {activeHives.length === 0 && (
              <p className="mt-5 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-600">
                You need at least one active hive before creating a batch.
                Register a hive first.
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-app-muted">
                    Batch ID *
                  </label>

                  <input
                    name="batchId"
                    value={form.batchId}
                    onChange={handleInputChange}
                    placeholder="e.g. HC-2026-001"
                    required
                    maxLength={40}
                    className="w-full rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text outline-none focus:border-honey"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-app-muted">
                    Honey Type *
                  </label>

                  <input
                    name="honeyType"
                    value={form.honeyType}
                    onChange={handleInputChange}
                    placeholder="e.g. Wildflower"
                    required
                    maxLength={100}
                    className="w-full rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text outline-none focus:border-honey"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-app-muted">
                    Source Hive *
                  </label>

                  <select
                    name="sourceHive"
                    value={form.sourceHive}
                    onChange={handleInputChange}
                    required
                    disabled={activeHives.length === 0}
                    className="w-full rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text outline-none focus:border-honey disabled:opacity-50"
                  >
                    <option value="">Select a hive</option>

                    {activeHives.map((hive) => (
                      <option key={hive._id} value={hive.hiveId}>
                        {hive.hiveId} — {hive.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-app-muted">
                    Quantity (kg) *
                  </label>

                  <input
                    type="number"
                    name="quantityKg"
                    value={form.quantityKg}
                    onChange={handleInputChange}
                    min="0.1"
                    max="100000"
                    step="0.1"
                    required
                    placeholder="e.g. 24.5"
                    className="w-full rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text outline-none focus:border-honey"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-app-muted">
                    Harvest Date *
                  </label>

                  <input
                    type="date"
                    name="harvestDate"
                    value={form.harvestDate}
                    onChange={handleInputChange}
                    max={new Date().toISOString().slice(0, 10)}
                    required
                    className="w-full rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text outline-none focus:border-honey"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-app-muted">
                    Apiary Location *
                  </label>

                  <input
                    name="apiaryLocation"
                    value={form.apiaryLocation}
                    onChange={handleInputChange}
                    required
                    maxLength={120}
                    placeholder="Source apiary"
                    className="w-full rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text outline-none focus:border-honey"
                  />
                </div>
              </div>

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
                  placeholder="Optional harvest observations..."
                  className="w-full resize-y rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text outline-none focus:border-honey"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setModalOpen(false);
                    setError("");
                  }}
                  className="rounded-xl border border-app-border px-5 py-3 text-app-text hover:bg-app-elevated"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || activeHives.length === 0}
                  className="rounded-xl bg-honey px-5 py-3 font-semibold text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Preview Modal */}
      {qrModalOpen && selectedQR && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="my-auto w-full max-w-md rounded-2xl border border-app-border bg-app-surface p-6 text-center shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-app-text">
                Batch QR Code
              </h2>

              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                aria-label="Close QR preview"
                className="rounded-lg px-3 py-1 text-xl text-app-muted hover:bg-app-elevated"
              >
                ×
              </button>
            </div>

            <p className="mt-2 text-sm text-app-muted">
              Scan this code to view the public traceability record.
            </p>

            <p className="mt-4 font-semibold text-app-text">
              {selectedQR.batchId}
            </p>

            <div className="mx-auto mt-5 flex w-fit items-center justify-center rounded-2xl bg-white p-4">
              <img
                src={selectedQR.qrDataUrl}
                alt={`QR code for batch ${selectedQR.batchId}`}
                className="h-56 w-56"
              />
            </div>

            <p className="mt-4 break-all text-xs text-app-muted">
              {selectedQR.verificationUrl}
            </p>

            <button
              type="button"
              onClick={() =>
                downloadBatchQR(
                  selectedQR.qrDataUrl,
                  selectedQR.batchId
                )
              }
              className="mt-6 w-full rounded-xl bg-honey px-5 py-3 font-semibold text-black hover:opacity-90"
            >
              Download QR Code
            </button>

            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="mt-3 w-full rounded-xl border border-app-border px-5 py-3 text-app-text hover:bg-app-elevated"
            >
              Close
            </button>


<button
  type="button"
  onClick={() => printBatchLabel(selectedQR)}
  className="mt-3 w-full rounded-xl bg-app-elevated px-5 py-3 font-semibold text-app-text hover:opacity-80"
>
  🖨️ Print Honey Label
</button>

          </div>
        </div>
      )}
    </div>
  );
}

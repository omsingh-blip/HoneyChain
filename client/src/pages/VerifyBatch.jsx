import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { traceBatch } from "../services/batchService";

function formatDate(date) {
  if (!date) return "Not recorded";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not recorded";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl border border-app-border bg-app-bg p-4">
      <p className="text-xs text-app-muted">{label}</p>
      <p className="mt-2 break-all text-sm font-medium text-app-text">
        {value || "Not recorded"}
      </p>
    </div>
  );
}

function formatDateTime(date) {
  if (!date) return "Not recorded";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not recorded";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


function Timeline({ stages = [], history = [] }) {
  const historyStages = history.map((entry) => ({
    title: entry.status,
    description:
      entry.note || `Batch status updated to ${entry.status}`,
    date: entry.changedAt,
    user: entry.changedBy?.name,
    completed: true,
  }));

  const blockchainStage = stages.find(
    (stage) => stage.title === "Blockchain Verification"
  );

  const timelineItems = [
    ...historyStages,
    ...(blockchainStage
      ? [
        {
          title: blockchainStage.title,
          description: blockchainStage.description,
          date: blockchainStage.date,
          completed: blockchainStage.completed,
        },
      ]
      : []),
  ];

  return (
    <div className="mt-6">
      {timelineItems.length === 0 ? (
        <p className="text-sm text-app-muted">
          No activity history has been recorded yet.
        </p>
      ) : (
        <div className="relative space-y-6">
          {timelineItems.map((stage, index) => (
            <div
              key={`${stage.title}-${index}`}
              className="relative flex gap-4"
            >
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${stage.completed
                    ? "bg-honey text-black"
                    : "border border-app-border bg-app-bg text-app-muted"
                  }`}
              >
                {stage.completed ? "✓" : index + 1}
              </div>

              <div className="min-w-0 flex-1 pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-app-text">
                    {stage.title}
                  </h3>

                  <span
                    className={`text-xs font-medium ${stage.completed
                        ? "text-green-500"
                        : "text-app-muted"
                      }`}
                  >
                    {stage.completed ? "Completed" : "Pending"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-app-muted">
                  {stage.description}
                </p>

                {stage.date && (
                  <p className="mt-2 text-xs text-app-muted">
                    {formatDateTime(stage.date)}
                  </p>
                )}

                {stage.user && (
                  <p className="mt-1 text-xs text-app-muted">
                    Updated by: {stage.user}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default function VerifyBatch() {
  const [searchParams] = useSearchParams();

  const [batchId, setBatchId] = useState(
    searchParams.get("batchId") || ""
  );

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    const scannedBatchId = searchParams.get("batchId");

    if (!scannedBatchId) return;

    setBatchId(scannedBatchId);

    async function verifyScannedBatch() {
      setLoading(true);
      setError("");
      setResult(null);

      try {
        const response = await traceBatch(scannedBatchId);
        setResult(response.data);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "No batch was found with that ID. Check the QR code."
            : err.response?.data?.message ||
            "Unable to retrieve this batch. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    verifyScannedBatch();
  }, [searchParams]);


  async function handleVerify(event) {
    event.preventDefault();

    const id = batchId.trim();

    if (!id) {
      setError("Enter a batch ID to continue.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await traceBatch(id);
      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "No batch was found with that ID. Check the ID and try again."
          : err.response?.data?.message ||
          "Unable to retrieve this batch. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const batch = result?.batch;
  const hive = batch?.sourceHive;
  const blockchain = batch?.blockchain;
  const verification = result?.verification;
  const blockchainVerified = result?.blockchainVerified === true;

  return (
    <main className="min-h-screen bg-app-bg px-4 py-12 text-app-text sm:px-6">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-honey text-3xl">
            🍯
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-app-primary">
            HoneyChain Traceability
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-5xl">
            Verify Your Honey
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-app-muted">
            Enter the batch ID printed on your honey packaging to explore
            its harvest history, source hive and blockchain verification.
          </p>
        </div>

        {/* Search */}
        <form
          onSubmit={handleVerify}
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl border border-app-border bg-app-surface p-4 sm:flex-row"
        >
          <input
            type="text"
            value={batchId}
            onChange={(event) => setBatchId(event.target.value)}
            placeholder="Enter batch ID, e.g. HC-2026-001"
            aria-label="Honey batch ID"
            required
            className="min-w-0 flex-1 rounded-xl border border-app-border bg-app-bg px-4 py-3 text-app-text outline-none focus:border-honey"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-honey px-6 py-3 font-semibold text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify Batch"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mx-auto mt-5 max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500"
          >
            {error}
          </div>
        )}

        {batch && (
          <section className="mt-8 space-y-6">

            {/* Verification Result */}
            <div
              className={`rounded-2xl border p-6 sm:p-8 ${blockchainVerified
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-amber-500/30 bg-amber-500/5"
                }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${blockchainVerified
                      ? "bg-green-500/15 text-green-500"
                      : "bg-amber-500/15 text-amber-500"
                    }`}
                >
                  {blockchainVerified ? "✓" : "!"}
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    {blockchainVerified
                      ? "Blockchain Verification Successful"
                      : "Blockchain Verification Failed"}
                  </h2>

                  <p className="mt-1 text-sm text-app-muted">
                    {result.message}
                  </p>
                </div>
              </div>

              {verification && (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-app-bg p-4">
                    <p className="text-xs text-app-muted">
                      MongoDB Hash Match
                    </p>
                    <p className="mt-2 font-semibold">
                      {verification.matchesMongoDB ? "✓ Matched" : "✕ Mismatch"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-app-bg p-4">
                    <p className="text-xs text-app-muted">
                      Blockchain Hash Match
                    </p>
                    <p className="mt-2 font-semibold">
                      {verification.matchesBlockchain
                        ? "✓ Matched"
                        : "✕ Mismatch"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Batch Information */}
            <div className="rounded-2xl border border-app-border bg-app-surface p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-app-muted">Registered batch</p>
                  <h2 className="mt-1 text-2xl font-bold">
                    {batch.batchId}
                  </h2>
                  <p className="mt-2 text-app-muted">
                    {batch.honeyType}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-app-elevated px-4 py-2 text-sm font-medium">
                  {batch.status}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Detail
                  label="Harvest Date"
                  value={formatDate(batch.harvestDate)}
                />

                <Detail
                  label="Harvest Quantity"
                  value={
                    batch.quantityKg != null
                      ? `${batch.quantityKg} kg`
                      : null
                  }
                />

                <Detail
                  label="Apiary Location"
                  value={batch.apiaryLocation}
                />

                <Detail
                  label="Bee Type"
                  value={hive?.beeType}
                />

                <Detail
                  label="Source Hive ID"
                  value={hive?.hiveId}
                />

                <Detail
                  label="Source Hive Name"
                  value={hive?.name}
                />

                <Detail
                  label="Hive Location"
                  value={hive?.location}
                />

                <Detail
                  label="Processing Date"
                  value={formatDate(batch.processingDate)}
                />

                <Detail
                  label="Packaging Date"
                  value={formatDate(batch.packagingDate)}
                />
              </div>
            </div>

            {/* Traceability Timeline */}
            <div className="rounded-2xl border border-app-border bg-app-surface p-6 sm:p-8">
              <h2 className="text-xl font-bold">
                Traceability Timeline
              </h2>

              <p className="mt-2 text-sm text-app-muted">
                Follow the recorded journey of this honey batch.
              </p>

              <Timeline
                stages={result.stages}
                history={batch.statusHistory || []}
              />

              {batch.notes && (
                <div className="mt-6 border-t border-app-border pt-5">
                  <h3 className="font-semibold">Additional Notes</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-app-muted">
                    {batch.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Blockchain Details */}
            <div className="rounded-2xl border border-app-border bg-app-surface p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⛓️</span>
                <div>
                  <h2 className="text-xl font-bold">
                    Blockchain Record
                  </h2>
                  <p className="text-sm text-app-muted">
                    On-chain transaction and data integrity information.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <Detail
                  label="Network"
                  value={blockchain?.network}
                />

                <Detail
                  label="Smart Contract Address"
                  value={blockchain?.contractAddress}
                />

                <Detail
                  label="Transaction Hash"
                  value={verification?.transactionHash || blockchain?.transactionHash}
                />

                <Detail
                  label="Calculated Data Hash"
                  value={verification?.calculatedHash}
                />

                <Detail
                  label="Stored MongoDB Hash"
                  value={verification?.storedHash}
                />

                <Detail
                  label="On-chain Contract Hash"
                  value={verification?.contractHash}
                />

                <Detail
                  label="Blockchain Recording Time"
                  value={formatDate(
                    verification?.recordedAt || blockchain?.recordedAt
                  )}
                />
              </div>

              <p className="mt-5 text-xs leading-relaxed text-app-muted">
                Blockchain verification confirms that the recorded batch
                metadata matches the hash stored in the smart contract.
                It does not independently certify honey purity, quality
                or physical origin.
              </p>
            </div>
          </section>
        )}

        <p className="mt-10 text-center text-xs text-app-muted">
          HoneyChain · Blockchain-powered honey traceability.
        </p>
      </div>
    </main>
  );
}

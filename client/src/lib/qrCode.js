
import QRCode from "qrcode";

export async function generateBatchQR(batchId) {
  if (!batchId) {
    throw new Error("Batch ID is required.");
  }

  const verificationUrl = new URL(
    `/verify?batchId=${encodeURIComponent(batchId)}`,
    window.location.origin
  ).toString();

  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "H",
    type: "image/png",
    width: 500,
    margin: 2,
    color: {
      dark: "#111827",
      light: "#FFFFFF",
    },
  });

  return {
    verificationUrl,
    qrDataUrl,
  };
}

export function downloadBatchQR(qrDataUrl, batchId) {
  const link = document.createElement("a");

  link.href = qrDataUrl;
  link.download = `${batchId}-QR.png`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

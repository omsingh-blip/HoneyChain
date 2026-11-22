import { getHives } from "./hiveService";
import { getBatches } from "./batchService";

export async function getDashboardData() {
  const [hiveResponse, batchResponse] = await Promise.all([
    getHives({ limit: 100 }),
    getBatches({ limit: 100 }),
  ]);

  return {
    hives: hiveResponse.data ?? [],
    batches: batchResponse.data ?? [],
  };
}
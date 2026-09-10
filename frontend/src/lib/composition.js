import { bucketOf } from "./party";

export function bucketedTotals(counts) {
  const totals = { dem: 0, rep: 0, ind: 0, vacant: 0 };
  for (const [party, count] of Object.entries(counts || {})) {
    totals[bucketOf(party)] += count;
  }
  return totals;
}

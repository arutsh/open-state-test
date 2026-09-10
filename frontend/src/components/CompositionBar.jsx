import { bucketedTotals } from "../lib/composition";

const SEGMENTS = [
  ["dem", "seg-dem"],
  ["rep", "seg-rep"],
  ["ind", "seg-ind"],
  ["vacant", "seg-vacant"],
];

export default function CompositionBar({ counts, className }) {
  const totals = bucketedTotals(counts);
  const total = totals.dem + totals.rep + totals.ind + totals.vacant;
  const classes = ["comp-bar", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {total > 0 &&
        SEGMENTS.filter(([bucket]) => totals[bucket] > 0).map(([bucket, segClass]) => (
          <span
            key={bucket}
            className={segClass}
            style={{ width: `${(totals[bucket] / total) * 100}%` }}
          />
        ))}
    </div>
  );
}

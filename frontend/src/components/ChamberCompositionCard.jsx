import CompositionBar from "./CompositionBar";
import { bucketOf, bucketLabel } from "../lib/party";

const BUCKET_ORDER = { dem: 0, rep: 1, ind: 2, vacant: 3 };

export default function ChamberCompositionCard({ label, counts }) {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const entries = Object.entries(counts).sort(
    ([a], [b]) => BUCKET_ORDER[bucketOf(a)] - BUCKET_ORDER[bucketOf(b)]
  );

  return (
    <div className="chamber-card">
      <div className="chamber-head">
        <span className="chamber-name">{label}</span>
        <span className="chamber-total">
          {total} seat{total === 1 ? "" : "s"}
        </span>
      </div>
      <CompositionBar counts={counts} className="chamber-bar" />
      <div className="chamber-stats">
        {entries.map(([party, count]) => {
          const bucket = bucketOf(party);
          return (
            <div className="chamber-stat-row" key={party}>
              <span className={`swatch ${bucket}`} />
              <span className="stat-name">{party === "Unknown" ? bucketLabel(bucket) : party}</span>
              <span className="stat-count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

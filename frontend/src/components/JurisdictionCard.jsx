import CompositionBar from "./CompositionBar";
import { bucketedTotals } from "../lib/composition";
import { formatRelative, isStale } from "../lib/freshness";

const COUNT_LABELS = [
  ["dem", "D"],
  ["rep", "R"],
  ["ind", "I/O"],
  ["vacant", "vac."],
];

export default function JurisdictionCard({ jurisdiction, onSelect }) {
  const totals = bucketedTotals(jurisdiction.party_counts);
  const total = totals.dem + totals.rep + totals.ind + totals.vacant;
  const stale = isStale(jurisdiction.last_synced_at);

  return (
    <button
      type="button"
      className="jur-card"
      onClick={() => onSelect(jurisdiction.id)}
    >
      <div className="jur-card-top">
        <span className="jur-name">{jurisdiction.name}</span>
        <span className="jur-class">{jurisdiction.classification}</span>
      </div>
      <CompositionBar counts={jurisdiction.party_counts} />
      <div className="jur-counts">
        {total === 0 ? (
          <span>No legislators synced yet</span>
        ) : (
          <>
            {COUNT_LABELS.filter(([bucket]) => totals[bucket] > 0).map(([bucket, label]) => (
              <span key={bucket}>
                <b>{totals[bucket]}</b> {label}
              </span>
            ))}
            <span>
              {total} seat{total === 1 ? "" : "s"}
            </span>
          </>
        )}
      </div>
      <div className={`jur-card-foot${stale ? " stale" : ""}`}>
        <span>
          Synced {formatRelative(jurisdiction.last_synced_at)}
          {stale ? " — overdue" : ""}
        </span>
        <span className="chevron" aria-hidden="true">
          &rarr;
        </span>
      </div>
    </button>
  );
}

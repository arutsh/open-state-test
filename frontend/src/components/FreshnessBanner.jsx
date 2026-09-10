import { formatRelative, isStale } from "../lib/freshness";

export default function FreshnessBanner({ jurisdictions }) {
  if (jurisdictions.length === 0) return null;

  let mostRecent = null;
  const staleNames = [];
  jurisdictions.forEach((jurisdiction) => {
    if (
      jurisdiction.last_synced_at &&
      (!mostRecent || new Date(jurisdiction.last_synced_at) > new Date(mostRecent))
    ) {
      mostRecent = jurisdiction.last_synced_at;
    }
    if (isStale(jurisdiction.last_synced_at)) staleNames.push(jurisdiction.name);
  });

  return (
    <div className="freshness-bar">
      <div className="freshness-main">
        <span className="freshness-dot" aria-hidden="true" />
        Directory data last synced <strong>{formatRelative(mostRecent)}</strong> — per-jurisdiction
        sync times shown below.
      </div>
      {staleNames.length > 0 && (
        <div className="freshness-warn">
          <span className="dot-warn" aria-hidden="true" />
          {staleNames.length} jurisdiction{staleNames.length === 1 ? "" : "s"} overdue for re-sync (
          {staleNames.join(", ")})
        </div>
      )}
    </div>
  );
}

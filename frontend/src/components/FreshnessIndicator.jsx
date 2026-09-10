function formatRelativeTime(isoString) {
  if (!isoString) return "never synced";

  const then = new Date(isoString);
  const diffMs = Date.now() - then.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export default function FreshnessIndicator({ lastSyncedAt }) {
  return (
    <p className="freshness-indicator">
      Last updated {formatRelativeTime(lastSyncedAt)}
    </p>
  );
}

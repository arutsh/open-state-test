const STALE_THRESHOLD_MS = 1000 * 60 * 60 * 72;

export function formatRelative(isoString) {
  if (!isoString) return "never synced";

  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function isStale(isoString) {
  if (!isoString) return true;
  return Date.now() - new Date(isoString).getTime() > STALE_THRESHOLD_MS;
}

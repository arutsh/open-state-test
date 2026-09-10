import { bucketLabel } from "../lib/party";

export default function RosterToolbar({
  partyBucketsPresent,
  partyFilter,
  onPartyFilterChange,
  chambers,
  isUnicameral,
  chamberFilter,
  onChamberFilterChange,
  search,
  onSearchChange,
  resultCount,
}) {
  return (
    <div className="roster-toolbar">
      <div className="pill-group">
        <button
          type="button"
          className="pill-btn"
          aria-pressed={partyFilter === "all"}
          onClick={() => onPartyFilterChange("all")}
        >
          All parties
        </button>
        {partyBucketsPresent.map((bucket) => (
          <button
            key={bucket}
            type="button"
            className="pill-btn"
            aria-pressed={partyFilter === bucket}
            onClick={() => onPartyFilterChange(bucket)}
          >
            {bucketLabel(bucket)}
          </button>
        ))}
      </div>

      {!isUnicameral && (
        <div className="pill-group">
          <button
            type="button"
            className="pill-btn"
            aria-pressed={chamberFilter === "all"}
            onClick={() => onChamberFilterChange("all")}
          >
            Both chambers
          </button>
          {chambers.map((chamber) => (
            <button
              key={chamber.key}
              type="button"
              className="pill-btn"
              aria-pressed={chamberFilter === chamber.key}
              onClick={() => onChamberFilterChange(chamber.key)}
            >
              {chamber.label}
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        className="roster-search"
        placeholder="Search by name…"
        aria-label="Search legislators by name"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <span className="roster-count">
        {resultCount} legislator{resultCount === 1 ? "" : "s"} shown
      </span>
    </div>
  );
}

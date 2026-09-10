import { bucketOf } from "../lib/party";
import { chamberLabel } from "../lib/jurisdiction";

function sortCaret(sort, field) {
  if (sort.field !== field) return "";
  return sort.dir === "asc" ? " ▲" : " ▼";
}

function PartyPill({ party }) {
  const bucket = bucketOf(party);
  return (
    <span className={`party-pill ${bucket}`}>
      <span className="dot" />
      {party || "Unknown"}
    </span>
  );
}

function SortableHeader({ field, label, sort, onSort }) {
  return (
    <th>
      <button type="button" onClick={() => onSort(field)}>
        {label}
        {sortCaret(sort, field)}
      </button>
    </th>
  );
}

function handleActivateKey(event, callback) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
}

export default function LegislatorRoster({ legislators, isUnicameral, sort, onSort, onSelect }) {
  if (legislators.length === 0) {
    return <div className="empty-state">No legislators match these filters.</div>;
  }

  return (
    <>
      <div className="roster-table-wrap">
        <table className="roster">
          <thead>
            <tr>
              <SortableHeader field="name" label="Name" sort={sort} onSort={onSort} />
              <SortableHeader field="party" label="Party" sort={sort} onSort={onSort} />
              <SortableHeader field="district" label="District" sort={sort} onSort={onSort} />
              {!isUnicameral && (
                <SortableHeader field="chamber" label="Chamber" sort={sort} onSort={onSort} />
              )}
            </tr>
          </thead>
          <tbody>
            {legislators.map((legislator) => (
              <tr
                key={legislator.id}
                tabIndex={0}
                onClick={() => onSelect(legislator)}
                onKeyDown={(event) => handleActivateKey(event, () => onSelect(legislator))}
              >
                <td>{legislator.name}</td>
                <td>
                  <PartyPill party={legislator.party} />
                </td>
                <td className="col-district">{legislator.district || "—"}</td>
                {!isUnicameral && (
                  <td className="col-chamber">{chamberLabel(legislator.chamber)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="roster-cards">
        {legislators.map((legislator) => (
          <div
            key={legislator.id}
            className="roster-card"
            tabIndex={0}
            onClick={() => onSelect(legislator)}
            onKeyDown={(event) => handleActivateKey(event, () => onSelect(legislator))}
          >
            <div className="roster-card-top">
              <span className="roster-card-name">{legislator.name}</span>
              <PartyPill party={legislator.party} />
            </div>
            <div className="roster-card-meta">
              {legislator.district || "—"}
              {!isUnicameral && ` · ${chamberLabel(legislator.chamber)}`}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

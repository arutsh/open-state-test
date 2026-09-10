const CHAMBERS = [
  { value: "", label: "All chambers" },
  { value: "upper", label: "Upper" },
  { value: "lower", label: "Lower" },
];

export default function LegislatorFilters({
  parties,
  party,
  chamber,
  onPartyChange,
  onChamberChange,
}) {
  return (
    <div className="legislator-filters">
      <label htmlFor="party-filter">
        Party
        <select
          id="party-filter"
          value={party}
          onChange={(event) => onPartyChange(event.target.value)}
        >
          <option value="">All parties</option>
          {parties.map((partyName) => (
            <option key={partyName} value={partyName}>
              {partyName}
            </option>
          ))}
        </select>
      </label>

      <label htmlFor="chamber-filter">
        Chamber
        <select
          id="chamber-filter"
          value={chamber}
          onChange={(event) => onChamberChange(event.target.value)}
        >
          {CHAMBERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

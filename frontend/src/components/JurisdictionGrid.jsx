import JurisdictionCard from "./JurisdictionCard";

export default function JurisdictionGrid({ jurisdictions, onSelect, emptyMessage }) {
  if (jurisdictions.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="jur-grid">
      {jurisdictions.map((jurisdiction) => (
        <JurisdictionCard key={jurisdiction.id} jurisdiction={jurisdiction} onSelect={onSelect} />
      ))}
    </div>
  );
}

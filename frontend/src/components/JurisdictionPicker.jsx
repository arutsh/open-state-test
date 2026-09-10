export default function JurisdictionPicker({
  jurisdictions,
  selectedId,
  onSelect,
}) {
  return (
    <div className="jurisdiction-picker">
      <label htmlFor="jurisdiction-select">Jurisdiction</label>
      <select
        id="jurisdiction-select"
        value={selectedId || ""}
        onChange={(event) => onSelect(event.target.value)}
      >
        <option value="" disabled>
          Select a jurisdiction ({jurisdictions.length})
        </option>
        {jurisdictions.map((jurisdiction) => (
          <option key={jurisdiction.id} value={jurisdiction.id}>
            {jurisdiction.name}
          </option>
        ))}
      </select>
    </div>
  );
}

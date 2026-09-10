export default function LegislatorTable({ legislators }) {
  if (legislators.length === 0) {
    return <p className="empty-state">No legislators match the current filters.</p>;
  }

  return (
    <div className="legislator-table-wrapper">
      <table className="legislator-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Party</th>
            <th>Chamber</th>
            <th>District</th>
          </tr>
        </thead>
        <tbody>
          {legislators.map((legislator) => (
            <tr key={legislator.id}>
              <td>{legislator.name}</td>
              <td>{legislator.party || "Unknown"}</td>
              <td>{legislator.chamber || "—"}</td>
              <td>{legislator.district || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PartySummary({ counts }) {
  const entries = Object.entries(counts);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="party-summary">
      {entries
        .sort((a, b) => b[1] - a[1])
        .map(([party, count]) => (
          <div className="party-summary-row" key={party}>
            <span className="party-summary-label">{party}</span>
            <div className="party-summary-bar-track">
              <div
                className="party-summary-bar-fill"
                style={{ width: `${total ? (count / total) * 100 : 0}%` }}
              />
            </div>
            <span className="party-summary-count">{count}</span>
          </div>
        ))}
    </div>
  );
}

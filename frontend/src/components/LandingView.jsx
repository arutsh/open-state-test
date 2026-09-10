import { useMemo, useState } from "react";
import FreshnessBanner from "./FreshnessBanner";
import JurisdictionGrid from "./JurisdictionGrid";

const TOTAL_SUPPORTED_JURISDICTIONS = 52;

export default function LandingView({ jurisdictions, onSelect }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jurisdictions;
    return jurisdictions.filter((jurisdiction) =>
      jurisdiction.name.toLowerCase().includes(q)
    );
  }, [jurisdictions, search]);

  const emptyMessage = search.trim()
    ? `No jurisdictions match "${search.trim()}".`
    : "No jurisdictions synced yet.";

  return (
    <section className="view" id="view-landing">
      <FreshnessBanner jurisdictions={jurisdictions} />
      <div className="landing-toolbar">
        <input
          type="text"
          className="search-input"
          id="jur-search"
          placeholder="Search jurisdictions…"
          aria-label="Search jurisdictions"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <p className="coverage-note">
        Showing {filtered.length} of {TOTAL_SUPPORTED_JURISDICTIONS} supported jurisdictions.
      </p>
      <JurisdictionGrid jurisdictions={filtered} onSelect={onSelect} emptyMessage={emptyMessage} />
    </section>
  );
}

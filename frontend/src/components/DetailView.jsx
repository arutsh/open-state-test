import { useEffect, useMemo, useState } from "react";
import { fetchLegislators } from "../api/client";
import { bucketOf } from "../lib/party";
import { formatRelative, isStale } from "../lib/freshness";
import { chamberLabel, postalFromId } from "../lib/jurisdiction";
import ChamberCompositionCard from "./ChamberCompositionCard";
import RosterToolbar from "./RosterToolbar";
import LegislatorRoster from "./LegislatorRoster";
import LegislatorModal from "./LegislatorModal";

function useLegislators(jurisdictionId) {
  const [legislators, setLegislators] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetchLegislators(jurisdictionId)
      .then((data) => {
        if (cancelled) return;
        setLegislators(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [jurisdictionId]);

  return { legislators, status, error };
}

function chambersOf(legislators) {
  const order = [];
  const byKey = new Map();
  legislators.forEach((legislator) => {
    const key = legislator.chamber || "unspecified";
    if (!byKey.has(key)) {
      byKey.set(key, { key, label: chamberLabel(legislator.chamber), counts: {} });
      order.push(key);
    }
    const chamber = byKey.get(key);
    const partyName = legislator.party || "Unknown";
    chamber.counts[partyName] = (chamber.counts[partyName] || 0) + 1;
  });
  return order.map((key) => byKey.get(key));
}

function fieldValue(legislator, field) {
  if (field === "district") return legislator.district || "";
  if (field === "chamber") return chamberLabel(legislator.chamber);
  if (field === "party") return legislator.party || "";
  return legislator.name;
}

export default function DetailView({ jurisdiction, onBack }) {
  const { legislators, status, error } = useLegislators(jurisdiction.id);

  const [partyFilter, setPartyFilter] = useState("all");
  const [chamberFilter, setChamberFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ field: "name", dir: "asc" });
  const [selectedLegislator, setSelectedLegislator] = useState(null);

  useEffect(() => {
    setPartyFilter("all");
    setChamberFilter("all");
    setSearch("");
    setSort({ field: "name", dir: "asc" });
    setSelectedLegislator(null);
  }, [jurisdiction.id]);

  const chambers = useMemo(() => chambersOf(legislators), [legislators]);
  const isUnicameral = chambers.length <= 1;

  const partyBucketsPresent = useMemo(() => {
    const present = new Set(legislators.map((l) => bucketOf(l.party)));
    return ["dem", "rep", "ind", "vacant"].filter((bucket) => present.has(bucket));
  }, [legislators]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return legislators.filter((legislator) => {
      if (partyFilter !== "all" && bucketOf(legislator.party) !== partyFilter) return false;
      if (chamberFilter !== "all" && legislator.chamber !== chamberFilter) return false;
      if (q && !legislator.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [legislators, partyFilter, chamberFilter, search]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const cmp = String(fieldValue(a, sort.field)).localeCompare(
        String(fieldValue(b, sort.field))
      );
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [filtered, sort]);

  function handleSort(field) {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" }
    );
  }

  const stale = isStale(jurisdiction.last_synced_at);

  return (
    <section className="view" id="view-detail">
      <button type="button" className="back-btn" onClick={onBack}>
        &larr; All jurisdictions
      </button>

      <div className="detail-header">
        <div className="seal" aria-hidden="true">
          {postalFromId(jurisdiction.id)}
        </div>
        <div className="detail-title-block">
          <div className="detail-title-row">
            <h2 className="detail-title">{jurisdiction.name}</h2>
          </div>
          <div className="detail-meta">
            <span>{jurisdiction.classification}</span>
            <span>&middot;</span>
            <span className={stale ? "stale" : ""}>
              Synced {formatRelative(jurisdiction.last_synced_at)}
              {stale ? " — overdue" : ""}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="sync-btn"
          disabled
          title="Admin only — not available in this preview"
        >
          Sync now
        </button>
      </div>

      {status === "loading" && <p>Loading legislators…</p>}
      {status === "error" && (
        <p className="error-state">Could not load legislators: {error?.message}</p>
      )}

      {status === "ready" && (
        <>
          <div className="chamber-grid">
            {chambers.length === 0 ? (
              <p className="empty-state">No legislators synced yet for this jurisdiction.</p>
            ) : (
              chambers.map((chamber) => (
                <ChamberCompositionCard key={chamber.key} label={chamber.label} counts={chamber.counts} />
              ))
            )}
          </div>

          {legislators.length > 0 && (
            <>
              <RosterToolbar
                partyBucketsPresent={partyBucketsPresent}
                partyFilter={partyFilter}
                onPartyFilterChange={setPartyFilter}
                chambers={chambers}
                isUnicameral={isUnicameral}
                chamberFilter={chamberFilter}
                onChamberFilterChange={setChamberFilter}
                search={search}
                onSearchChange={setSearch}
                resultCount={sorted.length}
              />
              <LegislatorRoster
                legislators={sorted}
                isUnicameral={isUnicameral}
                sort={sort}
                onSort={handleSort}
                onSelect={setSelectedLegislator}
              />
            </>
          )}
        </>
      )}

      {selectedLegislator && (
        <LegislatorModal
          legislator={selectedLegislator}
          jurisdictionName={jurisdiction.name}
          onClose={() => setSelectedLegislator(null)}
        />
      )}
    </section>
  );
}

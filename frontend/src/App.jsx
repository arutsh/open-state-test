import { useEffect, useMemo, useState } from "react";
import "./App.css";
import JurisdictionPicker from "./components/JurisdictionPicker";
import LegislatorFilters from "./components/LegislatorFilters";
import LegislatorTable from "./components/LegislatorTable";
import PartySummary from "./components/PartySummary";
import FreshnessIndicator from "./components/FreshnessIndicator";
import {
  fetchJurisdictions,
  fetchLegislators,
  fetchPartySummary,
} from "./api/client";

function useJurisdictions() {
  const [jurisdictions, setJurisdictions] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetchJurisdictions()
      .then((data) => {
        if (cancelled) return;
        setJurisdictions(data);
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
  }, []);

  return { jurisdictions, status, error };
}

function useJurisdictionDetail(jurisdictionId, party, chamber) {
  const [legislators, setLegislators] = useState([]);
  const [partySummary, setPartySummary] = useState({});
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jurisdictionId) {
      setLegislators([]);
      setPartySummary({});
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    Promise.all([
      fetchLegislators(jurisdictionId, { party, chamber }),
      fetchPartySummary(jurisdictionId),
    ])
      .then(([legislatorsData, summaryData]) => {
        if (cancelled) return;
        setLegislators(legislatorsData);
        setPartySummary(summaryData.counts);
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
  }, [jurisdictionId, party, chamber]);

  return { legislators, partySummary, status, error };
}

export default function App() {
  const {
    jurisdictions,
    status: jurisdictionsStatus,
    error: jurisdictionsError,
  } = useJurisdictions();
  const [selectedId, setSelectedId] = useState("");
  const [party, setParty] = useState("");
  const [chamber, setChamber] = useState("");

  const {
    legislators,
    partySummary,
    status: detailStatus,
    error: detailError,
  } = useJurisdictionDetail(selectedId, party, chamber);

  const selectedJurisdiction = useMemo(
    () => jurisdictions.find((j) => j.id === selectedId) || null,
    [jurisdictions, selectedId]
  );

  const knownParties = useMemo(
    () => Object.keys(partySummary).sort(),
    [partySummary]
  );

  function handleSelectJurisdiction(id) {
    setSelectedId(id);
    setParty("");
    setChamber("");
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>US Legislator Directory</h1>
        <p>Current state legislators by jurisdiction and party.</p>
      </header>

      <main className="app-main">
        {jurisdictionsStatus === "loading" && <p>Loading jurisdictions…</p>}
        {jurisdictionsStatus === "error" && (
          <p className="error-state">
            Could not load jurisdictions: {jurisdictionsError?.message}
          </p>
        )}
        {jurisdictionsStatus === "ready" && (
          <JurisdictionPicker
            jurisdictions={jurisdictions}
            selectedId={selectedId}
            onSelect={handleSelectJurisdiction}
          />
        )}

        {selectedJurisdiction && (
          <FreshnessIndicator lastSyncedAt={selectedJurisdiction.last_synced_at} />
        )}

        {detailStatus === "loading" && <p>Loading legislators…</p>}
        {detailStatus === "error" && (
          <p className="error-state">
            Could not load legislators: {detailError?.message}
          </p>
        )}

        {detailStatus === "ready" && (
          <>
            <PartySummary counts={partySummary} />
            <LegislatorFilters
              parties={knownParties}
              party={party}
              chamber={chamber}
              onPartyChange={setParty}
              onChamberChange={setChamber}
            />
            {legislators.length === 0 ? (
              <p className="empty-state">
                No data yet for this jurisdiction — sync pending.
              </p>
            ) : (
              <LegislatorTable legislators={legislators} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

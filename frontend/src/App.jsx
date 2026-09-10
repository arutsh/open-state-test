import { useEffect, useState } from "react";
import "./App.css";
import LandingView from "./components/LandingView";
import DetailView from "./components/DetailView";
import { fetchJurisdictions } from "./api/client";

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

export default function App() {
  const { jurisdictions, status, error } = useJurisdictions();
  const [selectedId, setSelectedId] = useState(null);

  const selectedJurisdiction = jurisdictions.find((j) => j.id === selectedId) || null;

  return (
    <div className="shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="masthead">
        <div>
          <div className="wordmark-block">
            <h1 className="wordmark">Statehouse Register</h1>
          </div>
          <p className="tagline">
            Current legislators across all 52 U.S. state-level jurisdictions, by party.
          </p>
        </div>
        <div className="legend" aria-label="Party color legend">
          <span className="legend-title">Legend</span>
          <span className="legend-item">
            <span className="swatch dem" />
            Democratic
          </span>
          <span className="legend-item">
            <span className="swatch rep" />
            Republican
          </span>
          <span className="legend-item">
            <span className="swatch ind" />
            Independent / Other
          </span>
          <span className="legend-item">
            <span className="swatch vacant" />
            Vacant
          </span>
        </div>
      </header>

      <main id="main">
        {status === "loading" && <p>Loading jurisdictions…</p>}
        {status === "error" && (
          <p className="error-state">Could not load jurisdictions: {error?.message}</p>
        )}
        {status === "ready" &&
          (selectedJurisdiction ? (
            <DetailView jurisdiction={selectedJurisdiction} onBack={() => setSelectedId(null)} />
          ) : (
            <LandingView jurisdictions={jurisdictions} onSelect={setSelectedId} />
          ))}
      </main>
    </div>
  );
}

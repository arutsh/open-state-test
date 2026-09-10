import { useEffect, useRef } from "react";
import { bucketOf } from "../lib/party";
import { chamberLabel } from "../lib/jurisdiction";
import { initials } from "../lib/legislator";

export default function LegislatorModal({ legislator, jurisdictionName, onClose }) {
  const closeButtonRef = useRef(null);
  const lastFocused = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    lastFocused.current = document.activeElement;
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (lastFocused.current && typeof lastFocused.current.focus === "function") {
        lastFocused.current.focus();
      }
    };
  }, []);

  const bucket = bucketOf(legislator.party);

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-name">
        <div className="modal-head">
          <div className={`avatar ${bucket}`}>
            {legislator.image_url ? (
              <img src={legislator.image_url} alt="" />
            ) : (
              initials(legislator.name)
            )}
          </div>
          <div>
            <h3 className="modal-name" id="modal-name">
              {legislator.name}
            </h3>
            <div className="modal-subline">
              {chamberLabel(legislator.chamber)} &middot; {legislator.district || "—"} &middot;{" "}
              {jurisdictionName}
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div>
            <span className={`party-pill ${bucket}`}>
              <span className="dot" />
              {legislator.party || "Unknown"}
            </span>
          </div>
          <hr className="modal-divider" />
          <div className="modal-fact-grid">
            <div>
              <div className="modal-fact-label">Chamber</div>
              <div className="modal-fact-value">{chamberLabel(legislator.chamber)}</div>
            </div>
            <div>
              <div className="modal-fact-label">District</div>
              <div className="modal-fact-value">{legislator.district || "—"}</div>
            </div>
            <div>
              <div className="modal-fact-label">Jurisdiction</div>
              <div className="modal-fact-value">{jurisdictionName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

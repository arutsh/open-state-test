import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.jurisdiction import Jurisdiction
from app.models.legislator import Legislator
from app.services.openstates_client import OpenStatesClient
from app.services.sync_source import SyncSource, get_sync_source

logger = logging.getLogger(__name__)


def sync_jurisdictions(db: Session, client: SyncSource) -> list[Jurisdiction]:
    raw_jurisdictions = client.get_jurisdictions(classification="state")

    synced: list[Jurisdiction] = []
    for raw in raw_jurisdictions:
        jurisdiction = db.get(Jurisdiction, raw["id"])
        if jurisdiction is None:
            jurisdiction = Jurisdiction(id=raw["id"])
            db.add(jurisdiction)

        jurisdiction.name = raw.get("name", jurisdiction.id)
        jurisdiction.classification = raw.get("classification", "state")
        # Open States does not provide a seal/flag image URL on the
        # jurisdiction resource; left for a future enhancement.
        synced.append(jurisdiction)

    db.commit()
    return synced


def _extract_district(current_role: dict) -> str | None:
    district = current_role.get("district")
    return str(district) if district is not None else None


def sync_legislators(
    db: Session, client: SyncSource, jurisdiction: Jurisdiction
) -> None:
    raw_people = client.get_people(jurisdiction.id)

    seen_ids: set[str] = set()
    for raw in raw_people:
        current_role = raw.get("current_role") or {}
        legislator = db.get(Legislator, raw["id"])
        if legislator is None:
            legislator = Legislator(id=raw["id"])
            db.add(legislator)

        legislator.name = raw.get("name", "")
        legislator.party = raw.get("party")
        legislator.chamber = current_role.get("org_classification")
        legislator.district = _extract_district(current_role)
        legislator.image_url = raw.get("image")
        legislator.jurisdiction_id = jurisdiction.id
        seen_ids.add(legislator.id)

    # Remove legislators no longer returned as current for this jurisdiction
    # (e.g. they lost their seat after an election).
    stale = [
        legislator
        for legislator in jurisdiction.legislators
        if legislator.id not in seen_ids
    ]
    for legislator in stale:
        db.delete(legislator)

    jurisdiction.last_synced_at = datetime.now(timezone.utc)
    db.commit()


def run_full_sync(
    db: Session, client: SyncSource | None = None
) -> dict[str, list[str]]:
    client = client or get_sync_source()
    mode = "live" if isinstance(client, OpenStatesClient) else "mock"
    logger.info("Starting full sync in %s mode (%s)", mode, type(client).__name__)

    jurisdictions = sync_jurisdictions(db, client)

    succeeded: list[str] = []
    failed: list[str] = []
    for jurisdiction in jurisdictions:
        try:
            sync_legislators(db, client, jurisdiction)
            succeeded.append(jurisdiction.id)
        except Exception:
            db.rollback()
            logger.exception(
                "Failed to sync legislators for %s", jurisdiction.id
            )
            failed.append(jurisdiction.id)

    return {"succeeded": succeeded, "failed": failed}

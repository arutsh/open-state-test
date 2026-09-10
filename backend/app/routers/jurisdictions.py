from collections import Counter, defaultdict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.jurisdiction import Jurisdiction
from app.models.legislator import Legislator
from app.schemas.jurisdiction import JurisdictionOut
from app.schemas.legislator import LegislatorOut, PartySummaryOut

router = APIRouter(prefix="/api/jurisdictions", tags=["jurisdictions"])


def _get_jurisdiction_or_404(db: Session, jurisdiction_id: str) -> Jurisdiction:
    jurisdiction = db.get(Jurisdiction, jurisdiction_id)
    if jurisdiction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Jurisdiction '{jurisdiction_id}' not found",
        )
    return jurisdiction


@router.get("", response_model=list[JurisdictionOut])
def list_jurisdictions(db: Session = Depends(get_db)) -> list[JurisdictionOut]:
    jurisdictions = list(
        db.execute(select(Jurisdiction).order_by(Jurisdiction.name)).scalars().all()
    )

    party_counts_by_jurisdiction: dict[str, dict[str, int]] = defaultdict(dict)
    count_rows = db.execute(
        select(Legislator.jurisdiction_id, Legislator.party, func.count())
        .group_by(Legislator.jurisdiction_id, Legislator.party)
    ).all()
    for jurisdiction_id, party, count in count_rows:
        party_counts_by_jurisdiction[jurisdiction_id][party or "Unknown"] = count

    return [
        JurisdictionOut(
            id=jurisdiction.id,
            name=jurisdiction.name,
            classification=jurisdiction.classification,
            last_synced_at=jurisdiction.last_synced_at,
            party_counts=party_counts_by_jurisdiction.get(jurisdiction.id, {}),
        )
        for jurisdiction in jurisdictions
    ]


@router.get(
    "/{jurisdiction_id:path}/legislators", response_model=list[LegislatorOut]
)
def list_legislators(
    jurisdiction_id: str,
    party: str | None = None,
    chamber: str | None = None,
    db: Session = Depends(get_db),
) -> list[Legislator]:
    _get_jurisdiction_or_404(db, jurisdiction_id)

    stmt = select(Legislator).where(Legislator.jurisdiction_id == jurisdiction_id)
    if party:
        stmt = stmt.where(Legislator.party == party)
    if chamber:
        stmt = stmt.where(Legislator.chamber == chamber)
    stmt = stmt.order_by(Legislator.name)

    return list(db.execute(stmt).scalars().all())


@router.get(
    "/{jurisdiction_id:path}/party-summary", response_model=PartySummaryOut
)
def party_summary(
    jurisdiction_id: str, db: Session = Depends(get_db)
) -> PartySummaryOut:
    jurisdiction = _get_jurisdiction_or_404(db, jurisdiction_id)

    counts = Counter(
        legislator.party or "Unknown" for legislator in jurisdiction.legislators
    )
    return PartySummaryOut(jurisdiction_id=jurisdiction.id, counts=dict(counts))

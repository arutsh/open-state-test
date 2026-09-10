from collections import Counter

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
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
def list_jurisdictions(db: Session = Depends(get_db)) -> list[Jurisdiction]:
    stmt = select(Jurisdiction).order_by(Jurisdiction.name)
    return list(db.execute(stmt).scalars().all())


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

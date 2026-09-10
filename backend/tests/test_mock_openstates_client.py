from sqlalchemy.orm import Session

from app.models.jurisdiction import Jurisdiction
from app.models.legislator import Legislator
from app.services import sync_service
from app.services.mock_openstates_client import MockOpenStatesClient


def test_full_sync_against_mock_client_populates_jurisdictions_and_legislators(
    db_session: Session,
):
    client = MockOpenStatesClient()

    result = sync_service.run_full_sync(db_session, client)

    assert result["failed"] == []
    assert set(result["succeeded"]) == {
        "ocd-jurisdiction/country:us/state:ca/government",
        "ocd-jurisdiction/country:us/state:tx/government",
        "ocd-jurisdiction/country:us/district:dc/government",
    }

    ca = db_session.get(
        Jurisdiction, "ocd-jurisdiction/country:us/state:ca/government"
    )
    assert ca is not None
    assert ca.name == "California"
    assert ca.last_synced_at is not None

    ca_legislators = (
        db_session.query(Legislator).filter_by(jurisdiction_id=ca.id).all()
    )
    assert {legislator.name for legislator in ca_legislators} == {
        "Alex Rivera",
        "Jordan Lee",
        "Sam Patel",
    }

    alex = db_session.get(Legislator, "mock-person/ca-1")
    assert alex.party == "Democratic"
    assert alex.chamber == "upper"
    assert alex.district == "10"


def test_mock_client_returns_no_people_for_unknown_jurisdiction():
    client = MockOpenStatesClient()
    assert client.get_people("does-not-exist") == []

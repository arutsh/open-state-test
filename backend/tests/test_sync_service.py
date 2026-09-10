from sqlalchemy.orm import Session

from app.models.jurisdiction import Jurisdiction
from app.models.legislator import Legislator
from app.services import sync_service


class FakeOpenStatesClient:
    def __init__(self, jurisdictions=None, people_by_jurisdiction=None, fail_for=None):
        self._jurisdictions = jurisdictions or []
        self._people_by_jurisdiction = people_by_jurisdiction or {}
        self._fail_for = fail_for or set()

    def get_jurisdictions(self, classification="state"):
        return self._jurisdictions

    def get_people(self, jurisdiction_id):
        if jurisdiction_id in self._fail_for:
            raise RuntimeError(f"Open States API error for {jurisdiction_id}")
        return self._people_by_jurisdiction.get(jurisdiction_id, [])


def _raw_jurisdiction(jurisdiction_id: str, name: str) -> dict:
    return {"id": jurisdiction_id, "name": name, "classification": "state"}


def _raw_person(
    person_id: str, name: str, party: str, chamber: str, district: str
) -> dict:
    return {
        "id": person_id,
        "name": name,
        "party": party,
        "current_role": {"org_classification": chamber, "district": district},
        "image": None,
    }


def test_sync_jurisdictions_creates_new_rows(db_session: Session):
    client = FakeOpenStatesClient(
        jurisdictions=[_raw_jurisdiction("jur/ca", "California")]
    )

    result = sync_service.sync_jurisdictions(db_session, client)

    assert len(result) == 1
    stored = db_session.get(Jurisdiction, "jur/ca")
    assert stored is not None
    assert stored.name == "California"


def test_sync_jurisdictions_upserts_existing_row(db_session: Session):
    db_session.add(Jurisdiction(id="jur/ca", name="Old Name", classification="state"))
    db_session.commit()
    client = FakeOpenStatesClient(
        jurisdictions=[_raw_jurisdiction("jur/ca", "California")]
    )

    sync_service.sync_jurisdictions(db_session, client)

    stored = db_session.get(Jurisdiction, "jur/ca")
    assert stored.name == "California"
    assert db_session.query(Jurisdiction).count() == 1


def test_sync_legislators_populates_party_chamber_district(db_session: Session):
    jurisdiction = Jurisdiction(id="jur/ca", name="California", classification="state")
    db_session.add(jurisdiction)
    db_session.commit()

    client = FakeOpenStatesClient(
        people_by_jurisdiction={
            "jur/ca": [
                _raw_person("person/1", "Alex Rivera", "Democratic", "upper", "10")
            ]
        }
    )

    sync_service.sync_legislators(db_session, client, jurisdiction)

    legislator = db_session.get(Legislator, "person/1")
    assert legislator.name == "Alex Rivera"
    assert legislator.party == "Democratic"
    assert legislator.chamber == "upper"
    assert legislator.district == "10"
    assert jurisdiction.last_synced_at is not None


def test_sync_legislators_removes_stale_rows_no_longer_current(db_session: Session):
    jurisdiction = Jurisdiction(id="jur/ca", name="California", classification="state")
    db_session.add(jurisdiction)
    db_session.add(
        Legislator(
            id="person/old",
            name="Former Legislator",
            party="Democratic",
            chamber="upper",
            district="10",
            jurisdiction_id="jur/ca",
        )
    )
    db_session.commit()

    client = FakeOpenStatesClient(
        people_by_jurisdiction={
            "jur/ca": [
                _raw_person("person/new", "New Legislator", "Republican", "upper", "10")
            ]
        }
    )

    sync_service.sync_legislators(db_session, client, jurisdiction)

    assert db_session.get(Legislator, "person/old") is None
    assert db_session.get(Legislator, "person/new") is not None


def test_run_full_sync_continues_after_one_jurisdiction_fails(db_session: Session):
    client = FakeOpenStatesClient(
        jurisdictions=[
            _raw_jurisdiction("jur/ca", "California"),
            _raw_jurisdiction("jur/tx", "Texas"),
        ],
        people_by_jurisdiction={
            "jur/tx": [_raw_person("person/1", "Sam Patel", "Independent", "lower", "5")]
        },
        fail_for={"jur/ca"},
    )

    result = sync_service.run_full_sync(db_session, client)

    assert result["succeeded"] == ["jur/tx"]
    assert result["failed"] == ["jur/ca"]
    # Both jurisdictions remain persisted even though CA's people sync failed.
    assert db_session.get(Jurisdiction, "jur/ca") is not None
    assert db_session.get(Jurisdiction, "jur/tx") is not None
    assert db_session.get(Legislator, "person/1") is not None

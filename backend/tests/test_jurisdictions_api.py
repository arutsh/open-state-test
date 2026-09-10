from datetime import datetime, timezone

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.jurisdiction import Jurisdiction
from app.models.legislator import Legislator


def _seed(db_session: Session) -> None:
    ca = Jurisdiction(
        id="ocd-jurisdiction/country:us/state:ca/government",
        name="California",
        classification="state",
        last_synced_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
    )
    db_session.add(ca)
    db_session.add_all(
        [
            Legislator(
                id="person/1",
                name="Alex Rivera",
                party="Democratic",
                chamber="upper",
                district="10",
                jurisdiction_id=ca.id,
            ),
            Legislator(
                id="person/2",
                name="Jordan Lee",
                party="Republican",
                chamber="lower",
                district="42",
                jurisdiction_id=ca.id,
            ),
            Legislator(
                id="person/3",
                name="Sam Patel",
                party="Democratic",
                chamber="lower",
                district="7",
                jurisdiction_id=ca.id,
            ),
        ]
    )
    db_session.commit()


def test_list_jurisdictions(client: TestClient, db_session: Session):
    _seed(db_session)

    response = client.get("/api/jurisdictions")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["name"] == "California"
    assert body[0]["last_synced_at"] is not None
    assert body[0]["party_counts"] == {"Democratic": 2, "Republican": 1}


def test_list_jurisdictions_reports_empty_party_counts_for_unsynced(
    client: TestClient, db_session: Session
):
    empty = Jurisdiction(
        id="ocd-jurisdiction/country:us/state:wy/government",
        name="Wyoming",
        classification="state",
        last_synced_at=None,
    )
    db_session.add(empty)
    db_session.commit()

    response = client.get("/api/jurisdictions")

    assert response.status_code == 200
    body = {j["name"]: j for j in response.json()}
    assert body["Wyoming"]["party_counts"] == {}


def test_list_legislators_for_jurisdiction(client: TestClient, db_session: Session):
    _seed(db_session)
    jurisdiction_id = "ocd-jurisdiction/country:us/state:ca/government"

    response = client.get(f"/api/jurisdictions/{jurisdiction_id}/legislators")

    assert response.status_code == 200
    names = {legislator["name"] for legislator in response.json()}
    assert names == {"Alex Rivera", "Jordan Lee", "Sam Patel"}


def test_filter_legislators_by_party(client: TestClient, db_session: Session):
    _seed(db_session)
    jurisdiction_id = "ocd-jurisdiction/country:us/state:ca/government"

    response = client.get(
        f"/api/jurisdictions/{jurisdiction_id}/legislators",
        params={"party": "Democratic"},
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    assert all(legislator["party"] == "Democratic" for legislator in body)


def test_filter_legislators_by_chamber(client: TestClient, db_session: Session):
    _seed(db_session)
    jurisdiction_id = "ocd-jurisdiction/country:us/state:ca/government"

    response = client.get(
        f"/api/jurisdictions/{jurisdiction_id}/legislators",
        params={"chamber": "lower"},
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    assert all(legislator["chamber"] == "lower" for legislator in body)


def test_unknown_jurisdiction_returns_404(client: TestClient, db_session: Session):
    _seed(db_session)

    response = client.get("/api/jurisdictions/does-not-exist/legislators")

    assert response.status_code == 404


def test_party_summary(client: TestClient, db_session: Session):
    _seed(db_session)
    jurisdiction_id = "ocd-jurisdiction/country:us/state:ca/government"

    response = client.get(f"/api/jurisdictions/{jurisdiction_id}/party-summary")

    assert response.status_code == 200
    body = response.json()
    assert body["jurisdiction_id"] == jurisdiction_id
    assert body["counts"] == {"Democratic": 2, "Republican": 1}


def test_party_summary_unknown_jurisdiction_returns_404(
    client: TestClient, db_session: Session
):
    response = client.get("/api/jurisdictions/does-not-exist/party-summary")

    assert response.status_code == 404


def test_health_reports_mock_data_source_by_default(client: TestClient):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["data_source"] == "mock"


def test_health_reports_live_data_source_when_key_configured(
    client: TestClient, mocker
):
    from app.config import Settings

    mocker.patch(
        "app.main.get_settings",
        return_value=Settings(openstates_api_key="sk-live-real-key"),
    )

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["data_source"] == "live"


def test_sync_endpoint_requires_admin_token(client: TestClient):
    response = client.post("/sync")

    assert response.status_code == 401


def test_sync_endpoint_accepts_valid_token(client: TestClient, mocker):
    mocked_sync = mocker.patch("app.routers.sync.run_full_sync")
    mocked_sync.return_value = {"succeeded": [], "failed": []}

    response = client.post("/sync", headers={"x-admin-token": "dev-sync-token"})

    assert response.status_code == 200
    assert response.json()["status"] == "started"
    mocked_sync.assert_called_once()

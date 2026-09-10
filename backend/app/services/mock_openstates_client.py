from typing import Any

_MOCK_JURISDICTIONS: list[dict[str, Any]] = [
    {
        "id": "ocd-jurisdiction/country:us/state:ca/government",
        "name": "California",
        "classification": "state",
    },
    {
        "id": "ocd-jurisdiction/country:us/state:tx/government",
        "name": "Texas",
        "classification": "state",
    },
    {
        "id": "ocd-jurisdiction/country:us/district:dc/government",
        "name": "District of Columbia",
        "classification": "state",
    },
]

_MOCK_PEOPLE: dict[str, list[dict[str, Any]]] = {
    "ocd-jurisdiction/country:us/state:ca/government": [
        {
            "id": "mock-person/ca-1",
            "name": "Alex Rivera",
            "party": "Democratic",
            "current_role": {"org_classification": "upper", "district": "10"},
            "image": None,
        },
        {
            "id": "mock-person/ca-2",
            "name": "Jordan Lee",
            "party": "Republican",
            "current_role": {"org_classification": "lower", "district": "42"},
            "image": None,
        },
        {
            "id": "mock-person/ca-3",
            "name": "Sam Patel",
            "party": "Democratic",
            "current_role": {"org_classification": "lower", "district": "7"},
            "image": None,
        },
    ],
    "ocd-jurisdiction/country:us/state:tx/government": [
        {
            "id": "mock-person/tx-1",
            "name": "Taylor Nguyen",
            "party": "Republican",
            "current_role": {"org_classification": "upper", "district": "3"},
            "image": None,
        },
        {
            "id": "mock-person/tx-2",
            "name": "Morgan Diaz",
            "party": "Republican",
            "current_role": {"org_classification": "lower", "district": "15"},
            "image": None,
        },
    ],
    "ocd-jurisdiction/country:us/district:dc/government": [
        {
            "id": "mock-person/dc-1",
            "name": "Casey Brooks",
            "party": "Democratic",
            "current_role": {"org_classification": "legislature", "district": "At-Large"},
            "image": None,
        },
    ],
}


class MockOpenStatesClient:
    """A drop-in SyncSource used when no OPENSTATES_API_KEY is configured.

    Returns a small, fixed dataset shaped exactly like the real
    OpenStatesClient's output, so sync_service exercises the same code
    paths (upsert, stale-legislator removal, party-summary aggregation)
    without making any network call.
    """

    def get_jurisdictions(
        self, classification: str = "state"
    ) -> list[dict[str, Any]]:
        return [
            jurisdiction
            for jurisdiction in _MOCK_JURISDICTIONS
            if jurisdiction["classification"] == classification
        ]

    def get_people(self, jurisdiction_id: str) -> list[dict[str, Any]]:
        return _MOCK_PEOPLE.get(jurisdiction_id, [])

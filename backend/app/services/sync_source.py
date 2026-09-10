from typing import Any, Protocol, runtime_checkable

from app.config import get_settings
from app.services.mock_openstates_client import MockOpenStatesClient
from app.services.openstates_client import OpenStatesClient


@runtime_checkable
class SyncSource(Protocol):
    def get_jurisdictions(
        self, classification: str = "state"
    ) -> list[dict[str, Any]]: ...

    def get_people(self, jurisdiction_id: str) -> list[dict[str, Any]]: ...


def get_sync_source() -> SyncSource:
    if get_settings().has_openstates_api_key():
        return OpenStatesClient()
    return MockOpenStatesClient()

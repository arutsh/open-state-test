from app.config import Settings
from app.services.mock_openstates_client import MockOpenStatesClient
from app.services.openstates_client import OpenStatesClient
from app.services.sync_source import get_sync_source


def test_get_sync_source_returns_live_client_when_key_present(mocker):
    mocker.patch(
        "app.services.sync_source.get_settings",
        return_value=Settings(openstates_api_key="sk-live-real-key"),
    )

    assert isinstance(get_sync_source(), OpenStatesClient)


def test_get_sync_source_returns_mock_client_when_key_absent(mocker):
    mocker.patch(
        "app.services.sync_source.get_settings",
        return_value=Settings(openstates_api_key=""),
    )

    assert isinstance(get_sync_source(), MockOpenStatesClient)


def test_get_sync_source_returns_mock_client_when_key_is_placeholder(mocker):
    mocker.patch(
        "app.services.sync_source.get_settings",
        return_value=Settings(openstates_api_key="changeme"),
    )

    assert isinstance(get_sync_source(), MockOpenStatesClient)

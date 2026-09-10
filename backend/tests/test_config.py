from app.config import Settings


def _settings(api_key: str) -> Settings:
    return Settings(openstates_api_key=api_key)


def test_empty_key_has_no_api_key():
    assert _settings("").has_openstates_api_key() is False


def test_placeholder_key_has_no_api_key():
    assert _settings("changeme").has_openstates_api_key() is False
    assert _settings("your-api-key-here").has_openstates_api_key() is False


def test_whitespace_only_key_has_no_api_key():
    assert _settings("   ").has_openstates_api_key() is False


def test_real_looking_key_has_api_key():
    assert _settings("sk-live-abc123def456").has_openstates_api_key() is True

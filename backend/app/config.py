from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

_PLACEHOLDER_API_KEYS = {"changeme", "your-api-key-here"}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    openstates_api_key: str = ""
    openstates_base_url: str = "https://v3.openstates.org"
    database_url: str = "sqlite:///./legislator_directory.db"
    sync_admin_token: str = "dev-sync-token"
    sync_interval_hours: int = 24
    cors_origins: list[str] = ["http://localhost:5173"]

    def has_openstates_api_key(self) -> bool:
        key = self.openstates_api_key.strip()
        return bool(key) and key not in _PLACEHOLDER_API_KEYS


@lru_cache
def get_settings() -> Settings:
    return Settings()

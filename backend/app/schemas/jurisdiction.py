from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class JurisdictionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    classification: str
    last_synced_at: datetime | None
    party_counts: dict[str, int] = Field(default_factory=dict)

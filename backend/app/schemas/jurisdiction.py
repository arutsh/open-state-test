from datetime import datetime

from pydantic import BaseModel, ConfigDict


class JurisdictionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    classification: str
    last_synced_at: datetime | None

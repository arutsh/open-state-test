from pydantic import BaseModel, ConfigDict


class LegislatorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    party: str | None
    chamber: str | None
    district: str | None
    image_url: str | None
    jurisdiction_id: str


class PartySummaryOut(BaseModel):
    jurisdiction_id: str
    counts: dict[str, int]

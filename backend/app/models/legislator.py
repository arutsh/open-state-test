from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.jurisdiction import Jurisdiction


class Legislator(Base):
    __tablename__ = "legislators"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    party: Mapped[str | None] = mapped_column(String, nullable=True)
    chamber: Mapped[str | None] = mapped_column(String, nullable=True)
    district: Mapped[str | None] = mapped_column(String, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    jurisdiction_id: Mapped[str] = mapped_column(
        ForeignKey("jurisdictions.id"), nullable=False
    )

    jurisdiction: Mapped["Jurisdiction"] = relationship(back_populates="legislators")

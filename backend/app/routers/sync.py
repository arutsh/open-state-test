import logging

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, status

from app.config import get_settings
from app.database import SessionLocal
from app.services.sync_service import run_full_sync

logger = logging.getLogger(__name__)

router = APIRouter(tags=["sync"])


def require_admin_token(x_admin_token: str = Header(default="")) -> None:
    settings = get_settings()
    if x_admin_token != settings.sync_admin_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin token",
        )


def _run_sync_in_background() -> None:
    db = SessionLocal()
    try:
        result = run_full_sync(db)
        logger.info(
            "Manual sync complete: %d succeeded, %d failed",
            len(result["succeeded"]),
            len(result["failed"]),
        )
    finally:
        db.close()


@router.post("/sync", dependencies=[Depends(require_admin_token)])
def trigger_sync(background_tasks: BackgroundTasks) -> dict[str, str]:
    background_tasks.add_task(_run_sync_in_background)
    return {"status": "started"}

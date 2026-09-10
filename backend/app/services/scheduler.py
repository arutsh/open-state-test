import logging

from apscheduler.schedulers.background import BackgroundScheduler

from app.config import get_settings
from app.database import SessionLocal
from app.services.sync_service import run_full_sync

logger = logging.getLogger(__name__)

_scheduler = BackgroundScheduler()


def _scheduled_sync_job() -> None:
    db = SessionLocal()
    try:
        result = run_full_sync(db)
        logger.info(
            "Scheduled sync complete: %d succeeded, %d failed",
            len(result["succeeded"]),
            len(result["failed"]),
        )
    finally:
        db.close()


def start_scheduler() -> None:
    settings = get_settings()
    if _scheduler.running:
        return

    _scheduler.add_job(
        _scheduled_sync_job,
        "interval",
        hours=settings.sync_interval_hours,
        id="openstates_full_sync",
        replace_existing=True,
    )
    _scheduler.start()


def stop_scheduler() -> None:
    if _scheduler.running:
        _scheduler.shutdown(wait=False)

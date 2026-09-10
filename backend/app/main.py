from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import jurisdictions, sync
from app.services.scheduler import start_scheduler, stop_scheduler

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(title="Legislator Directory API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jurisdictions.router)
app.include_router(sync.router)


@app.get("/health")
def health() -> dict[str, str]:
    data_source = "live" if get_settings().has_openstates_api_key() else "mock"
    return {"status": "ok", "data_source": data_source}

from contextlib import asynccontextmanager
from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


def setup_health(app: FastAPI) -> None:
    @app.get("/health", include_in_schema=False)
    async def health():
        return {"ok": True, "service": "crop-yield-ml"}

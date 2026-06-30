from fastapi import FastAPI
from .config import settings
from .core import (
    lifespan,
    setup_health,
    setup_middleware,
    setup_exception_handlers,
    setup_protected_docs,
    setup_routers
)


app = FastAPI(
    title=settings.app_name,
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    openapi_url=None
)
setup_health(app)
setup_middleware(app)
setup_exception_handlers(app)
setup_protected_docs(app)
setup_routers(app)
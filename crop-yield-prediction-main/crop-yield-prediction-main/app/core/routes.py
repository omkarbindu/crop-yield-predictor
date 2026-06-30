from ..apis.v1.router import router as v1_router


def setup_routers(app):
    app.include_router(v1_router)
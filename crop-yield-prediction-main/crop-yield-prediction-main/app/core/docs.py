from fastapi import FastAPI, Depends
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from .security import docs_basic_auth


def setup_protected_docs(app: FastAPI) -> None:
    @app.get("/docs", include_in_schema=False)
    async def swagger_docs(
        _ = Depends(docs_basic_auth),
    ):
        return get_swagger_ui_html(
            openapi_url="/openapi.json",
            title=f"{app.title} - Docs",
        )

    @app.get("/redoc", include_in_schema=False)
    async def redoc_docs(
        _ = Depends(docs_basic_auth),
    ):
        return get_redoc_html(
            openapi_url="/openapi.json",
            title=f"{app.title} - ReDoc",
        )

    @app.get("/openapi.json", include_in_schema=False)
    async def openapi(_ = Depends(docs_basic_auth)):
        return app.openapi()
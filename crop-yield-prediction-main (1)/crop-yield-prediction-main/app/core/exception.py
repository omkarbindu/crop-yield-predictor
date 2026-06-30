from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, PlainTextResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import Response
from ..schemas import RESTResponse


async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
) -> Response:
    # For 401 Unauthorized on docs endpoints, return proper response to trigger browser popup
    is_docs_endpoint = request.url.path in ["/docs", "/redoc", "/openapi.json"]
    
    if exc.status_code == status.HTTP_401_UNAUTHORIZED and is_docs_endpoint:
        # Get headers from exception - handle both dict and list formats
        headers = {}
        if exc.headers:
            if isinstance(exc.headers, dict):
                headers = dict(exc.headers)
            elif isinstance(exc.headers, list):
                headers = dict(exc.headers)
            else:
                # Try to convert to dict
                try:
                    headers = dict(exc.headers)
                except (TypeError, ValueError):
                    headers = {}
        
        # Ensure WWW-Authenticate header is present with proper format
        if "WWW-Authenticate" not in headers and "www-authenticate" not in headers:
            headers["WWW-Authenticate"] = 'Basic realm="API Documentation"'
        elif "www-authenticate" in headers and "WWW-Authenticate" not in headers:
            headers["WWW-Authenticate"] = headers.pop("www-authenticate")
        
        # Return PlainTextResponse with proper headers to trigger browser Basic Auth popup
        return PlainTextResponse(
            content=exc.detail or "Unauthorized",
            status_code=exc.status_code,
            headers=headers,
        )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=RESTResponse(
            code=exc.status_code,
            success=False,
            data={},
            msg=str(exc.detail),
        ).model_dump(),
    )


async def unhandled_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=RESTResponse(
            code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            success=False,
            data={},
            msg="Internal Server Error",
        ).model_dump(),
    )


def setup_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(
        StarletteHTTPException,
        http_exception_handler,
    )
    app.add_exception_handler(
        Exception,
        unhandled_exception_handler,
    )
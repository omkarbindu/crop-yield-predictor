from fastapi import Request, status, FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi_maintenance import MaintenanceModeMiddleware
from ..schemas import RESTResponse


async def custom_maintenance_response(request: Request) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content=RESTResponse(
            code=status.HTTP_503_SERVICE_UNAVAILABLE,
            success=False,
            data={},
            msg="Service under maintenance! Please check back later.",
        ).model_dump()
    )


async def log_ml_requests(request: Request, call_next):
    path = request.url.path
    if path.startswith("/v1/predict") or path.startswith("/v1/detect"):
        print(
            f"[PYTHON] {request.method} {path} — request received",
            flush=True,
        )
    response = await call_next(request)
    if path.startswith("/v1/predict") or path.startswith("/v1/detect"):
        print(
            f"[PYTHON] {request.method} {path} — responded {response.status_code}",
            flush=True,
        )
    return response


def setup_middleware(app: FastAPI) -> None:
    app.middleware("http")(log_ml_requests)

    app.add_middleware(
        MaintenanceModeMiddleware,
        response_handler=custom_maintenance_response
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
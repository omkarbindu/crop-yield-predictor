from fastapi import APIRouter
from .routes import detect_router, predict_router

router = APIRouter(prefix="/v1")

router.include_router(detect_router, prefix="/detect", tags=["Detect"])
router.include_router(predict_router, prefix="/predict", tags=["Predict"])
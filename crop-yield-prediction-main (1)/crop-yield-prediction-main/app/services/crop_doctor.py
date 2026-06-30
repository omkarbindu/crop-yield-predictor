import os
from starlette import status
from starlette.exceptions import HTTPException
from .base import CropDoctorInterface
from ..utils.routes import save_upload_file_from_bytes
from ..services import YoloDetector, CropYieldPredictor
from ..constants import *


class CropDoctor(CropDoctorInterface):
    def __init__(self):
        self.pest_model = YoloDetector(
            name=CropPestDetection.name,
            model_path=CropPestDetection.weights,
            device=CropPestDetection.device
        )
        self.disease_model = YoloDetector(
            name=CropDiseaseDetection.name,
            model_path=CropDiseaseDetection.weights,
            device=CropDiseaseDetection.device
        )
        self.yield_model = CropYieldPredictor(
            pipeline_path=CropYieldPrediction.pipeline,
            device=CropYieldPrediction.device
        )

    async def detect_pest_and_disease(self, image) -> dict:
        if image.content_type not in {"image/jpeg", "image/png", "image/jpg"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file typ    e. Only JPG, JPEG, PNG are allowed.",
            )

        image_bytes = await image.read()

        if not image_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        MAX_SIZE = 5 * 1024 * 1024  # 5MB
        if len(image_bytes) > MAX_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds 5MB limit.",
            )

        file_path = await save_upload_file_from_bytes(
            image_bytes=image_bytes,
            original_filename=image.filename
        )

        try:
            pest_results = self.pest_model.model.predict(
                source=file_path,
                conf=0.25,
                iou=0.5,
                verbose=False
            )

            pest_detections = self.pest_model._postprocess(pest_results)
            pest_detected = len(pest_detections) > 0

            disease_results = self.disease_model.model.predict(
                source=file_path,
                conf=0.25,
                iou=0.5,
                verbose=False
            )

            disease_detections = self.disease_model._postprocess(disease_results)
            disease_detected = len(disease_detections) > 0

            return {
                "pest_detected": pest_detected,
                "pest_detections": pest_detections,
                "disease_detected": disease_detected,
                "disease_detections": disease_detections,
            }

        finally:
            if os.path.exists(file_path):
                os.remove(file_path)

    async def predict_crop_yield(self, data) -> dict:
        try:
            data = await self.yield_model.predict_crop_yield(data)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

        return data
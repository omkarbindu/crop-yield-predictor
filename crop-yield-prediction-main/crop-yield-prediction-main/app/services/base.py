import joblib
import pandas as pd
from ultralytics import YOLO
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Tuple
import numpy as np
import cv2
from fastapi import UploadFile

class CropYieldPredictorInterface(ABC):
    def __init__(self, pipeline_path: str, device: str):
        bundle = joblib.load(pipeline_path)
        self.model = bundle["model"]
        self.label_encoders = bundle["label_encoders"]
        self.feature_columns = bundle["feature_columns"]
        self.log_target = bundle["log_target"]

    async def encode_input(self, input_dict: dict) -> pd.DataFrame:
        df = pd.DataFrame([input_dict])

        for col, le in self.label_encoders.items():
            if df[col].iloc[0] not in le.classes_:
                raise ValueError(
                    f"Unknown category '{df[col].iloc[0]}' for column '{col}'"
                )
            df[col] = le.transform(df[col])

        return df[self.feature_columns]

    @abstractmethod
    async def predict_crop_yield(self, input_dict: dict) -> float:
        pass

class DetectionYoloModelInterface(ABC):
    def __init__(self, name: str, model_path: str, device: str = "cpu"):
        self.name = name
        self.model_path = model_path
        self.device = device

        self.model = YOLO(self.model_path)
        self.model.to(self.device)

        self.class_names: Dict[int, str] = self.model.names

    @abstractmethod
    async def detect(
        self, image: np.ndarray
    ) -> Tuple[List[Dict[str, Any]], np.ndarray]:
        """
        Run object detection and return detections + annotated image.

        Returns:
            detections: List of dict results
            annotated_image: image with bounding boxes drawn
        """
        pass

    def _postprocess(self, results) -> List[Dict[str, Any]]:
        detections = []

        for r in results:
            if r.boxes is None:
                continue

            boxes = r.boxes.xyxy.cpu().numpy()
            scores = r.boxes.conf.cpu().numpy()
            class_ids = r.boxes.cls.cpu().numpy().astype(int)

            for box, score, cls_id in zip(boxes, scores, class_ids):
                detections.append({
                    "label": self.class_names[cls_id],
                    "class_id": cls_id,
                    "confidence": float(score),
                    "bbox": {
                        "x1": float(box[0]),
                        "y1": float(box[1]),
                        "x2": float(box[2]),
                        "y2": float(box[3]),
                    }
                })

        return self.to_native(detections)

    def draw_boxes(
        self,
        image: np.ndarray,
        detections: List[Dict[str, Any]],
        color: Tuple[int, int, int] = (0, 255, 0),
        thickness: int = 2
    ) -> np.ndarray:
        """
        Draw bounding boxes and labels on the image.
        """
        annotated = image.copy()

        for det in detections:
            x1 = int(det["bbox"]["x1"])
            y1 = int(det["bbox"]["y1"])
            x2 = int(det["bbox"]["x2"])
            y2 = int(det["bbox"]["y2"])

            label = f'{det["label"]} {det["confidence"]:.2f}'

            # Rectangle
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, thickness)

            # Label background
            (tw, th), _ = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1
            )
            cv2.rectangle(
                annotated, (x1, y1 - th - 6), (x1 + tw, y1), color, -1
            )

            # Label text
            cv2.putText(
                annotated,
                label,
                (x1, y1 - 4),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 0, 0),
                1,
                cv2.LINE_AA,
            )

        return annotated

    def to_native(self, obj) -> list | dict | None:
        if isinstance(obj, np.generic):
            return obj.item()
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, dict):
            return {k: self.to_native(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [self.to_native(i) for i in obj]
        return obj

class CropDoctorInterface(ABC):
    @abstractmethod
    async def predict_crop_yield(self, data:dict) -> dict:
        pass

    @abstractmethod
    async def detect_pest_and_disease(self, image:UploadFile) -> dict:
        pass
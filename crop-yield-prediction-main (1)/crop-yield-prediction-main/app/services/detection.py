import numpy as np
from typing import Tuple, List, Dict, Any
from .base import DetectionYoloModelInterface


class YoloDetector(DetectionYoloModelInterface):
    def __init__(self, name: str, model_path: str, device: str = "cpu"):
        super().__init__(
            name=name,
            model_path=model_path,
            device=device
        )

    async def detect(
        self, image: np.ndarray
    ) -> Tuple[List[Dict[str, Any]], np.ndarray]:

        results = self.model.predict(
            source=image,
            conf=0.25,
            iou=0.5,
            verbose=False
        )

        detections = self._postprocess(results)
        annotated_image = self.draw_boxes(image, detections)

        return detections, annotated_image
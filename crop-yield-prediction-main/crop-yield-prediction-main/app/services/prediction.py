import numpy as np
from .base import CropYieldPredictorInterface


class CropYieldPredictor(CropYieldPredictorInterface):
    def __init__(self, pipeline_path: str, device: str):
        super().__init__(
            pipeline_path=pipeline_path,
            device=device
        )

    async def predict_crop_yield(self, input_dict: dict) -> float:
        df = await self.encode_input(input_dict)
        pred_log = self.model.predict(df)

        if self.log_target:
            pred = np.expm1(pred_log)
        else:
            pred = pred_log

        return float(pred[0])

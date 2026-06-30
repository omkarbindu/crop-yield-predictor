from dataclasses import dataclass


@dataclass(frozen=True)
class CropYieldPrediction:
    name: str = "crop-yield-prediction"
    pipeline: str = "artifacts/crop_yield_dt_pipeline.pkl"
    device: str = "cpu"


@dataclass(frozen=True)
class CropPestDetection:
    name: str = "crop-pest-detector"
    weights: str = "artifacts/crop-pest-detection.pt"
    device: str = "cpu"


@dataclass(frozen=True)
class CropDiseaseDetection:
    name: str = "pest-disease-detector"
    weights: str = "artifacts/crop-disease-detection.pt"
    device: str = "cpu"


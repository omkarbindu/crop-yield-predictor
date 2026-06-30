from pydantic import BaseModel, Field


class CropYieldPrediction(BaseModel):
    Area: str = Field(..., examples=["India"])
    Item: str = Field(..., examples=["Rice"])
    average_rain_fall_mm_per_year: float = Field(..., examples=[1200])
    pesticides_tonnes: float = Field(..., examples=[300])
    avg_temp: float = Field(..., examples=[28])
     
from fastapi import APIRouter, Request, HTTPException, status, Depends
import traceback
from ....schemas import CropYieldPrediction, RESTResponse
from ....services import CropDoctor
from ....core.dependencies import get_crop_doctor
from ..docs import YIELD_PREDICTION_API_DOCS

router = APIRouter()

@router.post("/yield-production", response_model=RESTResponse)
async def detect_pest_disease(
    request: Request,
    data: CropYieldPrediction,
    crop_doctor: CropDoctor = Depends(get_crop_doctor)
):
    print("[PYTHON] Yield prediction request:", data.model_dump(), flush=True)
    try:
        result = await crop_doctor.predict_crop_yield(
            data.model_dump()
        )
        print(f"[PYTHON] Yield prediction result: {result} hg/ha", flush=True)
        return RESTResponse(
            code=status.HTTP_200_OK,
            success=True,
            data=result,
            msg="ok!"
        )
    except HTTPException:
        raise
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )


detect_pest_disease.__doc__ = YIELD_PREDICTION_API_DOCS
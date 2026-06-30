from fastapi import (
    Request,
    APIRouter,
    File,
    UploadFile,
    HTTPException,
    status,
    Depends
)
from ....schemas import RESTResponse
from ..docs import DETECT_API_DOCS
from ....services import CropDoctor
from ....core.dependencies import get_crop_doctor

router = APIRouter()


@router.post("/pest-disease", response_model=RESTResponse)
async def detect_pest_disease(
    request: Request,
    crop_img: UploadFile = File(...),
    crop_doctor: CropDoctor = Depends(get_crop_doctor)
):
    try:
        data = await crop_doctor.detect_pest_and_disease(crop_img)
        return RESTResponse(
            code=status.HTTP_200_OK,
            success=True,
            data=data,
            msg="ok!"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not validate data"
        )


detect_pest_disease.__doc__ = DETECT_API_DOCS
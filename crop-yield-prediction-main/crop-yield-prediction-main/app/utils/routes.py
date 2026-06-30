import os
import uuid
from pathlib import Path
from fastapi import HTTPException
from PIL import Image

upload_dir = Path("tmp/uploads")
upload_dir.mkdir(parents=True, exist_ok=True)


async def save_upload_file_from_bytes(
    image_bytes: bytes,
    original_filename: str
) -> str:
    if not image_bytes:
        raise HTTPException(400, "Empty file bytes")

    ext = os.path.splitext(original_filename)[1] or ".jpg"
    file_path = upload_dir / f"{uuid.uuid4()}{ext}"

    with open(file_path, "wb") as f:
        f.write(image_bytes)

    # verify image
    try:
        Image.open(file_path).verify()
    except Exception:
        file_path.unlink(missing_ok=True)
        raise HTTPException(400, "Corrupted image")

    return str(file_path.resolve())
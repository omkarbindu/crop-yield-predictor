from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets
from ..config import settings


security = HTTPBasic(auto_error=True)


def docs_basic_auth(
    credentials: HTTPBasicCredentials = Depends(security),
):
    correct_username = secrets.compare_digest(
        credentials.username,
        settings.app_docs_username,
    )
    correct_password = secrets.compare_digest(
        credentials.password,
        settings.app_docs_password,
    )

    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
            headers={"WWW-Authenticate": 'Basic realm="API Documentation"'},
        )
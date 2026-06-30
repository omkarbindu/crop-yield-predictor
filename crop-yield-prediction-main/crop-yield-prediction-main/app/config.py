from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    env: str = Field("development", alias="ENV")
    app_name: str = Field(..., alias="APP_NAME")
    debug: bool = Field(False, alias="DEBUG")

    # Server
    app_host: str = Field("0.0.0.0", alias="APP_HOST")
    app_port: int = Field(8000, alias="APP_PORT")
    app_docs_username: str = Field(..., alias="APP_DOCS_USERNAME")
    app_docs_password: str = Field(..., alias="APP_DOCS_PASSWORD")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


settings = Settings()
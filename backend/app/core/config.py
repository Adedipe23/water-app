from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "water-reminder-secret-key-for-development"  # Default value
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    # BACKEND_CORS_ORIGINS is a JSON-formatted list of origins
    # e.g: '["http://localhost", "http://localhost:4200", "http://localhost:3000", \
    # "http://localhost:8080", "http://local.dockertoolbox.tiangolo.com"]'
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    PROJECT_NAME: str = "Water Reminder Button API"

    # Database configuration
    SQLITE_DB: str = "sqlite:///./water_reminder.db"
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    @model_validator(mode='after')
    def setup_db_connection(self) -> 'Settings':
        if self.SQLALCHEMY_DATABASE_URI:
            return self

        # If PostgreSQL configuration is provided, use it
        if (
            self.POSTGRES_SERVER
            and self.POSTGRES_USER
            and self.POSTGRES_PASSWORD
            and self.POSTGRES_DB
        ):
            self.SQLALCHEMY_DATABASE_URI = PostgresDsn.build(
                scheme="postgresql",
                username=self.POSTGRES_USER,
                password=self.POSTGRES_PASSWORD,
                host=self.POSTGRES_SERVER,
                path=f"/{self.POSTGRES_DB}",
            )
        else:
            # Otherwise use SQLite
            self.SQLALCHEMY_DATABASE_URI = self.SQLITE_DB

        return self

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()

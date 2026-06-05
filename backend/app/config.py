"""Application settings, loaded from environment / .env."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Canvas OAuth2 (Developer Key approved by the institution's Canvas admin)
    canvas_base_url: str = "https://thomasmore.instructure.com"
    canvas_client_id: str = ""
    canvas_client_secret: str = ""
    canvas_redirect_uri: str = "http://localhost:8000/auth/canvas/callback"

    secret_key: str = "change-me"
    database_url: str = "sqlite:///./canvio.db"
    frontend_origin: str = "http://localhost:5173"

    # LLM
    anthropic_api_key: str = ""
    generation_model: str = "claude-sonnet-4-6"


settings = Settings()

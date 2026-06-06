"""Application settings, loaded from environment / .env."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- core ---
    app_name: str = "Canv.io API"
    environment: str = "development"
    frontend_origin: str = "http://localhost:5173"

    # --- database ---
    # Postgres in Docker; override with DATABASE_URL. SQLite default eases local/test runs.
    database_url: str = "postgresql+psycopg2://canvio:canvio@db:5432/canvio"

    # --- auth / JWT ---
    jwt_secret: str = "change-me-in-env"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 1 day

    # --- secrets-at-rest ---
    # Fernet key (base64, 32 bytes) used to encrypt stored Canvas tokens.
    # Generate: python -c "from cryptography.fernet import Fernet;print(Fernet.generate_key().decode())"
    canvas_token_enc_key: str = ""

    # --- Canvas (Thomas More) ---
    canvas_base_url: str = "https://canvas.thomasmore.be"
    canvas_client_id: str = ""
    canvas_client_secret: str = ""
    canvas_redirect_uri: str = "http://localhost:8000/canvas/callback"

    # --- LLM ---
    anthropic_api_key: str = ""
    generation_model: str = "claude-sonnet-4-6"

    # --- seed admin (used by the seeder) ---
    seed_admin_email: str = "admin@canv.io"
    seed_admin_password: str = "admin123"
    seed_student_email: str = "student@canv.io"
    seed_student_password: str = "student123"


settings = Settings()

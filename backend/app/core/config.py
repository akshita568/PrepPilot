from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Study Planner"
    ENV: str = "development"
    
    # Security (We'll use these during Phase 2 for JWT auth)
    SECRET_KEY: str = "super_secret_temporary_key_for_local_dev"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database Configuration
    # This matches the connection string inside your docker-compose file
    DATABASE_URL: str = Field(
        default="postgresql://planner_user:planner_secure_password@db:5432/study_planner"
    )

    # Automatically loads variables from a .env file if it exists
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
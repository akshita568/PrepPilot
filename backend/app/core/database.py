from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# 1. Create the SQLAlchemy engine pointing to our PostgreSQL Docker container
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True  # Checks the connection health before running queries
)

# 2. Create a SessionLocal factory. Each request to our API gets its own session.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Create the Base class for database models to inherit from
Base = declarative_base()

# 4. Dependency injection to safely open and close DB connections per API request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db, Base, engine 

# Correct explicit routing imports matching your folder structures
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.study import router as study_router

# Create database tables automatically if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect the properly named imported routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(study_router, prefix="/api/v1/tasks", tags=["Study Tasks"])

@app.get("/")
def read_root():
    return {
        "status": "healthy", 
        "project": settings.PROJECT_NAME,
        "environment": settings.ENV
    }

@app.get("/test-db")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT version();")).fetchone()
        return {
            "database_status": "connected",
            "postgres_version": result[0] if result else "unknown"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Database connection failed: {str(e)}"
        )
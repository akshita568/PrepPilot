from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel  # <-- Added missing import
from datetime import date, timedelta

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.study import StudyTask
from app.schemas.study import StudyTaskCreate, StudyTaskUpdate, StudyTaskOut

router = APIRouter()

# Schema definitions for incoming AI requests
class AIPlanRequest(BaseModel):
    raw_plan_text: str
    start_date: date

class AISuggestRequest(BaseModel):
    task_title: str
@router.post("/", response_model=StudyTaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: StudyTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Create a new study task assigned to the current user."""
    # Convert incoming schema variables to a native Python dictionary
    task_data = task_in.model_dump()
    
    # Check if due_date is missing or empty, and inject today's date dynamically
    if task_data.get("due_date") is None:
        from datetime import date
        task_data["due_date"] = date.today()

    # Safely unpack the dictionary into the Database object wrapper
    task = StudyTask(
        **task_data,
        owner_id=current_user.id
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/", response_model=List[StudyTaskOut])
def read_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Retrieve all study tasks belonging strictly to the logged-in user."""
    return db.query(StudyTask).filter(StudyTask.owner_id == current_user.id).all()

@router.put("/{task_id}", response_model=StudyTaskOut)
def update_task(
    task_id: int,
    task_in: StudyTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Update a specific task's details (title, completion, etc.)."""
    task = db.query(StudyTask).filter(StudyTask.id == task_id, StudyTask.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or unauthorized")
        
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
        
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> None:
    """Delete a task completely."""
    task = db.query(StudyTask).filter(StudyTask.id == task_id, StudyTask.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or unauthorized")
    db.delete(task)
    db.commit()

# 1. ENDPOINT: Parse an entire syllabus or master plan text
@router.post("/generate-ai-schedule")  # <-- Fixed reference from study.router to router
def generate_ai_schedule(payload: AIPlanRequest):
    try:
        # TODO: Replace this mock with a real Gemini/OpenAI API call later
        start = payload.start_date
        
        mock_ai_schedule = [
            {"title": "Phase 1: Foundation & Overview", "description": f"Extracted from plan: Initial review based on: '{payload.raw_plan_text[:30]}...'", "scheduled_date": start},
            {"title": "Phase 2: Deep Dive Core Concepts", "description": "AI Suggested: Focus on high-weight exam topics.", "scheduled_date": start + timedelta(days=1)},
            {"title": "Phase 3: Active Recall & Practice", "description": "AI Suggested: Solve practice problems and mock questions.", "scheduled_date": start + timedelta(days=2)},
        ]
        return mock_ai_schedule
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. ENDPOINT: Provide inline quick suggestions for a manual task
@router.post("/suggest-subtasks")  # <-- Fixed reference from study.router to router
def suggest_subtasks(payload: AISuggestRequest):
    try:
        title = payload.task_title
        mock_suggestions = [
            f"Review fundamental core concepts of {title}",
            f"Build a practical mini-project or write summary notes on {title}",
            f"Test knowledge with a quiz or active recall flashcards about {title}"
        ]
        return {"parent_task": title, "suggestions": mock_suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
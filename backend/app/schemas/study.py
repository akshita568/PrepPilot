from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

# Shared Task attributes
class StudyTaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    due_date: Optional[datetime] = None

# Fields expected when creating a new task via API
class StudyTaskCreate(StudyTaskBase):
    pass

# Fields returned safely back to the client UI
class StudyTaskOut(StudyTaskBase):
    id: int
    user_id: int
    is_completed: bool
    ai_breakdown: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
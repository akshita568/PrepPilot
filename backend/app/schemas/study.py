from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, field_validator

# Properties shared by all schemas (Create, Update, Out)
class StudyTaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_completed: Optional[bool] = False
    # Change due_date to Optional so Pydantic stops throwing a 422 error
    due_date: Optional[date] = None 

    @field_validator("due_date", mode="before")
    @classmethod
    def parse_frontend_date(cls, value):
        # If the frontend didn't send anything, give it a default value of today
        if value is None or value == "":
            return date.today()
            
        if isinstance(value, str):
            if "T" in value:
                value = value.split("T")[0]
            return date.fromisoformat(value)
        return value

class StudyTaskCreate(StudyTaskBase):
    pass

# Properties to receive via API when updating a task (everything is optional)
class StudyTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    due_date: Optional[datetime] = None

# Properties stored in DB to return back to the client/frontend
class StudyTaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    is_completed: bool
    due_date: date
    owner_id: int
    
    # Change from 'created_at: datetime' to Optional
    created_at: Optional[datetime] = None 

    class Config:
        from_attributes = True # Or orm_mode = True depending on your Pydantic version
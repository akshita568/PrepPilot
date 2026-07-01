from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class StudyTask(Base):
    __tablename__ = "study_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # AI Assistance data (e.g., automated sub-task breakdowns)
    ai_breakdown = Column(Text, nullable=True) 
    
    # Status tracking
    is_completed = Column(Boolean, default=False)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Foreign Key establishing ownership by a specific user
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Relationship linkage back to the User object
    owner = relationship("User", back_populates="tasks")

# Now let's update your User model to support this relationship bidirectionally.
# Open `backend/app/models/user.py` and add this line inside the User class:
# tasks = relationship("StudyTask", back_populates="owner", cascade="all, delete-orphan")
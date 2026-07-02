from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)
    
    # NEW FIELDS FOR THE CALENDAR & AI ARCHITECT
    scheduled_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_ai_generated = Column(Boolean, default=False)
    estimated_minutes = Column(Integer, default=60) 
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")
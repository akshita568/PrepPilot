from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class StudyTask(Base):
    __tablename__ = "study_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)
    due_date = Column(Date, nullable=False)
    
    # Links each task to a specific user account record
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Relationship back to the User model
    owner = relationship("User", back_populates="tasks")
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

# Base properties shared across schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)

# Schema used when creating a user (captures password)
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

# Schema returned to the client (excludes sensitive password data)
class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    # Tells Pydantic to read data even if it's an ORM object (like a SQLAlchemy instance)
    model_config = {"from_attributes": True}
from datetime import datetime, timedelta, timezone
from typing import Any, Union
from jose import jwt
import bcrypt  # SWAPPED OUT PASSLIB FOR NATIVE BCRYPT
from app.core.config import settings

ALGORITHM = "HS256"

def get_password_hash(password: str) -> str:
    """Takes a raw password string and returns a secure cryptographic hash."""
    # Convert string to bytes, generate salt, hash, and decode back to string
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compares a plain login password with the saved hash in the database."""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    """Generates a secure JSON Web Token (JWT) string for user authorization."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
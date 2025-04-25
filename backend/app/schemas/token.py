from typing import Optional
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """Token schema."""
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    """Token payload schema."""
    sub: Optional[str] = None
    exp: int


class TokenData(BaseModel):
    """Token data schema."""
    email: Optional[EmailStr] = None

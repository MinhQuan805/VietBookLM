from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Notebook(BaseModel):
    title: str
    password: str = ''
    avatar: str = ''
    list_conversations: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
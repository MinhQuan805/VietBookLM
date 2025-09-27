from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class MessageItem(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)

class Conversation(BaseModel):
    messages: List[MessageItem]  # Message List
    created_at: datetime
    updated_at: datetime
    deleted: bool = False
    deleted_at: Optional[datetime] = None
    expireAt: Optional[datetime] = None
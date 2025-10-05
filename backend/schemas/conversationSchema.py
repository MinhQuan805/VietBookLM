from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class MessagePart(BaseModel):
    type: Literal["text", "code", "image"]
    text: str

class MessageItem(BaseModel):
    id: str
    role: Literal["user", "system", "assistant"]
    parts: List[MessagePart]
    timestamp: datetime = Field(default_factory=datetime.now)

class Conversation(BaseModel):
    title: str = ''
    messages: List[MessageItem]  # Message List
    created_at: datetime
    updated_at: datetime
    deleted: bool = False
    deleted_at: Optional[datetime] = None
    expireAt: Optional[datetime] = None
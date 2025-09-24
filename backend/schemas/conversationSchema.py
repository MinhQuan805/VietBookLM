from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class MessageItem(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)

class Conversation(BaseModel):
    messages: List[MessageItem]  # danh sách message
    created_at: datetime
    updated_at: datetime
    deleted: bool = False
    
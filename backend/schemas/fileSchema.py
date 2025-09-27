from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class FileList(BaseModel):
    file_id: Optional[str] = None
    title: str
    storage_path: Optional[str] = None
    file_type: str = "pdf"
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None

class FileUpload(BaseModel):
    conversation_id: str
    file_list: List[FileList] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SingleFile(BaseModel):
    file_id: Optional[str] = None
    title: str
    storage_path: Optional[str] = None
    file_type: str = "pdf"
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None

class FileUpload(BaseModel):
    notebook_id: str
    file_list: List[SingleFile] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime
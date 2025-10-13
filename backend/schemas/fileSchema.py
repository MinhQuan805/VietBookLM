from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SingleFile(BaseModel):
    public_id: Optional[str] = ''
    filename: str
    url: str
    format: str
    bytes: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None

class FileListStorage(BaseModel):
    notebookId: str
    file_list: List[SingleFile] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime
    deleted: bool = False
    deleted_at: Optional[datetime] = None
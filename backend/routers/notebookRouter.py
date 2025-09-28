from fastapi import APIRouter, HTTPException
from schemas.fileSchema import FileUpload
from config.database import db
from datetime import datetime, timezone
from bson import ObjectId

collection = db["files"]

router = APIRouter(
    prefix="/files",
    tags=["files"]
)

# Get all files
@router.get("/", response_model=list[FileUpload])
async def get_all_files():
    docs = collection.find({})
    return [
        FileUpload(
            title=doc["title"],
            list_conversations=doc.get("list_conversations"),
            created_at=doc["created_at"],
            updated_at=doc.get("updated_at")
        )
        for doc in docs
    ]

# Get a single file by ID
@router.get("/{file_id}", response_model=FileUpload)
async def get_file(file_id: str):
    doc = collection.find_one({"_id": ObjectId(file_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")
    return FileUpload(
        title=doc["title"],
        list_conversations=doc.get("list_conversations"),
        created_at=doc["created_at"],
        updated_at=doc.get("updated_at")
    )

# Create a new file
@router.post("/", response_model=FileUpload)
async def create_file(upload: FileUpload):
    now = datetime.now(timezone.utc)
    data = upload.dict()
    data.update({"created_at": now, "updated_at": now})
    result = collection.insert_one(data)
    doc = collection.find_one({"_id": result.inserted_id})
    return FileUpload(
        title=doc["title"],
        list_conversations=doc.get("list_conversations"),
        created_at=doc["created_at"],
        updated_at=doc.get("updated_at")
    )

# Update a file
@router.put("/{file_id}", response_model=FileUpload)
async def update_file(file_id: str, upload: FileUpload):
    now = datetime.now(timezone.utc)
    result = collection.update_one(
        {"_id": ObjectId(file_id)},
        {"$set": {**upload.model_dump(exclude_unset=True), "updated_at": now}}
    )
    if result.modified_count == 1:
        doc = collection.find_one({"_id": ObjectId(file_id)})
        return FileUpload(
            title=doc["title"],
            list_conversations=doc.get("list_conversations"),
            created_at=doc["created_at"],
            updated_at=doc.get("updated_at")
        )
    else:
        raise HTTPException(status_code=404, detail="File not found")

# Delete a file
@router.delete("/{file_id}")
async def delete_file(file_id: str):
    result = collection.delete_one({"_id": ObjectId(file_id)})
    if result.deleted_count == 1:
        return {"status": True, "message": "File deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="File not found")

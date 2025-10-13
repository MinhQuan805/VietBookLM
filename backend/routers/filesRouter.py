from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from schemas.fileSchema import FileListStorage, SingleFile
from config.database import db
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from bson.errors import InvalidId
from typing import Annotated
from typing import List
from libs.cloudinary import upload_files

file_collection = db["files"]

router = APIRouter(
    prefix="/files",
    tags=["files"]
)

# Upload file
@router.post("/upload_files/{notebookId}")
async def upload_endpoint(notebookId: str, files: List[UploadFile] = File(...)):
    try:
        uploaded_files = await upload_files(files)
        now = datetime.now(timezone.utc)
        result = await file_collection.update_one(
            {"notebookId": notebookId},
            {
                "$push": {"file_list": {"$each": uploaded_files}},
                "$set": {"updated_at": now}
            }
        )
    except:
        raise HTTPException(status_code=404, detail="Files not found")

# Create new file storage
@router.post("/create/{notebookId}")
async def create_file_storage(notebookId: str):
    now = datetime.now(timezone.utc)
    new_file_storage = {
        "notebookId": notebookId,
        "file_list": [],
        "created_at": now,
        "updated_at": now,
        "deleted": False,
    }

    result = await file_collection.insert_one(new_file_storage)
    fileStorageId = str(result.inserted_id)
    return {"fileStorageId": fileStorageId}

# Get all files uploads
@router.get("/{notebookId}")
async def get_all_files(notebookId: str):
    files = await file_collection.find_one({"notebookId": notebookId, "deleted": False}, {"_id": 0, "file_list": 1})
    return files["file_list"]

# Get file by id
@router.get("/{file_id}", response_model=FileListStorage)
async def get_file(file_id: str):
    try:
        obj_id = ObjectId(file_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid file_id format")

    doc = await file_collection.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="File upload not found")

    return FileListStorage(
        notebookId=str(doc["notebookId"]),
        file_list=[SingleFile(**f) for f in doc["file_list"]],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )



# Update file upload (add more files)
@router.patch("/{file_id}", response_model=FileListStorage)
async def update_file(file_id: str, file_item: SingleFile):
    try:
        obj_id = ObjectId(file_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid file_id format")
    now = datetime.now(timezone.utc)
    
    doc = await file_collection.find_one({"_id": obj_id}, {"file_list": 1})
    
    count = len(doc.get("file_list", []))
    if count >= 5:
        raise HTTPException(status_code=400, detail="Number of files exceeded limit")
    
    result = await file_collection.update_one(
        {"_id": obj_id},
        {
            "$push": {"file_list": file_item.model_dump()},
            "$set": {"updated_at": now}
        }
    )

    if result.modified_count == 1:
        doc = await file_collection.find_one({"_id": obj_id})
        return FileListStorage(
            notebookId=str(doc["notebookId"]),
            file_list=[SingleFile(**f) for f in doc["file_list"]],
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
        )
    else:
        raise HTTPException(status_code=404, detail="File upload not found")

# Delete single file upload permanently
@router.delete("/{notebookId}/{file_id}")
async def delete_single_file(notebookId: str, file_id: str):
    result = await file_collection.update_one(
        {"notebookId": notebookId},
        {"$pull": {"file_list": {"file_id": file_id}}}
    )

    if result.modified_count == 1:
        return {"status": True, "message": "File upload deleted permanently"}
    else:
        raise HTTPException(status_code=404, detail="File upload not found")

# Delete all file upload permanently
@router.delete("/{notebookId}")
async def delete_file_conversations(notebookId: str):
    result = await file_collection.delete_one({"notebookId": notebookId})

    if result.deleted_count == 1:
        return {"status": True, "message": "Files upload deleted permanently"}
    else:
        raise HTTPException(status_code=404, detail="Files upload not found")

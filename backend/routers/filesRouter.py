from fastapi import APIRouter, HTTPException, Depends
from schemas.fileSchema import FileUpload, SingleFile
from config.database import db
from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId
from typing import Annotated

collection = db["files"]

router = APIRouter(
    prefix="/files",
    tags=["files"]
)

# Get all files uploads
@router.get("/", response_model=list[FileUpload])
async def get_all_files():
    uploads = []
    cursor = collection.find({})
    async for doc in cursor:
        uploads.append(
            FileUpload(
                conversation_id=str(doc["conversation_id"]),
                file_list=[SingleFile(**f) for f in doc["file_list"]],
                created_at=doc["created_at"],
                updated_at=doc["updated_at"],
            )
        )
    return uploads

# Get file by id
@router.get("/{file_id}", response_model=FileUpload)
async def get_file(file_id: str):
    try:
        obj_id = ObjectId(file_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid file_id format")

    doc = await collection.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="File upload not found")

    return FileUpload(
        conversation_id=str(doc["conversation_id"]),
        file_list=[SingleFile(**f) for f in doc["file_list"]],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )

# Create new file upload
@router.post("/", response_model=FileUpload)
async def create_file(upload: FileUpload):
    now = datetime.now(timezone.utc)
    new_upload = upload.model_dump()
    new_upload.update({
        "created_at": now,
        "updated_at": now,
    })

    result = await collection.insert_one(new_upload)
    doc = await collection.find_one({"_id": result.inserted_id})

    return FileUpload(
        conversation_id=str(doc["conversation_id"]),
        file_list=[SingleFile(**f) for f in doc["file_list"]],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )

# Update file upload (add more files)
@router.patch("/{file_id}", response_model=FileUpload)
async def update_file(file_id: str, file_item: SingleFile):
    try:
        obj_id = ObjectId(file_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid file_id format")
    now = datetime.now(timezone.utc)
    
    doc = await collection.find_one({"_id": obj_id}, {"file_list": 1})
    
    count = len(doc.get("file_list", []))
    if count >= 5:
        raise HTTPException(status_code=400, detail="Number of files exceeded limit")
    
    result = await collection.update_one(
        {"_id": obj_id},
        {
            "$push": {"file_list": file_item.model_dump()},
            "$set": {"updated_at": now}
        }
    )

    if result.modified_count == 1:
        doc = await collection.find_one({"_id": obj_id})
        return FileUpload(
            conversation_id=str(doc["conversation_id"]),
            file_list=[SingleFile(**f) for f in doc["file_list"]],
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
        )
    else:
        raise HTTPException(status_code=404, detail="File upload not found")

# Delete single file upload permanently
@router.delete("/{conversation_id}/{file_id}")
async def delete_single_file(conversation_id: str, file_id: str):
    result = await collection.update_one(
        {"conversation_id": conversation_id},
        {"$pull": {"file_list": {"file_id": file_id}}}
    )

    if result.modified_count == 1:
        return {"status": True, "message": "File upload deleted permanently"}
    else:
        raise HTTPException(status_code=404, detail="File upload not found")

# Delete all file upload permanently
@router.delete("/{conversation_id}")
async def delete_file_conversations(conversation_id: str):
    result = await collection.delete_one({"conversation_id": conversation_id})

    if result.deleted_count == 1:
        return {"status": True, "message": "Files upload deleted permanently"}
    else:
        raise HTTPException(status_code=404, detail="Files upload not found")

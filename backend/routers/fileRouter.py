from fastapi import APIRouter, HTTPException
from schemas.fileSchema import FileUpload, FileList
from config.database import db
from datetime import datetime, timezone
from bson import ObjectId

collection = db["file"]

router = APIRouter(
    prefix="/file",
    tags=["file"]
)

# Get all file uploads
@router.get("/", response_model=list[FileUpload])
async def get_all_files():
    docs = collection.find({})
    uploads = []
    for doc in docs:
        uploads.append(
            FileUpload(
                conversation_id=str(doc["conversation_id"]),
                file_list=[FileList(**f) for f in doc["file_list"]],
                created_at=doc["created_at"],
                updated_at=doc["updated_at"],
            )
        )
    return uploads

# Get file file by id
@router.get("/{file_id}", response_model=FileUpload)
async def get_file(file_id: str):
    doc = collection.find_one({"_id": ObjectId(file_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="File upload not found")

    return FileUpload(
        conversation_id=str(doc["conversation_id"]),
        file_list=[FileList(**f) for f in doc["file_list"]],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )

# Create new file upload
@router.post("/", response_model=FileUpload)
async def create_file(upload: FileUpload):
    now = datetime.now(timezone.utc)
    new_upload = upload.dict()
    new_upload.update({
        "created_at": now,
        "updated_at": now,
    })

    result = collection.insert_one(new_upload)
    doc = collection.find_one({"_id": result.inserted_id})

    return FileUpload(
        conversation_id=str(doc["conversation_id"]),
        file_list=[FileList(**f) for f in doc["file_list"]],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )

# Update file upload (add more files)
@router.post("/{file_id}", response_model=FileUpload)
async def update_file(file_id: str, file_item: FileList):
    now = datetime.now(timezone.utc)
    result = collection.update_one(
        {"_id": ObjectId(file_id)},
        {
            "$push": {"file_list": file_item.model_dump()},
            "$set": {"updated_at": now}
        }
    )

    if result.modified_count == 1:
        doc = collection.find_one({"_id": ObjectId(file_id)})
        return FileUpload(
            conversation_id=str(doc["conversation_id"]),
            file_list=[FileList(**f) for f in doc["file_list"]],
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
        )
    else:
        raise HTTPException(status_code=404, detail="File upload not found")

# Delete file upload permanently
@router.delete("/{file_id}")
async def delete_file(file_id: str):
    result = collection.delete_one({"_id": ObjectId(file_id)})

    if result.deleted_count == 1:
        return {"status": True, "message": "File upload deleted permanently"}
    else:
        raise HTTPException(status_code=404, detail="File upload not found")

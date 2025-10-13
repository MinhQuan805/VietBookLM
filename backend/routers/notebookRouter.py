from fastapi import APIRouter, HTTPException
from schemas.notebookSchema import Notebook
from config.database import db
from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId
import bcrypt
from routers.conversationsRouter import create_conversation
from routers.filesRouter import create_file_storage

notebook_collection = db["notebooks"]
file_collection = db["files"]
router = APIRouter(
    prefix="/notebooks",
    tags=["notebooks"]
)


# Get all notebooks
@router.get("/", response_model=list[Notebook])
async def get_all_notebooks():
    docs = notebook_collection.find({})
    notebooks = []
    async for doc in docs:
        notebooks.append(
            Notebook(
                title=doc["title"],
                password=doc.get("password", ""),
                avatar=doc.get("avatar", ""),
                created_at=doc["created_at"],
                updated_at=doc.get("updated_at")
            )
        )
    return notebooks


# Get a single notebook by ID
@router.get("/{notebookId}", response_model=Notebook)
async def get_notebook(notebookId: str):
    doc = await notebook_collection.find_one({"_id": ObjectId(notebookId)})
    if not doc:
        raise HTTPException(status_code=404, detail="Notebook not found")

    return Notebook(
        title=doc["title"],
        password=doc.get("password", ""),
        avatar=doc.get("avatar", ""),
        created_at=doc["created_at"],
        updated_at=doc.get("updated_at")
    )


# Create a new notebook
@router.post("/create")
async def create_notebook(upload: Notebook):
    now = datetime.now(timezone.utc)
    data = upload.model_dump()

    # Hash password
    if data.get("password"):
        hashed_pw = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())
        data["password"] = hashed_pw.decode("utf-8")
    data.update({"created_at": now, "updated_at": now})

    result = await notebook_collection.insert_one(data)

    notebookId = str(result.inserted_id)
    # Create new conversation for new notebook
    conversation = await create_conversation(notebookId)

    # Create new file storage for new notebook
    fileStorage = await create_file_storage(notebookId)
    return {"notebookId": notebookId, "conversationId": conversation["conversationId"], "fileStorageId": fileStorage["fileStorageId"]}


# Update a notebook
@router.patch("/{notebookId}", response_model=Notebook)
async def update_notebook(notebookId: str, upload: Notebook):
    try:
        notebook_obj_id = ObjectId(notebookId)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid notebookId format")
    now = datetime.now(timezone.utc)
    result = await notebook_collection.update_one(
        {"_id": notebook_obj_id},
        {"$set": {**upload.model_dump(exclude_unset=True), "updated_at": now}}
    )

    if result.modified_count == 1:
        doc = await notebook_collection.find_one({"_id": ObjectId(notebookId)})
        return Notebook(
            title=doc["title"],
            password=doc.get("password", ""),
            avatar=doc.get("avatar", ""),
            created_at=doc["created_at"],
            updated_at=doc.get("updated_at")
        )
    else:
        raise HTTPException(status_code=404, detail="Notebook not found")


# Delete a notebook
@router.delete("/{notebookId}")
async def delete_notebook(notebookId: str):
    result = await notebook_collection.delete_one({"_id": ObjectId(notebookId)})

    # Delete file storage for notebook
    if result.deleted_count == 1:
        return {"status": True, "message": "Notebook deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Notebook not found")

    
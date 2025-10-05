from fastapi import APIRouter, HTTPException
from schemas.notebookSchema import Notebook
from config.database import db
from datetime import datetime, timezone
from bson import ObjectId
import bcrypt

collection = db["notebooks"]

router = APIRouter(
    prefix="/notebooks",
    tags=["notebooks"]
)


# Get all notebooks
@router.get("/", response_model=list[Notebook])
async def get_all_notebooks():
    docs = collection.find({})
    notebooks = []
    async for doc in docs:
        notebooks.append(
            Notebook(
                title=doc["title"],
                password=doc.get("password", ""),
                avatar=doc.get("avatar", ""),
                list_conversations=doc.get("list_conversations"),
                created_at=doc["created_at"],
                updated_at=doc.get("updated_at")
            )
        )
    return notebooks


# Get a single notebook by ID
@router.get("/{notebook_id}", response_model=Notebook)
async def get_notebook(notebook_id: str):
    doc = await collection.find_one({"_id": ObjectId(notebook_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Notebook not found")

    return Notebook(
        title=doc["title"],
        password=doc.get("password", ""),
        avatar=doc.get("avatar", ""),
        list_conversations=doc.get("list_conversations"),
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

    result = await collection.insert_one(data)
    return {"notebookId": str(result.inserted_id)}


# Update a notebook
@router.put("/{notebook_id}", response_model=Notebook)
async def update_notebook(notebook_id: str, upload: Notebook):
    now = datetime.now(timezone.utc)
    result = await collection.update_one(
        {"_id": ObjectId(notebook_id)},
        {"$set": {**upload.model_dump(exclude_unset=True), "updated_at": now}}
    )

    if result.modified_count == 1:
        doc = await collection.find_one({"_id": ObjectId(notebook_id)})
        return Notebook(
            title=doc["title"],
            password=doc.get("password", ""),
            avatar=doc.get("avatar", ""),
            list_conversations=doc.get("list_conversations"),
            created_at=doc["created_at"],
            updated_at=doc.get("updated_at")
        )
    else:
        raise HTTPException(status_code=404, detail="Notebook not found")


# Delete a notebook
@router.delete("/{notebook_id}")
async def delete_notebook(notebook_id: str):
    result = await collection.delete_one({"_id": ObjectId(notebook_id)})
    if result.deleted_count == 1:
        return {"status": True, "message": "Notebook deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Notebook not found")

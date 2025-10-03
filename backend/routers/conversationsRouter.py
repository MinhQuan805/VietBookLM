from fastapi import APIRouter, HTTPException, Depends
from schemas.conversationSchema import Conversation, MessageItem
from config.database import db
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from bson.errors import InvalidId
from typing import Annotated

collection = db["conversations"]

router = APIRouter(
    prefix="/conversations",
    tags=["conversations"]
)


# Get all conversations
@router.get("/", response_model=list[Conversation])
async def get_all_conversation():
    conversations = []
    cursor = collection.find({}, {"messages": 0, "deleted": 0})
    async for doc in cursor:
        conversations.append(
            Conversation(
                messages=[MessageItem(**m) for m in doc.get("messages", [])],
                created_at=doc["created_at"],
                updated_at=doc["updated_at"],
                deleted=doc.get("deleted", False),
                expireAt=doc.get("expireAt"),
            )
        )
    return conversations

# Get conversation by session_id
@router.get("/{session_id}", response_model=Conversation)
async def get_conversation(session_id: str):
    try:
        obj_id = ObjectId(session_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid session_id format")

    doc = await collection.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return Conversation(
        messages=[MessageItem(**m) for m in doc.get("messages", [])],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        deleted=doc.get("deleted", False),
        expireAt=doc.get("expireAt"),
    )

# Create new conversation
@router.post("/", response_model=Conversation)
async def create_conversation(message_item: MessageItem):
    now = datetime.now(timezone.utc)
    new_conversation = {
        "messages": [message_item.model_dump()],
        "created_at": now,
        "updated_at": now,
        "deleted": False,
        "expireAt": now + timedelta(days=3)
    }

    result = await collection.insert_one(new_conversation)
    doc = await collection.find_one({"_id": result.inserted_id})

    return Conversation(
        messages=[MessageItem(**m) for m in doc.get("messages", [])],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        deleted=doc.get("deleted", False),
        expireAt=doc.get("expireAt"),
    )

# Add 1 message into conversation
@router.patch("/{session_id}", response_model=dict)
async def update_conversation(
    session_id: str,
    message_item: MessageItem
):
    try:
        obj_id = ObjectId(session_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid session_id format")

    doc = await collection.find_one({"_id": ObjectId(session_id)}, {"messages": 1})
    count = len(doc.get("messages", []))
    if count >= 10:
        raise HTTPException(status_code=400, detail="Number of conversations exceeded limit")

    now = datetime.now(timezone.utc)
    result = await collection.update_one(
        {"_id": obj_id},
        {
            "$push": {"messages": message_item.model_dump()},
            "$set": {
                "updated_at": now,
                "expireAt": now + timedelta(days=3)
            }
        }
    )

    if result.modified_count == 1:
        return {"status": True, "message": "Conversation has been updated"}
    else:
        raise HTTPException(status_code=404, detail="Conversation not found")

# Delete conversation by id (soft delete + TTL)
@router.delete("/delete/{session_id}", response_model=dict)
async def delete_conversation(session_id: str):
    try:
        obj_id = ObjectId(session_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid session_id format")

    now = datetime.now(timezone.utc)
    result = await collection.update_one(
        {"_id": obj_id},
        {
            "$set": {
                "deleted": True,
                "deleted_at": now,
                "expireAt": now + timedelta(days=3)
            }
        }
    )

    if result.modified_count == 1:
        return {"status": True, "message": "Conversation will be deleted"}
    else:
        raise HTTPException(status_code=404, detail="Conversation not found")

from fastapi import APIRouter, HTTPException
from schemas.conversationSchema import Conversation, MessageItem
from config.database import db
from datetime import datetime
from bson import ObjectId
collection = db["conversations"]

router = APIRouter(tags=["conversations"])

# Lấy conversation theo session_id
@router.get("/conversations/{session_id}", response_model=Conversation)
async def get_conversation(session_id: str):
    doc = collection.find_one({"_id": ObjectId(session_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return Conversation(
        messages=[MessageItem(**m) for m in doc["messages"]],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        deleted=doc.get("deleted", False),
    )

# Tạo mới conversation
@router.post("/conversations", response_model=Conversation)
async def create_conversation(message_item: MessageItem):
    now = datetime.now()
    new_mes = {
        "messages": [message_item.dict()],
        "created_at": now,
        "updated_at": now,
        "deleted": False
    }

    result = collection.insert_one(new_mes)

    return Conversation(
        messages=[MessageItem(**m) for m in new_mes["messages"]],
        created_at=new_mes["created_at"],
        updated_at=new_mes["updated_at"],
        deleted=new_mes["deleted"],
    )

# Thêm 1 message vào conversation
@router.post("/conversations/{session_id}", response_model=Conversation)
async def update_conversation(session_id: str, message_item: MessageItem):
    now = datetime.now()

    result = collection.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$push": {"messages": message_item.dict()},
            "$set": {"updated_at": now}
        }
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")

    doc = collection.find_one({"_id": ObjectId(session_id)})

    return Conversation(
        messages=[MessageItem(**m) for m in doc["messages"]],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        deleted=doc.get("deleted", False),
    )
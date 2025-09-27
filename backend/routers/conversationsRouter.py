from fastapi import APIRouter, HTTPException
from schemas.conversationSchema import Conversation, MessageItem
from config.database import db
from datetime import datetime, timedelta, timezone
from bson import ObjectId

collection = db["conversations"]

collection.create_index("expireAt", expireAfterSeconds=0)

router = APIRouter(
    prefix="/conversations",
    tags=["conversations"]
)

# Get all conversations
@router.get("/", response_model=list[Conversation])
async def getAll_conversation():
    docs = collection.find({}, {"messages": 0, "deleted": 0})
    print(docs)
    conversations = []
    for doc in docs:
        conversations.append(
            Conversation(
                messages=[MessageItem(**m) for m in doc["messages"]],
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
    doc = collection.find_one({"_id": ObjectId(session_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return Conversation(
        messages=[MessageItem(**m) for m in doc["messages"]],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        deleted=doc.get("deleted", False),
        expireAt=doc.get("expireAt"),
    )

# Create new conversation
@router.post("/", response_model=Conversation)
async def create_conversation(message_item: MessageItem):
    now = datetime.now(timezone.utc)
    new_mes = {
        "messages": [message_item.model_dump()],
        "created_at": now,
        "updated_at": now,
        "deleted": False,
        "expireAt": now + timedelta(days=3)
    }

    result = collection.insert_one(new_mes)

    doc = collection.find_one({"_id": result.inserted_id})

    return Conversation(
        messages=[MessageItem(**m) for m in doc["messages"]],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        deleted=doc.get("deleted", False),
    )


# Add 1 message into conversation
@router.post("/{session_id}", response_model=Conversation)
async def update_conversation(session_id: str, message_item: MessageItem):
    now = datetime.now(timezone.utc)

    result = collection.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$push": {"messages": message_item.model_dump()},
            "$set": {
                "updated_at": now,
                "expireAt": now + timedelta(days=3)
            },
        }
    )

    if result.modified_count == 1:
        return {
            "status": True,
            "message": "Conversation has been updated"
        }
    else:
        return {
            "status": False,
            "message": "Conversation not found"
        }

# Delete conversation by id
@router.delete("/delete/{session_id}")
async def delete_conversation(session_id: str):
    now = datetime.now(timezone.utc)
    result = collection.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$set": {
                "deleted": True,
                "deleted_at": now,
                "expireAt": now + timedelta(days=3)
            }
        }
    )

    if result.modified_count == 1:
        return {
            "status": True,
            "message": "Conversation will be deleted"
        }
    else:
        return {
            "status": False,
            "message": "Conversation not found"
        }
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from routers import conversationsRouter as conversations, filesRouter as files
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="VietBookLM",
    version="1.0",
    description="Chatbot hỗ trợ học tập",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversations.router, tags=["conversations"])
app.include_router(files.router, tags=["files"])

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
import os
import cloudinary
from cloudinary.uploader import upload
from fastapi import UploadFile, HTTPException, status
from typing import List
from dotenv import load_dotenv
from datetime import datetime, timezone

# Load biến môi trường
load_dotenv()

# Cấu hình Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Hàm upload nhiều file
async def upload_files(files: List[UploadFile]):
    uploaded = []
    now = datetime.now(timezone.utc)
    try:
        for file in files:
            upload_result = upload(
                file.file,
                folder="AI For Learning",  
                resource_type="auto"
            )

            uploaded.append({
                "public_id": upload_result.get("public_id"),
                "filename": file.filename,
                "url": upload_result.get("secure_url"),
                "format": upload_result.get("format"),
                "bytes": str(upload_result.get("bytes")),
                "created_at": now,
                "updated_at": now,
            })

        return uploaded

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading files: {str(e)}"
        )
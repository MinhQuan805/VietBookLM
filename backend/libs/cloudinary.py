import os
import cloudinary
from cloudinary.uploader import upload
from fastapi import UploadFile, HTTPException, status
from typing import List
from dotenv import load_dotenv

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
    uploaded_urls = []

    try:
        for file in files:
            upload_result = upload(
                file.file,
                folder="AI For Learning",  
                resource_type="auto"
            )

            uploaded_urls.append({
                "filename": file.filename,
                "url": upload_result.get("secure_url"),
                "public_id": upload_result.get("public_id"),
                "format": upload_result.get("format"),
                "bytes": upload_result.get("bytes")
            })

        return uploaded_urls

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading files: {str(e)}"
        )
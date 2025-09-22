from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Định nghĩa schema cho body
class Item(BaseModel):
    name: str
    price: float
    description: str

@app.post("/items/")
async def create_item(item: Item):
    return {"message": "Item received", "data": item}

from typing import Optional
from pydantic import BaseModel

class Video(BaseModel):
    name: str
    type: str
    size: int
    base64: str

    class Config:
        json_schema_extra = {
            "example": {
                "name": "video_1",
                "type": "aaa",
                "size": 1920,
                "base64": "aaabbbccc"
            }
        }

class RequestAlign(BaseModel):
    video: Optional[Video] = None
    text: str

    class Config:
        json_schema_extra = {
            "example": {
                "video": {
                    "name": "video_1",
                    "type": "aaa",
                    "size": 1920,
                    "base64": "aaabbbccc"
                },
                "text": "xxx"
            }
        }
        
from fastapi import UploadFile
import base64
import requests
from config import PROCESSING_SERVER_URL


def fix_base64_padding(base64_str: str) -> str:
    missing_padding = len(base64_str) % 4
    if missing_padding:
        base64_str += "=" * (4 - missing_padding)
    return base64_str


async def align(video, text: str):
    files = {"video": (video.filename, video.file, video.content_type)}
    response = requests.post(PROCESSING_SERVER_URL, files=files)
    return response.json()


async def get_mock_response_data(video_content, text):
    
    print(type(video_content))

    # Process based on video type
    if isinstance(video_content, str):          # Base64 string
        try:
            video_content = fix_base64_padding(video_content)
            decoded_bytes = base64.b64decode(video_content, validate=True)      
            video_size = len(decoded_bytes)
            print(f"Valid Base64 video. Size: {video_size} bytes")
            return {"message": "Valid Base64 video", "size": video_size}
        except Exception as e:
            print("Invalid Base64 string:", e)
            # return {"error": "Invalid Base64 video format"}

    elif isinstance(video_content, bytes):
        video_size = len(video_content)
        print(f"Received video file with size: {video_size} bytes")

    else:
        return {"error": "Unsupported video format"}

    timestamps = [1001, 1002, 1003, 2001, 2002, 2003]
    return {
	    "allFrames": [1, 10, 12],
	    "allSentences": ["This is a cat biting a dog.", "This is a cat and a dog"],
	    "results": {
            0: {
                1: [
                    {
                        "tokenId": "a cat",
                        "bbox": [0, 0, 10, 10],
                    },
                    {
                        "tokenId": "a dog",
                        "bbox": [10, 10, 20, 20],
                    },
                ],
                10: [
                    {
                        "tokenId": "a cat",
                        "bbox": [0, 0, 10, 10],
                    },
                    {
                        "tokenId": "a dog",
                        "bbox": [10, 10, 20, 20],
                    },
                ],
                12: [
                    {
                        "tokenId": "a cat",
                        "bbox": [0, 0, 10, 10],
                    },
                    {
                        "tokenId": "a dog",
                        "bbox": [10, 10, 20, 20],
                    },
                ],
            },
            1: {
                10: [
                    {
                        "tokenId": "a cat",
                        "bbox": [0, 0, 10, 10],
                    },
                    {
                        "tokenId": "a dog",
                        "bbox": [10, 10, 20, 20],
                    },
                ],
                12: [
                    {
                        "tokenId": "a cat",
                        "bbox": [0, 0, 10, 10],
                    },
                    {
                        "tokenId": "a dog",
                        "bbox": [10, 10, 20, 20],
                    },
                ],
            },
        }
    }
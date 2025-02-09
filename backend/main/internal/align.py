from fastapi import UploadFile
import base64
import requests
from config import PROCESSING_SERVER_URL
from .utils import fix_base64_padding, fix_json_keys


async def align(video, text: str):
    files = {"video": (video.filename, video.file, video.content_type)}
    response = requests.post(PROCESSING_SERVER_URL, files=files)
    detections = response.json()

    # Convert keys back to integers
    detections = fix_json_keys(detections)

    # Split text into sentences
    splits = text.split(".")
    sentences = {i: s.strip().lower() for i, s in enumerate(splits)}

    # Process
    results = {}
    for sentence_key, sentence in sentences.items():
        frames = {}
        for frame_key, frame_data in detections.items():
            frame_detections = []
            for detection in frame_data:
                if detection["tokenId"] in sentence:
                    frame_detections.append(detection)
            if len(frame_detections) > 0:
                frames[frame_key] = frame_detections
        if len(frames) > 0:
            results[sentence_key] = frames

    return {
        "allFrames": list(detections.keys()),
        "allSentences": list(sentences.values()),
        "results": results
    }


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
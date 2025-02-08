from typing import List, Dict, Optional
from pydantic import BaseModel, RootModel


class BBoxItem(BaseModel):
    tokenId: str
    bbox: List[int]  # Assuming it's always a list of four integers [x1, y1, x2, y2]


class FrameResults(BaseModel):
    RootModel: Dict[int, List[BBoxItem]]  # Maps frame ID (int) to a list of BBoxItems


class Results(BaseModel):
    RootModel: Dict[int, FrameResults]  # Maps an integer key to frame results


class ResponseAlign(BaseModel):
    allFrames: List[int]
    allSentences: List[str]
    results: Results

    class Config:
        json_schema_extra = {
            "example": {
                "allFrames": [101223, 123123, 234234],
                "allSentences": ["cau 1", "cau 2", "cau 3"],
                "results": {
                    0: {
                        101223: [
                            {
                                "tokenId": "a cat",
                                "bbox": [0, 0, 100, 100],
                            },
                            {
                                "tokenId": "a dog",
                                "bbox": [100, 100, 200, 200],
                            },
                        ],
                        123123: [
                            {
                                "tokenId": "a cat",
                                "bbox": [0, 0, 100, 100],
                            },
                            {
                                "tokenId": "a dog",
                                "bbox": [100, 100, 200, 200],
                            },
                        ],
                    },
                    1: {
                        101223: [
                            {
                                "tokenId": "a cat",
                                "bbox": [0, 0, 100, 100],
                            },
                            {
                                "tokenId": "a dog",
                                "bbox": [100, 100, 200, 200],
                            },
                        ],
                        123123: [
                            {
                                "tokenId": "a cat",
                                "bbox": [0, 0, 100, 100],
                            },
                            {
                                "tokenId": "a dog",
                                "bbox": [100, 100, 200, 200],
                            },
                        ],
                    },
                },
            }
        }

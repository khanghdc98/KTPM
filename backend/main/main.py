from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from schemas.request import RequestAlign
from schemas.response import ResponseAlign
from internal.align import get_mock_response_data, align


app = FastAPI(title="Sample FastAPI App", description="A simple FastAPI app with documentation.", version="1.0")


# Allow all origins, methods, and headers (for testing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}


@app.post("/align_video", response_model=dict)
async def upload_video(
    text: str = Form(...),
    video: UploadFile = File(...)
):

    # attributes
    video_content = await video.read()
    video_size = len(video_content)

    # function calling
    response_data = await get_mock_response_data(video_content, text)
    # response_data = align(video_content, text)

    # return
    header = {
        'Access-Control-Allow-Origin': '*'
    }
    if response_data:
        return JSONResponse(content=response_data, headers=header)
    else:
        return JSONResponse(status_code=204, content=None, headers=header)


@app.post("/align_video2", response_model=dict)
async def upload_video(
    text: str = Form(...),
    video: UploadFile = File(...)
):
    # function calling
    response_data = await align(video, text)

    # return
    header = {
        'Access-Control-Allow-Origin': '*'
    }
    if response_data:
        return JSONResponse(content=response_data, headers=header)
    else:
        return JSONResponse(status_code=204, content=None, headers=header)

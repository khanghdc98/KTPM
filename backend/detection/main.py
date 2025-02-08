import os
import cv2
import tempfile
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import subprocess


app = FastAPI()


# Allow all origins, methods, and headers (for testing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAVE_ROOT = "./OpenPVSG/data/ego4d"


async def extract_frames(video_file: UploadFile, save_root: str):
    """
    Processes the uploaded video file and extracts one frame per second.
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        temp_video.write(video_file.file.read())
        temp_path = temp_video.name
        video_path = os.path.join(save_root, "videos", video_file.filename)
        with open(video_path, "wb") as buffer:
            buffer.write(await video_file.read())

    video_name = os.path.splitext(video_file.filename)[0]
    save_dir = os.path.join(save_root, "frames", video_name)
    os.makedirs(save_dir, exist_ok=True)

    cap = cv2.VideoCapture(temp_path)
    
    if not cap.isOpened():
        return {"error": "Failed to open video file"}

    fps = int(cap.get(cv2.CAP_PROP_FPS))  # Frames per second
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = int(total_frames / fps)  # Video duration in seconds

    print(f"Video FPS: {fps}, Total Frames: {total_frames}, Duration: {duration} sec")

    count = 0
    for sec in range(duration):
        frame_number = sec * fps  # Select frame at this second
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        success, image = cap.read()
        if success:
            frame_path = os.path.join(save_dir, f"{sec:04d}.png")
            cv2.imwrite(frame_path, image)
            count += 1

    cap.release()
    os.remove(temp_path)

    print("Frames extracted")


async def process_video(video_name: str):
    """
    Runs the video processing script using SLURM and captures the output.
    """
    # Define variables
    partition = "batch"
    job_name = "psg"
    config = "./OpenPVSG/configs/mask2former/mask2former_r50_lsj_8x2_50e_coco-panoptic_custom_single_video_test.py"
    work_dir = "./OpenPVSG/work_dirs/mask2former_r50_ips"
    checkpoint = "./OpenPVSG/work_dirs/mask2former_r50_ips/epoch_8.pth"
    port = str(29500 + os.getpid() % 29)  # Generate a port based on process ID
    gpus_per_node = "1"
    cpus_per_task = "5"

    # Build the SLURM command
    command = [
        "srun", "-p", partition,
        "--job-name", job_name,
        "--gres=gpu:" + gpus_per_node,
        "--ntasks-per-node=" + gpus_per_node,
        "--cpus-per-task=" + cpus_per_task,
        "--kill-on-bad-exit=1",
        "python", "-u", "./OpenPVSG/tools/prepare_query_tube_ips.py",
        config, checkpoint,
        "--work-dir=" + work_dir,
        "--split", "val",
        "--eval", "PQ",
        "--video-name", video_name
    ]

    try:
        # Run the command and capture output
        process = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        print(f"Output: {process.stdout}")
        return {"status": "success", "output": process.stdout}
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}")
        return {"status": "error", "error_message": e.stderr}


@app.post("/video_detection")
async def process_uploaded_video(video: UploadFile = File(...)):
    video_name = video.filename.split(".")[0]
    await extract_frames(video, SAVE_ROOT)
    await process_video(video_name)
    return JSONResponse(content={"message": "Video processing started"})
    
import os
import cv2
from PIL import Image
from ultralytics import YOLO
import tempfile
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import subprocess
from utils import convert_to_tlwh


app = FastAPI()


# Allow all origins, methods, and headers (for testing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SAVE_ROOT = "./OpenPVSG/data"
SAVE_ROOT = "./data"


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
    cpus_per_task = "3"

    # Build the SLURM command
    command = [
        "srun", "-p", partition,
        "--job-name", job_name,
        "--nodelist", "phoenix3",
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
    

async def process_video_yolo(video_name: str):
    input_folder = os.path.join(SAVE_ROOT, "frames", video_name)
    image_files = sorted([f for f in os.listdir(input_folder) if f.endswith(('.jpg', '.jpeg', '.png'))])

    if not image_files:
        print("No images found in the input folder.")
        return

    model = YOLO("yolov8m-oiv7.pt")
    class_names = model.names

    outputs = {}
    for image_file in image_files:
        image_path = os.path.join(input_folder, image_file)
        img = cv2.imread(image_path)
        image_height, image_width = img.shape[:2]  # Get image dimensions

        if img is None:
            print(f"Error loading image: {image_file}")
            continue

        # Prepare output dictionary
        timestamp = int(image_file.split(".")[0])
        outputs[timestamp] = []

        # Run inference
        results = model(img, verbose=False)

        # Process results and draw bounding boxes
        # print(f"Results for {image_file}:")
        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])  # Bounding box
                conf = float(box.conf[0])  # Confidence score
                cls = int(box.cls[0])  # Class ID
                top_left_x, top_left_y, width, height = convert_to_tlwh(x1, y1, x2, y2, image_width, image_height)
                # print(f"  {cls}: {class_names[cls]} at ({top_left_x}, {top_left_y}) ({width}, {height})")
                # print(class_names[cls].lower(), conf)
                if conf > 0.3:
                    outputs[timestamp].append({
                        "tokenId": class_names[cls].lower(), 
                        "bbox": [top_left_x, top_left_y, width, height]
                    })

    return outputs
        
        


@app.post("/video_detection")
async def process_uploaded_video(video: UploadFile = File(...)):
    video_name = video.filename.split(".")[0]
    await extract_frames(video, SAVE_ROOT)
    outputs = await process_video_yolo(video_name)
    return JSONResponse(content=outputs)
    
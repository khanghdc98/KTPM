import { Detection } from "../types/ResultType";

export async function imagesToWebMWithMediaRecorder(
    frames: HTMLCanvasElement[],
    fps = 1,
): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
        if (frames.length === 0) {
            reject("No frames provided.");
            return;
        }

        const canvas = document.createElement("canvas"); // Create a fresh canvas
        const ctx = canvas.getContext("2d")!;
        canvas.width = frames[0].width;
        canvas.height = frames[0].height;

        const stream = canvas.captureStream(fps);
        const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (event) => chunks.push(event.data);
        recorder.onstop = () =>
            resolve(URL.createObjectURL(new Blob(chunks, { type: "video/webm" })));
        recorder.onerror = (event) => reject(event);

        let frameIndex = 0;

        const drawNextFrame = () => {
            if (frameIndex >= frames.length) {
                recorder.stop(); // Stop recording when all frames are drawn
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame
            ctx.drawImage(frames[frameIndex], 0, 0, canvas.width, canvas.height);
            frameIndex++;

            setTimeout(() => requestAnimationFrame(drawNextFrame), 1000 / fps);
        };

        recorder.start();
        drawNextFrame(); // Start drawing frames
    });
}


export const drawDetections = (
    ctx: CanvasRenderingContext2D,
    detections: Detection[],
    canvasWidth: number,
    canvasHeight: number,
    colorMap: Record<string, string>,
) => {
    detections.forEach((detection) => {
        const { bbox, tokenId } = detection;
        let color = colorMap[tokenId] || "rgba(0, 0, 0, 1)";
        console.log("colorMap", colorMap, color);
        color = color.replace('...', '1');
        const [x, y, width, height] = bbox;

        const xPos = x / 100 * canvasWidth;
        const yPos = y / 100 * canvasHeight;
        const boxWidth = width / 100 * canvasWidth;
        const boxHeight = height / 100 * canvasHeight;

        // Draw the bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.strokeRect(xPos, yPos, boxWidth, boxHeight);

        const getValidLabelPosition = (labelWidth: number, labelHeight: number) => {
            let labelX = xPos + 5;
            let labelY = yPos - 5;

            // Check if label fits within the top-left corner, otherwise adjust
            if (labelX + labelWidth > canvasWidth) {
                labelX = canvasWidth - labelWidth - 5; // Move label to the right
            }
            if (labelY < 0) {
                labelY = yPos + boxHeight + 20; // Move label below the box if it's too high
            }

            // Check if the label fits below the bounding box
            if (labelY + labelHeight > canvasHeight) {
                labelY = yPos - labelHeight - 5; // Move label above the box if it's too low
            }

            // If label on the left goes out of bounds, move it to the right
            if (labelX < 0) {
                labelX = xPos + boxWidth - labelWidth - 5;
            }

            return { labelX, labelY };
        };

        // Get the dimensions of the label (tokenId text)
        const labelWidth = ctx.measureText(tokenId).width;
        const labelHeight = 16; // Font size for label is 16px (adjust if needed)

        // Get valid label position
        const { labelX, labelY } = getValidLabelPosition(labelWidth, labelHeight);

        // Draw label (tokenId) near the bounding box
        ctx.fillStyle = color;
        ctx.font = "30px Arial";
        ctx.fillText(tokenId, labelX, labelY);
    });
};

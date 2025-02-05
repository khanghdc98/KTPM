import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../AppStore";
import { FrameResults, GeneralData } from "../types/ResultType";
import { VideoDisplay } from "./VideoDisplay";
import { drawDetections, imagesToWebMWithMediaRecorder } from "../utils/VideoUtils";

export const VideoDisplayFromData = ({
    data,
    style,
    colorMap
}: { data: GeneralData, style?: React.CSSProperties, colorMap: Record<string, string> }) => {
    const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
    const videoFrames = useAppSelector((state) => state.videoFrame.cache);
    const sentenceTimeStampAndDetections = useMemo(
        () => Object.values(data.results).flat(1),
        [data.results],
    );
    const firstTimeStampForEachSentence = useMemo(
        () => sentenceTimeStampAndDetections.map((sentenceTimeStampAndDetection: FrameResults) => {
            return Number.parseInt(Object.keys(sentenceTimeStampAndDetection)[0]);
        }),
        [sentenceTimeStampAndDetections],
    );

    const detectionForEachFirstFrameOfEachSentence = useMemo(
        () => sentenceTimeStampAndDetections.map((sentenceTimeStampAndDetection: FrameResults) => {
            return Object.values(sentenceTimeStampAndDetection)[0];
        }),
        [sentenceTimeStampAndDetections],
    );
    console.log("detectionForEachSentence", detectionForEachFirstFrameOfEachSentence);

    useEffect(() => {
        if (firstTimeStampForEachSentence.length === 0) {
            setVideoUrl(undefined);
            return;
        }

        const generateVideo = async () => {
            const frames: (HTMLCanvasElement | null)[] = await Promise.all(
                firstTimeStampForEachSentence.map(async (timestamp, index) => {
                    console.log("timestamp", timestamp);
                    const frameImage = videoFrames[timestamp];
                    const detections = detectionForEachFirstFrameOfEachSentence[index];

                    if (!frameImage) return null;

                    const img = new Image();
                    img.src = frameImage;
                    await img.decode();

                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d")!;
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    // Draw detections if available
                    if (detections) {
                        drawDetections(ctx, detections, canvas.width, canvas.height, colorMap);
                    }

                    return canvas;
                })
            );

            const validFrames = frames.filter((frame) => frame !== null) as HTMLCanvasElement[];

            if (validFrames.length === 0) {
                setVideoUrl(undefined);
                return;
            }

            const videoBlobUrl = await imagesToWebMWithMediaRecorder(validFrames);
            setVideoUrl(videoBlobUrl);
        };

        generateVideo();
    }, [sentenceTimeStampAndDetections, videoFrames]);



    return (
        <VideoDisplay videoURL={videoUrl} type="video/webm" style={style} />
    )
}
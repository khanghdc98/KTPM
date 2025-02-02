import { useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { appActions, useAppDispatch, useAppSelector } from "../../AppStore";
import { RemoveCircleRounded } from "@mui/icons-material";

const VideoInput = () => {
    const dispatch = useAppDispatch();
    const userInputs = useAppSelector((state) => state.app.userInputs);

    const [videoURL, setVideoURL] = useState<string | null>(null);

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleVideoUpload = async (file: File) => {
        if (file) {
            const base64 = await convertFileToBase64(file);

            setVideoURL(URL.createObjectURL(file)); // Set preview

            dispatch(appActions.setUserInputs({
                ...userInputs,
                video: { name: file.name, type: file.type, size: file.size, base64 },
            }));
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            handleVideoUpload(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { "video/*": [] },
        multiple: false,
        onDrop,
    });

    return (
        videoURL ? (
            <Box position='relative' mt={2}>
                <RemoveCircleRounded
                    color="error"
                    sx={{ cursor: "pointer", position: "absolute", top: '-20px', right: '-10px' }}
                    onClick={() => {
                        setVideoURL(null);
                        dispatch(appActions.setUserInputs({ ...userInputs, video: null }));
                    }} />
                <video key={videoURL} controls style={{ borderRadius: 8, maxHeight: 300, width: "100%" }}>
                    <source src={videoURL} type={userInputs.video?.type || "video/mp4"} />
                    Your browser does not support the video tag.
                </video>
            </Box>
        ) : (
            <Box
                {...getRootProps()}
                sx={{
                    border: "2px dashed #aaa",
                    borderRadius: 2,
                    padding: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: isDragActive ? "#f0f0f0" : "transparent",
                    transition: "background-color 0.3s",
                    height: '100%'
                }}
            >
                <input {...getInputProps()} />
                <Typography variant="body1" color="textSecondary">
                    {isDragActive ? "Drop the video here..." : "Click or drag a video file to upload"}
                </Typography>
            </Box>
        )
    );
};

export default VideoInput;

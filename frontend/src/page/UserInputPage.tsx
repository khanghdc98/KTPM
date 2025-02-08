import { Box, Button, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { appActions, useAppDispatch, useAppSelector } from "../AppStore";
import TextInput from "../component/input/TextInput";
import VideoInput from "../component/input/VideoInput";
import { setVideoSource } from "../slice/videoFrameSlice";

export const UserInputPage = () => {
	const nav = useNavigate();
	const dispatch = useAppDispatch();

	const videoSrc = useAppSelector((state) => state.videoFrame.videoSrc);
	const prevVideoSrc = useAppSelector((state) => state.videoFrame.prevVideoSrc);
	const videoURL = useAppSelector((state) => state.app.userInputs.video?.url);

	const handleSubmit = () => {
		console.log("Submit");
		if (!videoURL) {
			return;
		}
		dispatch(setVideoSource(videoURL));
	};

	useEffect(() => {
		console.log(videoSrc, prevVideoSrc)
		if (videoSrc && prevVideoSrc !== videoSrc) {
			nav("/result");
		}
	}, [videoSrc, nav]);



	return (
		<Paper
			elevation={4}
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "80%",
				maxWidth: "80%",
				mx: "auto",
				mt: 4,
				p: 2,
				border: "1px solid #ccc",
				borderRadius: 2,
			}}
		>
			<Typography
				variant="h6"
				gutterBottom
				align="center"
				fontWeight={800}
				width="100%"
			>
				Upload Your Video
			</Typography>

			<Box
				display="flex"
				flexDirection="row"
				mt={2}
				justifyContent="space-between"
				flexGrow={1}
			>
				<Box flex={1} mr={1}>
					<VideoInput />
				</Box>
				<Box flex={1} ml={1}>
					<TextInput />
				</Box>
			</Box>

			<Box mt={3}>
				<Button
					variant="contained"
					color="primary"
					fullWidth
					onClick={handleSubmit}
				>
					Submit
				</Button>
			</Box>
		</Paper>
	);
};

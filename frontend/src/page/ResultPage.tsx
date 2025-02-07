import { ChangeCircleRounded } from "@mui/icons-material";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Layout1Tab } from "../tab/Layout1Tab";
import { Layout2Tab } from "../tab/Layout2Tab";
import { PlainJsonTab } from "../tab/PlainJsonTab";
import { appActions, useAppDispatch, useAppSelector } from "../AppStore";
import { setVideoSource } from "../slice/videoFrameSlice";
import { useAlignVideoTextMutation } from "../api/alignApi";
import { createFileFromURL } from "../utils/VideoUtils";
import { GeneralData } from "../types/ResultType";
import "../component/loader.css"

const tabs = ["Layout 1", "Layout 2", "Layout 3", "Layout 4"];

const layouts = [Layout1Tab, Layout2Tab, PlainJsonTab, PlainJsonTab];

export const ResultPage = () => {
	const [activeTab, setActiveTab] = useState(0);
	const nav = useNavigate();
	const dispatch = useAppDispatch();
	const LayoutComponent = layouts[activeTab];

	const text = useAppSelector((state) => state.app.userInputs.text);
	const videoURL = useAppSelector((state) => state.app.userInputs.video?.url);
	const [alignVideoText, {data, isLoading, isError}] = useAlignVideoTextMutation();
	console.log(data, isLoading, isError)

	if (!isLoading){
		dispatch(appActions.setLoadingPopUp(''))
	}
	if (isError){
		dispatch(appActions.setLoadingPopUp('Error fetching result'))
	}

	useEffect(() => {
		const fetchData = async () => {
			if (!videoURL || videoURL === null ) {
				dispatch(appActions.setLoadingPopUp('Error: Video missing'))
				return;
			}
			if (!text || text === "") {
				dispatch(appActions.setLoadingPopUp('Error: Text missing'))
				return;
			}
			await createFileFromURL(videoURL, "uploaded_video.mp4").then((file) => {
				alignVideoText({ text: text, video: file });
				dispatch(appActions.setLoadingPopUp('Fetching results...'))
			});
		};
		fetchData();
	}, [videoURL, text]);

	return (
		<Box
			sx={{
				boxSizing: "border-box",
				height: "100%",
				width: "100dvw",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			{/* Tabs Container */}
			<Box height="50px" width="100dvw" paddingLeft="40px">
				<Box sx={{ display: "flex", position: "relative", height: "100%" }}>
					<ChangeCircleRounded
						color="success"
						fontSize="large"
						sx={{
							position: "absolute",
							top: "2%",
							right: "30px",
							cursor: "pointer",
						}}
						onClick={() => {
							dispatch(setVideoSource(null));
							setTimeout(() => {
								nav("/");
							}, 1000);
						}}
					/>
					{tabs.map((label, index) => (
						<Box
							key={index}
							onClick={() => setActiveTab(index)}
							sx={[
								(theme) => ({
									position: "absolute",
									height: "52px",
									left: `${index * (100 + 6)}px`,
									clipPath: "polygon(10% 23%, 90% 23%, 100% 77%, 0% 77%)",
									backgroundColor: "black",
									transition: "all 0.3s ease",
									width: 122,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									zIndex: activeTab === index ? 1 : 0,
									transform: activeTab === index ? "scale(1.05)" : "scale(1)",
									boxShadow: "4px 4px 20px 5px rgba(0,0,0,0.1)",
								}),
							]}
						>
							<Box
								key={index}
								onClick={() => setActiveTab(index)}
								sx={[
									(theme) => ({
										position: "relative",
										height: "50px",
										clipPath: "polygon(10% 23%, 90% 23%, 100% 77%, 0% 77%)",
										backgroundColor:
											activeTab === index
												? "#fff"
												: `hsl(0, 0%, ${68 + index * 8}%)`,
										color: theme.palette.text.primary,
										cursor: "pointer",
										textAlign: "center",
										fontSize: 13,
										fontWeight: activeTab === index ? "bold" : "normal",
										width: 120,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}),
								]}
							>
								{label}
							</Box>
						</Box>
					))}
				</Box>
			</Box>

			<Box
				sx={[
					(theme) => ({
						border: `1px solid ${theme.palette.text.primary}`,
						width: "98%",
						minHeight: "93%",
						maxHeight: "93%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						transition: "all 0.3s ease",
						borderRadius: "5px",
						marginTop: "-12px",
						boxShadow: "4px 4px 20px 10px rgba(0,0,0,0.1)",
						backgroundColor: `${theme.palette.background.paper}`,
						zIndex: 10,
					}),
				]}
			>
				{data ? (<LayoutComponent data={data} />) : <div  className="loader" />}
			</Box>
		</Box>
	);
};

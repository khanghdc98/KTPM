import { Box, Button, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import TextInput from "../component/input/TextInput";
import VideoInput from "../component/input/VideoInput";

export const UserInputPage = () => {
	const nav = useNavigate();

	const handleSubmit = () => {
		console.log("Submit");
		nav("/result");
	};

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

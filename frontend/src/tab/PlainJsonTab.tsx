import { ContentCopyRounded } from "@mui/icons-material";
import { Box, Snackbar } from "@mui/material";
import { useState } from "react";

export const PlainJsonTab = (data: any) => {
	const [copied, setCopied] = useState({
		open: false,
		message: "",
	});
	const handleCopy = () => {
		navigator.clipboard
			.writeText(JSON.stringify(data, null, 2))
			.then(() => {
				setCopied({ open: true, message: "Data has been copied to clipboard" });
				setTimeout(() => setCopied({ open: false, message: "" }), 2000);
			})
			.catch((err) => {
				console.error(err);
				setCopied({ open: true, message: "Failed to copy data to clipboard" });
			});
	};

	return (
		<Box height="100%" width="100%" position="relative" paddingLeft="20px">
			<ContentCopyRounded
				color="primary"
				sx={{
					position: "absolute",
					top: "10px",
					right: "10px",
					cursor: "pointer",
				}}
				onClick={handleCopy}
			/>
			<Box overflow="auto" height="100%" width="100%" fontSize={12}>
				<pre>{JSON.stringify(data, null, 2)}</pre>
			</Box>
			<Snackbar
				open={copied.open}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				autoHideDuration={2000}
				message={copied.message}
			/>
		</Box>
	);
};

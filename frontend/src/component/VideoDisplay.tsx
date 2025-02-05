import { Skeleton } from "@mui/material";

export const VideoDisplay = ({
	videoURL,
	type,
	style,
}: { videoURL: string | undefined; type?: string; style?: React.CSSProperties }) => {
	return (
		(videoURL !== undefined) ? (
			<video
				key={videoURL}
				controls
				style={style ? style : { borderRadius: 8, maxHeight: 300, width: "100%" }}
			>
				<source src={videoURL} type={type || "video/mp4"} />
				Your browser does not support the video tag.
			</video>
		) : (
			<Skeleton variant="rectangular" width="100%" height="100%" />
		)
	);
};

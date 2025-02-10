import { Box, Skeleton } from "@mui/material";
import type { Detection } from "../types/ResultType";
import { getUniqueColors } from "../utils/ColorUtils";

interface ImageWithBBoxProps {
	image: string;
	detections: Detection[];
	colorMap?: Record<string, string>;
	chosenToken?: string;
	setChosenToken?: React.Dispatch<React.SetStateAction<string>>;
}

export const ImageWithBBox: React.FC<ImageWithBBoxProps> = ({
	image,
	detections,
	colorMap,
	chosenToken,
	setChosenToken,
}) => {
	const tokens = detections.map((d) => d.tokenId);
	colorMap = colorMap ? colorMap : getUniqueColors([...new Set(tokens)]);

	return (
		<Box height="100%" position="relative" width="fit-content">
			{image !== undefined ? (
				<Box
					component="img"
					src={image}
					height="100%"
					sx={{ objectFit: "contain" }}
				/>
			) : (
				<Skeleton variant="rectangular" width="230px" height="100%" />
			)}

			{detections.map((detection) => (
				<div
					key={detection.tokenId}
					style={{
						position: "absolute",
						top: `${detection.bbox[0]}%`,
						left: `${detection.bbox[1]}%`,
						width: `${detection.bbox[2]}%`,
						height: `${detection.bbox[3]}%`,
						border: `4px solid ${chosenToken === detection.tokenId ? colorMap[detection.tokenId].replace("...", "1") : colorMap[detection.tokenId]?.replace("...", "0.5") || "black"}`,
						cursor: "pointer",
					}}
					onClick={() => setChosenToken && setChosenToken(detection.tokenId)}
				/>
			))}
		</Box>
	);
};

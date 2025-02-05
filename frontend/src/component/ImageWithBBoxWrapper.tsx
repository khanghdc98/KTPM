import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../AppStore";
import { fetchFrame } from "../slice/videoFrameSlice";
import type { Detection } from "../types/ResultType";
import { ImageWithBBox } from "./ImageWithBBox";

interface ImageWithBBoxWrapperProps {
	timestamp: number;
	detections: Detection[];
	colorMap?: Record<string, string>;
	chosenToken?: string;
	setChosenToken?: React.Dispatch<React.SetStateAction<string>>;
}

export const ImageWithBBoxWrapper: React.FC<ImageWithBBoxWrapperProps> = ({
	timestamp,
	detections,
	colorMap,
	chosenToken,
	setChosenToken,
}) => {
	const dispatch = useAppDispatch();
	const frame = useAppSelector((state) => state.videoFrame.cache[timestamp]);

	useEffect(() => {
		dispatch(fetchFrame(timestamp));
	}, [dispatch, timestamp]);

	return (
		<ImageWithBBox
			image={frame}
			detections={detections}
			colorMap={colorMap}
			chosenToken={chosenToken}
			setChosenToken={setChosenToken}
		/>
	);
};

import { Box, Divider } from "@mui/material";
import { useState } from "react";
import {
	AutoSizer,
	CellMeasurer,
	CellMeasurerCache,
	List,
} from "react-virtualized";
import { ImageWithBBoxWrapper } from "../component/ImageWithBBoxWrapper";
import { TextLine } from "../component/TextLine";
import type { Detection, GeneralData } from "../types/ResultType";
import { getUniqueColors } from "../utils/ColorUtils";

export const Layout1Tab = ({ data }: { data: GeneralData }) => {
	const sentences = data.allSentences;
	const [chosenToken, setChosenToken] = useState("");
	const cache = new CellMeasurerCache({
		fixedWidth: true,
		minHeight: 100,
	});

	const rowRenderer = ({
		index,
		key,
		style,
		parent,
	}: {
		index: number;
		key: string;
		style: React.CSSProperties;
		parent: any;
	}) => {
		const text = sentences[index];
		const timeStampAndDetections = data.results[index];
		const fameTimestamps = Object.keys(timeStampAndDetections).map(
			(timestamp) => Number.parseInt(timestamp),
		);
		const tokens = Object.values(timeStampAndDetections).flatMap(
			(detection: Detection[]) => {
				return detection.map((d) => d.tokenId);
			},
		);
		const colorMap = getUniqueColors([...new Set(tokens)]);

		return (
			<CellMeasurer
				cache={cache}
				columnIndex={0}
				key={key}
				rowIndex={index}
				parent={parent}
			>
				<Box
					style={style}
					display="flex"
					alignItems="center"
					padding="10px"
					borderBottom="1px solid #ddd"
				>
					<Box
						display="flex"
						flexDirection="row"
						overflow="auto"
						width="60%"
						sx={{ overflowX: "auto", overflowY: "hidden" }}
					>
						{fameTimestamps.map((timestamp: number) => (
							<Box
								key={timestamp}
								height="187px"
								marginRight="10px"
								position="relative"
								flexShrink={0}
							>
								<ImageWithBBoxWrapper
									detections={timeStampAndDetections[timestamp]}
									timestamp={timestamp}
									colorMap={colorMap}
									chosenToken={chosenToken}
									setChosenToken={setChosenToken}
								/>
							</Box>
						))}
					</Box>

					<Divider orientation="vertical" />

					<Box flex="1" paddingLeft="10px">
						<TextLine
							sentence={text}
							tokens={tokens}
							colorMap={colorMap}
							chosenToken={chosenToken}
							setChosenToken={setChosenToken}
						/>
					</Box>
				</Box>
			</CellMeasurer>
		);
	};

	return (
		<Box height="100%" width="100%" position="relative" paddingLeft="20px">
			<AutoSizer>
				{({ height, width }) => (
					<List
						width={width}
						height={height}
						rowCount={sentences.length}
						rowHeight={cache.rowHeight} // Use dynamic row height from cache
						rowRenderer={rowRenderer}
					/>
				)}
			</AutoSizer>
		</Box>
	);
};

import { ImageRounded, OndemandVideoRounded } from "@mui/icons-material";
import { Box, Divider } from "@mui/material";
import { useMemo, useState } from "react";
import {
    AutoSizer,
    CellMeasurer,
    CellMeasurerCache,
    List,
} from "react-virtualized";
import { ImageWithBBoxWrapper } from "../component/ImageWithBBoxWrapper";
import { TextLine } from "../component/TextLine";
import type { Detection, FrameResults, GeneralData } from "../types/ResultType";
import { getUniqueColors } from "../utils/ColorUtils";
import { VideoDisplayFromData } from "../component/VideoDisplayFromFrames";

export const Layout2Tab = ({ data }: { data: GeneralData }) => {
    const [selectedMode, setSelectedMode] = useState("image");

    const sentences = data.allSentences;
    const sentenceTimeStampAndDetections = useMemo(
        () => Object.values(data.results).flat(1),
        [data.results],
    );

    const tokens = useMemo(
        () =>
            sentenceTimeStampAndDetections.flatMap((d: FrameResults) =>
                Object.values(d).flatMap((detection: Detection[]) =>
                    detection.map((d) => d.tokenId),
                ),
            ),
        [sentenceTimeStampAndDetections],
    );

    const colorMap = useMemo(
        () => getUniqueColors([...new Set(tokens)]),
        [tokens],
    );
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

        const [resultKey, frameResults] = Object.entries(data.results)[index] || [];

        if (!frameResults) {
            console.warn(`No frameResults found for index ${index}`);
            return null;
        }

        const frameTimeStamp = Number.parseInt(Object.keys(frameResults)[0]);
        const detections = frameResults[frameTimeStamp];

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
                    justifyContent="center"
                    borderBottom="1px solid #ddd"
                >
                    <Box display="flex" flexDirection="row">
                        <Box
                            key={frameTimeStamp}
                            height="187px"
                            marginRight="10px"
                            position="relative"
                            flexShrink={0}
                        >
                            {detections ? (
                                <ImageWithBBoxWrapper
                                    detections={detections}
                                    timestamp={frameTimeStamp}
                                    colorMap={colorMap}
                                    chosenToken={chosenToken}
                                    setChosenToken={setChosenToken}
                                />
                            ) : (
                                <Box>No Detections</Box> // Prevents undefined errors
                            )}
                        </Box>
                    </Box>
                </Box>
            </CellMeasurer>
        );
    };

    return (
        <Box height="100%" width="100%" position="relative">
            <Box
                display="flex"
                height="100%"
                width="100%"
                flexDirection="row"
                alignItems="center"
                padding="10px"
                borderBottom="1px solid #ddd"
            >
                <Box
                    height="100%"
                    width="100%"
                    flex="1"
                    paddingLeft="10px"
                    paddingRight="10px"
                    position="relative"
                >
                    <Box
                        zIndex={10}
                        position="absolute"
                        top="0px"
                        right="10px"
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        columnGap="5px"
                    >
                        <OndemandVideoRounded
                            sx={{ cursor: "pointer" }}
                            color={selectedMode === "video" ? "primary" : "disabled"}
                            onClick={() => setSelectedMode("video")}
                        />
                        <ImageRounded
                            sx={{ cursor: "pointer" }}
                            color={selectedMode === "image" ? "primary" : "disabled"}
                            onClick={() => setSelectedMode("image")}
                        />
                    </Box>
                    {selectedMode === "video" ? (
                        <VideoDisplayFromData
                            data={data}
                            colorMap={colorMap}
                        />
                    ) : (
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
                    )}
                </Box>
                <Divider orientation="vertical" variant="middle" />

                <Box flex="1" display="flex" alignItems="center" padding="10px">
                    <TextLine
                        sentence={sentences.join(" ")}
                        tokens={tokens}
                        colorMap={colorMap}
                        chosenToken={chosenToken}
                        setChosenToken={setChosenToken}
                    />
                </Box>
            </Box>
        </Box>
    );
};

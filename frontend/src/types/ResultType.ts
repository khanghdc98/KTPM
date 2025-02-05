export type BoundingBox = [number, number, number, number];

export interface Detection {
    tokenId: string;
    bbox: BoundingBox;
}

export type FrameResults = Record<number, Detection[]>; //number: frameId

export type Results = Record<number, FrameResults>; //number : sentenceId

export interface GeneralData {
    allFrames: number[];
    allSentences: string[];
    results: Results;
}

import {
	type PayloadAction,
	createAsyncThunk,
	createSlice,
} from "@reduxjs/toolkit";

interface FrameCache {
	[timestamp: number]: string; // Maps timestamps to base64 frame data
}

interface VideoFrameState {
	videoSrc: string | null; // Store video source globally
	cache: FrameCache;
}

const initialState: VideoFrameState = {
	videoSrc: null,
	cache: {},
};

export const setVideoSource = createAsyncThunk(
	"videoFrame/setVideoSource",
	async (videoSrc: string) => {
		return videoSrc;
	},
);

export const fetchFrame = createAsyncThunk(
	"videoFrame/fetchFrame",
	async (timestamp: number, { getState }) => {
		const state = getState() as { videoFrame: VideoFrameState };
		const videoSrc = state.videoFrame.videoSrc;

		if (!videoSrc) {
			throw new Error("Video source not set!");
		}

		if (state.videoFrame.cache[timestamp]) {
			return { timestamp, frameData: state.videoFrame.cache[timestamp] };
		}

		return new Promise<{ timestamp: number; frameData: string }>(
			(resolve, reject) => {
				const video = document.createElement("video");
				video.crossOrigin = "anonymous";
				video.src = videoSrc;
				video.load();

				video.onloadeddata = () => {
					video.currentTime = timestamp;
				};

				video.onseeked = () => {
					const canvas = document.createElement("canvas");
					const ctx = canvas.getContext("2d");
					if (!ctx) return reject("Canvas not supported");

					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;
					ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

					const frameData = canvas.toDataURL("image/png");
					resolve({ timestamp, frameData });
				};

				video.onerror = (err) => reject(err);
			},
		);
	},
);

export const videoFrameSlice = createSlice({
	name: "videoFrame",
	initialState,
	reducers: {
		clearCache: (state) => {
			state.cache = {}; // Clear all cached frames
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(
				setVideoSource.fulfilled,
				(state, action: PayloadAction<string>) => {
					state.videoSrc = action.payload;
					state.cache = {};
				},
			)
			.addCase(
				fetchFrame.fulfilled,
				(
					state,
					action: PayloadAction<{ timestamp: number; frameData: string }>,
				) => {
					state.cache[action.payload.timestamp] = action.payload.frameData;
				},
			);
	},
});

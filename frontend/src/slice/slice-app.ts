import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "../types/AppState";

const initialState: AppState = {
	userInputs: {
		video: null,
		text: "",
	},
};

export const sliceApp = createSlice({
	name: "sliceApp",
	initialState,
	reducers: {
		setUserInputs: (state, action) => {
			state.userInputs = action.payload;
		},
	},
});

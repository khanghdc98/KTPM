import { createSlice } from "@reduxjs/toolkit";
import type { AppState } from "../types/AppState";

const initialState: AppState = {
	userInputs: {
		video: null,
		text: "",
	},
	loadingPopUpMessage: "",
};

export const sliceApp = createSlice({
	name: "sliceApp",
	initialState,
	reducers: {
		setUserInputs: (state, action) => {
			state.userInputs = action.payload;
		},
		setLoadingPopUp: (state, action) => {
			state.loadingPopUpMessage = action.payload;
		},
	},
});

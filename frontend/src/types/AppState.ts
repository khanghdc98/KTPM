export type AppState = {
	userInputs: {
		video: {
			name: string;
			type: string;
			size: number;
			url: string;
		} | null;
		text: string;
	};
	loadingPopUpMessage: string;
};

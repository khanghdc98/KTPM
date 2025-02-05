export type AppState = {
	userInputs: {
		video: {
			name: string;
			type: string;
			size: number;
			base64: string;
		} | null;
		text: string;
	};
};

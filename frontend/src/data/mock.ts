import { GeneralData } from "../types/ResultType";

export const mockData: GeneralData = {
	allFrames: [1, 10, 12],
	allSentences: [
		"this is a cat biting a dog",
		"this is a cat and a dog",
	],
	results: {
		0: {
			1: [
				{
					tokenId: "a cat",
					bbox: [0, 0, 10, 10],
				},
				{
					tokenId: "a dog",
					bbox: [10, 10, 20, 20],
				},
			],
			10: [
				{
					tokenId: "a cat",
					bbox: [0, 0, 10, 10],
				},
				{
					tokenId: "a dog",
					bbox: [10, 10, 20, 20],
				},
			],
			12: [
				{
					tokenId: "a cat",
					bbox: [0, 0, 10, 10],
				},
				{
					tokenId: "a dog",
					bbox: [10, 10, 20, 20],
				},
			],
		},
		1: {
			10: [
				{
					tokenId: "a cat",
					bbox: [0, 0, 10, 10],
				},
				{
					tokenId: "a dog",
					bbox: [10, 10, 20, 20],
				},
			],
			12: [
				{
					tokenId: "a cat",
					bbox: [0, 0, 10, 10],
				},
				{
					tokenId: "a dog",
					bbox: [10, 10, 20, 20],
				},
			],
		},
	},
};

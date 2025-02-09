import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithRetry } from ".";
import { GeneralData } from "../types/ResultType";

export const alignApi = createApi({
	reducerPath: "alignApi",
	baseQuery: baseQueryWithRetry,
	tagTypes: ["alignment"],
	endpoints(builder) {
		return {
			alignVideoText: builder.mutation<
				GeneralData,
				{ text: string; video: File }
			>({
				query: ({ text, video }) => {
					const formData = new FormData();
					formData.append("text", text);
					formData.append("video", video);

					return {
						url: "/align_video",
						method: "POST",
						body: formData,
					};
				},
				invalidatesTags: ["alignment"],
			}),
		};
	},
});

export const { useAlignVideoTextMutation } =
	alignApi;

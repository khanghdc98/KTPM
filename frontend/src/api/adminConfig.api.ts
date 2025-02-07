import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithRetry } from ".";

export const alignApi = createApi({
	reducerPath: "alignApi",
	baseQuery: baseQueryWithRetry,
	tagTypes: ["alignment"],
	endpoints(builder) {
		return {
			updateOneAdminConfig: builder.mutation<unknown, AdminConfig>({
				query: (adminConfig) => {
					if (adminConfig.id === undefined) {
						throw new Error("AdminConfig ID is required to update");
					}
					return {
						url: "/admin/config",
						method: "POST",
						body: adminConfig,
					};
				},
				invalidatesTags: (result, error, args) => [
					{ type: "AdminConfig", id: args.id },
				],
			}),
			addOneAdminConfig: builder.mutation<unknown, AdminConfig>({
				query: (adminConfig) => {
					return {
						url: "/admin/config",
						method: "POST",
						body: adminConfig,
					};
				},
				invalidatesTags: [{ type: "AdminConfig", id: "LIST" }],
			}),
		};
	},
});

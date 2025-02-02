import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithRetry } from ".";

export const adminConfigApi = createApi({
	reducerPath: "adminConfigApi",
	baseQuery: baseQueryWithRetry,
	tagTypes: [""],
	endpoints(builder) {
		return {
			getAdminConfigPaginations: builder.query<
				CollectionResponse<AdminConfig>,
				GetAdminConfigParams
			>({
				query: (params) => {
					const url = "/admin/config";
					return {
						url: url,
						method: "GET",
					};
				},
				transformResponse: (response: AdminConfig[]) => {
					const message = "Fetch config successfully";
					const status = 200;
					const data = response;
					const collectionMetadata = {
						total: response.length,
						totalPage: 1,
					};
					return {
						message,
						status,
						data,
						collectionMetadata,
					};
				},
				providesTags: (result) =>
					result
						? [
								...result.data.map(({ id }) => ({
									type: "AdminConfig" as const,
									id,
								})),
								{ type: "AdminConfig", id: "LIST" },
							]
						: [{ type: "AdminConfig", id: "LIST" }],
			}),
			updateOneAdminConfig: builder.mutation<unknown, AdminConfig>({
				query: (adminConfig) => {
					if (adminConfig.id === undefined) {
						throw new Error("AdminConfig ID is required to update");
					}
					return {
						url: "/admin/config",
						method: "PUT",
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

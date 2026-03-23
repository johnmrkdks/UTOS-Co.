import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

interface GetUsersParams {
	role?: "user" | "driver" | "admin" | "super_admin";
	roleFilter?: "clients" | "admins";
	limit?: number;
	offset?: number;
	enabled?: boolean;
}

export const useGetUsersQuery = (params: GetUsersParams = {}) => {
	const { enabled = true, ...queryParams } = params;
	return useQuery({
		...trpc.admin.listUsers.queryOptions(queryParams),
		enabled,
	});
};

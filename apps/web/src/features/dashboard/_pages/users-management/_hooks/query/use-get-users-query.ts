import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

interface GetUsersParams {
	role?: "user" | "driver" | "admin" | "super_admin";
	roleFilter?: "clients" | "admins";
	limit?: number;
	offset?: number;
}

export const useGetUsersQuery = (params: GetUsersParams = {}) => {
	return useQuery(trpc.admin.listUsers.queryOptions(params));
};

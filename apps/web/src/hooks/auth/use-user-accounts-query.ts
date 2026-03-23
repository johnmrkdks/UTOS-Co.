import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useUserAccountsQuery = () => {
	return useQuery((trpc as any).auth.getUserAccounts.queryOptions());
};
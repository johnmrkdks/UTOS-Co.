import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useUserAccountsQuery = () => {
	return useQuery((trpc as any).auth.getUserAccounts.queryOptions());
};

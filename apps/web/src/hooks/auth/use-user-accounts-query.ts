import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useUserAccountsQuery = () => {
	return useQuery(trpc.auth.getUserAccounts.queryOptions());
};
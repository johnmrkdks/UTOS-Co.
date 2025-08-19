import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export function useGetPackageCategoriesQuery() {
	return useQuery(trpc.packageCategories.list.queryOptions());
}

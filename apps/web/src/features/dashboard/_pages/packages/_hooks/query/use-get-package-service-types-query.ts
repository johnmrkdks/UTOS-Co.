import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export function useGetPackageServiceTypesQuery() {
	return useQuery(trpc.packageServiceTypes.list.queryOptions({}));
}
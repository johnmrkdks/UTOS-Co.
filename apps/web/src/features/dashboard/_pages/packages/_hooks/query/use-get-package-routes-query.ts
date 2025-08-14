import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

interface GetPackageRoutesParams {
	packageId: string;
}

export function useGetPackageRoutesQuery(params: GetPackageRoutesParams) {
	return useQuery(
		trpc.packageRoutes.getByPackageId.queryOptions(params)
	);
}

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

export function useGetPackageRoutesQuery(packageId: string) {
	return useQuery({
		queryKey: ["package-routes", packageId],
		queryFn: async () => {
			return await trpc.packageRoutes.getByPackageId.query({ packageId });
		},
		enabled: !!packageId,
	});
}
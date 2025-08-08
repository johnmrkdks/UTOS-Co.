import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

export function useGetPackageCategoriesQuery() {
	return useQuery({
		queryKey: ["package-categories"],
		queryFn: async () => {
			return await trpc.packageCategories.getAll.query();
		},
	});
}
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetCarBrandsWithModelQuery = () => {
	return useQuery(trpc.carBrands.listWithModels.queryOptions({}));
};

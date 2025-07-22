import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetCarBrandsWithModelQuery = () => {
	return useQuery(trpc.carsBrands.listWithModels.queryOptions({}));
};

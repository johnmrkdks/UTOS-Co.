import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetCarBrandsWithEnrichedDataQuery = () => {
	return useQuery(trpc.carBrands.listWithEnrichedData.queryOptions({}));
};

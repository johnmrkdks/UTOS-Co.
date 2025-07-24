import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetCarModelsWithEnrichedDataQuery = () => {
	return useQuery(trpc.carModels.listWithEnrichedData.queryOptions({}));
};

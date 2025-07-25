import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetCarModelsWithBrandQuery = () => {
	return useQuery(trpc.carModels.listWithBrand.queryOptions({}));
};

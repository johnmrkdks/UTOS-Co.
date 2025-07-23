import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetCarModelsQuery = () => {
	return useQuery(trpc.carModels.list.queryOptions({}));
};

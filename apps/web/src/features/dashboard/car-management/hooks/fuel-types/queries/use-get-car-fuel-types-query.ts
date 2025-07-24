import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetCarFuelTypesQuery = () => {
	return useQuery(trpc.carFuelTypes.list.queryOptions({}));
};

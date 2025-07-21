import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetCarBrandsQuery = () => {
	return useQuery(trpc.carsBrands.list.queryOptions({}));
};

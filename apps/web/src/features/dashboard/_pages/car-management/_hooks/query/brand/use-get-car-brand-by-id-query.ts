import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { GetCarBrandByIdParams } from "server/types";

export const useGetCarBrandByIdQuery = (params: GetCarBrandByIdParams) => {
	return useQuery(trpc.carBrands.get.queryOptions(params));
};

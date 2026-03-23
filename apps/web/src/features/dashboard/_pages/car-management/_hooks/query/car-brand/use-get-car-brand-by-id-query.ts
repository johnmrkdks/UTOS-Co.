import { useQuery } from "@tanstack/react-query";
import type { GetCarBrandByIdParams } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarBrandByIdQuery = (params: GetCarBrandByIdParams) => {
	return useQuery(trpc.carBrands.get.queryOptions(params));
};

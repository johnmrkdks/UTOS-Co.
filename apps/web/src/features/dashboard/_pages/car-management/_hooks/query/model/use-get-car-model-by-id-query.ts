import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { GetCarModelByIdParams } from "server/types";

export const useGetCarModelByIdQuery = (params: GetCarModelByIdParams) => {
	return useQuery(trpc.carModels.get.queryOptions(params));
};

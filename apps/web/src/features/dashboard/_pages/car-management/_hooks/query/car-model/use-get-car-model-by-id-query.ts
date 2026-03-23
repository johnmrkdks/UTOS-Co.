import { useQuery } from "@tanstack/react-query";
import type { GetCarModelByIdParams } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarModelByIdQuery = (params: GetCarModelByIdParams) => {
	return useQuery(trpc.carModels.get.queryOptions(params));
};

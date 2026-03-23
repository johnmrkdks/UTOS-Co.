import { useQuery } from "@tanstack/react-query";
import type { GetCarFeatureByIdParams } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarFeatureByIdQuery = (params: GetCarFeatureByIdParams) => {
	return useQuery(trpc.carFeatures.get.queryOptions(params));
};

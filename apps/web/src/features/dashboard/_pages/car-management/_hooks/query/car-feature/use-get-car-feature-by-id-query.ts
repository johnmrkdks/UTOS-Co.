
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { GetCarFeatureByIdParams } from "server/types";

export const useGetCarFeatureByIdQuery = (params: GetCarFeatureByIdParams) => {
	return useQuery(trpc.carFeatures.get.queryOptions(params));
};


import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { GetCarConditionTypeByIdParams } from "server/types";

export const useGetCarConditionTypeByIdQuery = (params: GetCarConditionTypeByIdParams) => {
	return useQuery(trpc.carConditionTypes.get.queryOptions(params));
};

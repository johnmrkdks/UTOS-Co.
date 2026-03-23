import { useQuery } from "@tanstack/react-query";
import type { GetCarConditionTypeByIdParams } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarConditionTypeByIdQuery = (
	params: GetCarConditionTypeByIdParams,
) => {
	return useQuery(trpc.carConditionTypes.get.queryOptions(params));
};

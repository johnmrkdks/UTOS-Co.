import { useQuery } from "@tanstack/react-query";
import type { GetCarBodyTypeByIdParams } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarBodyTypeByIdQuery = (
	params: GetCarBodyTypeByIdParams,
) => {
	return useQuery(trpc.carBodyTypes.get.queryOptions(params));
};

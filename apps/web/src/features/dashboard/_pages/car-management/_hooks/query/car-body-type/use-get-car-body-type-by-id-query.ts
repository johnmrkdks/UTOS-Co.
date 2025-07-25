
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { GetCarBodyTypeByIdParams } from "server/types";

export const useGetCarBodyTypeByIdQuery = (params: GetCarBodyTypeByIdParams) => {
	return useQuery(trpc.carBodyTypes.get.queryOptions(params));
};

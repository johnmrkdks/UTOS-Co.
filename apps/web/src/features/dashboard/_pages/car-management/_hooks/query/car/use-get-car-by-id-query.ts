import { useQuery } from "@tanstack/react-query";
import type { GetCarByIdParams } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarByIdQuery = (params: GetCarByIdParams) => {
	return useQuery(trpc.cars.get.queryOptions(params));
};

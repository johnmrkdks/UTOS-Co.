import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { GetCarFuelTypeByIdParams } from "server/types";

export const useGetCarFuelTypeByIdQuery = (params: GetCarFuelTypeByIdParams) => {
	return useQuery(trpc.carFuelTypes.get.queryOptions(params));
};

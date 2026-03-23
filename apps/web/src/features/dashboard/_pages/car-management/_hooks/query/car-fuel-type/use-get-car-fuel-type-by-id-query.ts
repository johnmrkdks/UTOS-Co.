import { useQuery } from "@tanstack/react-query";
import type { GetCarFuelTypeByIdParams } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarFuelTypeByIdQuery = (
	params: GetCarFuelTypeByIdParams,
) => {
	return useQuery(trpc.carFuelTypes.get.queryOptions(params));
};

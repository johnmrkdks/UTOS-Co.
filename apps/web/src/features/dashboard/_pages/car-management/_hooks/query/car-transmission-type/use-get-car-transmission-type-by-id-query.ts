
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { GetCarTransmissionTypeByIdParams } from "server/types";

export const useGetCarTransmissionTypeByIdQuery = (params: GetCarTransmissionTypeByIdParams) => {
	return useQuery(trpc.carTransmissionTypes.get.queryOptions(params));
};

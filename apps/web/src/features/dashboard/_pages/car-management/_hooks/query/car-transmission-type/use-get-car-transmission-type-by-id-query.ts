import { useQuery } from "@tanstack/react-query";
import type { GetCarTransmissionTypeByIdParams } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarTransmissionTypeByIdQuery = (
	params: GetCarTransmissionTypeByIdParams,
) => {
	return useQuery(trpc.carTransmissionTypes.get.queryOptions(params));
};

import { useQuery } from "@tanstack/react-query";
import type { GetCarDriveTypeByIdParams } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarDriveTypeByIdQuery = (
	params: GetCarDriveTypeByIdParams,
) => {
	return useQuery(trpc.carDriveTypes.get.queryOptions(params));
};

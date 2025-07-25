
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { GetCarDriveTypeByIdParams } from "server/types";

export const useGetCarDriveTypeByIdQuery = (params: GetCarDriveTypeByIdParams) => {
	return useQuery(trpc.carDriveTypes.get.queryOptions(params));
};

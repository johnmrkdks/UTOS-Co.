import { useQuery } from "@tanstack/react-query";
import type { GetCarImageByIdParams } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarImageByIdQuery = (params: GetCarImageByIdParams) => {
	return useQuery(trpc.carImages.get.queryOptions(params));
};

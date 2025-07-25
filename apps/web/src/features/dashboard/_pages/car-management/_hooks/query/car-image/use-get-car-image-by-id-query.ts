
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { GetCarImageByIdParams } from "server/types";

export const useGetCarImageByIdQuery = (params: GetCarImageByIdParams) => {
	return useQuery(trpc.carImages.get.queryOptions(params));
};

import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetPublishedCarByIdQuery = (id: string) => {
	return useQuery(trpc.cars.getPublished.queryOptions({ id }));
};
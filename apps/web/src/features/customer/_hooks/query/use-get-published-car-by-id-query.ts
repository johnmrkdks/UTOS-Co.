import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useGetPublishedCarByIdQuery = (id: string) => {
	return useQuery(trpc.cars.getPublished.queryOptions({ id }));
};

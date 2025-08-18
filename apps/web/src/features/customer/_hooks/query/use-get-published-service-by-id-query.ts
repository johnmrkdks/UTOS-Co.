import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetPublishedServiceByIdQuery = (id: string) => {
	return useQuery(trpc.packages.getPublished.queryOptions({ id }));
};
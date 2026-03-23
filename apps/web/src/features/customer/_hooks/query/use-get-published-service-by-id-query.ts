import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useGetPublishedServiceByIdQuery = (id: string) => {
	return useQuery(trpc.packages.getPublished.queryOptions({ id }));
};

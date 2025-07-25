
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const useGetCarImagesQuery = (options: ResourceListSchema) => {
	return useQuery(trpc.carImages.list.queryOptions(options));
};

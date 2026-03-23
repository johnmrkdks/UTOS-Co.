import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useCheckCarBodyTypeUsageQuery = (
	options: CheckCarBodyTypeUsageServiceSchema,
) => {
	return useQuery(trpc.carBodyTypes.checkUsage.queryOptions(options));
};

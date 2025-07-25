
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useCheckCarBodyTypeUsageQuery = (options: CheckCarBodyTypeUsageServiceSchema) => {
	return useQuery(trpc.carBodyTypes.checkUsage.queryOptions(options));
};

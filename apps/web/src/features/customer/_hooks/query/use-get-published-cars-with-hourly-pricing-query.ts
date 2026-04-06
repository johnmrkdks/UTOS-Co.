import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useGetPublishedCarsWithHourlyPricingQuery = () => {
	return useQuery(trpc.cars.listPublishedWithHourlyPricing.queryOptions());
};

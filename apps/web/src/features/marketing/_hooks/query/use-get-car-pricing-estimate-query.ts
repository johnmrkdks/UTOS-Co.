import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

interface GetCarPricingEstimateParams {
	carId: string;
}

export const useGetCarPricingEstimateQuery = (params: GetCarPricingEstimateParams) => {
	return useQuery(
		trpc.cars.getPricingEstimate.queryOptions(params)
	);
};
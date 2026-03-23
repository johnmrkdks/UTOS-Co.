import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

interface GetCarPricingEstimateParams {
	carId: string;
}

export const useGetCarPricingEstimateQuery = (
	params: GetCarPricingEstimateParams,
) => {
	return useQuery(trpc.cars.getPricingEstimate.queryOptions(params));
};

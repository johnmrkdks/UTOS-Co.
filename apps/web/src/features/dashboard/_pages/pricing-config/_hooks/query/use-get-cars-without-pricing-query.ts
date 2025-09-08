import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { useGetCarsQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car/use-get-cars-query";
import { useGetPricingConfigsQuery } from "./use-get-pricing-configs-query";

export const useGetCarsWithoutPricingQuery = () => {
	// Get all cars
	const { data: allCars, isLoading: carsLoading, error: carsError } = useGetCarsQuery({});
	
	// Get all pricing configs
	const { data: pricingConfigs, isLoading: pricingLoading, error: pricingError } = useGetPricingConfigsQuery({});

	// Combine the data to filter out cars that already have pricing configs
	return useQuery({
		queryKey: ['cars-without-pricing'],
		queryFn: () => {
			if (!allCars?.data || !pricingConfigs?.data) {
				return [];
			}

			// Get array of car IDs that already have pricing configs
			const carsWithPricingIds = new Set(
				pricingConfigs.data
					.map(config => config.carId)
					.filter(Boolean) // Remove null values (global configs)
			);

			// Filter out cars that already have pricing configs
			const availableCars = allCars.data.filter(car => 
				!carsWithPricingIds.has(car.id)
			);

			return availableCars;
		},
		enabled: !!allCars?.data && !!pricingConfigs?.data,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};
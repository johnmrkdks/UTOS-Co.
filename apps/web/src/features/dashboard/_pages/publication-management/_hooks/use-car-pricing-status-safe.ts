import { useGetPricingConfigsQuery } from "@/features/dashboard/_pages/pricing-config/_hooks/query/use-get-pricing-configs-query";
import { useMemo } from "react";

export function useCarPricingStatusSafe() {
	const { data: pricingConfigsData, isLoading, isError } = useGetPricingConfigsQuery({
		// Use same query params as other components to prevent conflicts
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	const pricingConfigMap = useMemo(() => {
		// Early return if loading or error to prevent issues
		if (isLoading || isError || !pricingConfigsData?.data) {
			return new Map<string, any>();
		}
		
		try {
			// Safe filtering and mapping
			const validConfigs = (pricingConfigsData.data || [])
				.filter((config: any) => config && config.carId)
				.slice(0, 100); // Additional safety limit
			
			return new Map(
				validConfigs.map((config: any) => [config.carId, config])
			);
		} catch (error) {
			console.warn('Error processing pricing config data:', error);
			return new Map<string, any>();
		}
	}, [pricingConfigsData, isLoading, isError]);

	const hasCarPricingConfig = (carId: string): boolean => {
		// Safety checks
		if (!carId || typeof carId !== 'string' || isLoading || isError) {
			return false;
		}
		
		try {
			return pricingConfigMap.has(carId);
		} catch (error) {
			console.warn('Error checking pricing config for car:', carId, error);
			return false;
		}
	};

	const getCarPricingConfig = (carId: string): any | null => {
		// Safety checks
		if (!carId || typeof carId !== 'string' || isLoading || isError) {
			return null;
		}
		
		try {
			return pricingConfigMap.get(carId) || null;
		} catch (error) {
			console.warn('Error getting pricing config for car:', carId, error);
			return null;
		}
	};

	return { 
		hasCarPricingConfig, 
		getCarPricingConfig,
		isLoading, 
		isError,
		configCount: pricingConfigMap.size
	};
}
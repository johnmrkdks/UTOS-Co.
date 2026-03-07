import { useGetPricingConfigsQuery } from "@/features/dashboard/_pages/pricing-config/_hooks/query/use-get-pricing-configs-query";
import { useMemo } from "react";

export function useCarPricingStatusSafe() {
	const { data: pricingConfigsData, isLoading, isError } = useGetPricingConfigsQuery({
		// Use same query params as other components to prevent conflicts
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	const { pricingConfigMap, hasGlobalConfig } = useMemo(() => {
		// Early return if loading or error to prevent issues
		if (isLoading || isError || !pricingConfigsData?.data) {
			return { pricingConfigMap: new Map<string, any>(), hasGlobalConfig: false };
		}
		
		try {
			const configs = (pricingConfigsData.data || []).filter((c: any) => c);
			const carSpecificMap = new Map(
				configs
					.filter((config: any) => config.carId)
					.slice(0, 100)
					.map((config: any) => [config.carId, config])
			);
			const hasGlobal = configs.some((c: any) => !c.carId);
			return { pricingConfigMap: carSpecificMap, hasGlobalConfig: hasGlobal };
		} catch (error) {
			console.warn('Error processing pricing config data:', error);
			return { pricingConfigMap: new Map<string, any>(), hasGlobalConfig: false };
		}
	}, [pricingConfigsData, isLoading, isError]);

	const hasCarPricingConfig = (carId: string): boolean => {
		// Safety checks
		if (!carId || typeof carId !== 'string' || isLoading || isError) {
			return false;
		}
		
		try {
			// Car has pricing if: car-specific config exists OR global config exists
			return pricingConfigMap.has(carId) || hasGlobalConfig;
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
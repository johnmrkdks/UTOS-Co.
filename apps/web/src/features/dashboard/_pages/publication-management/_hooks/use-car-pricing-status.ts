import { useGetPricingConfigsQuery } from "@/features/dashboard/_pages/pricing-config/_hooks/query/use-get-pricing-configs-query";
import { useMemo } from "react";

export function useCarPricingStatus() {
	const { data: pricingConfigsData, isLoading } = useGetPricingConfigsQuery({
		limit: 100, // Reduced limit to prevent performance issues
	});

	const pricingConfigMap = useMemo(() => {
		if (!pricingConfigsData?.data || isLoading) return new Map<string, boolean>();
		
		// Filter out configs without carId to prevent issues
		const validConfigs = pricingConfigsData.data.filter((config: any) => config.carId);
		
		return new Map(
			validConfigs.map((config: any) => [config.carId, true])
		);
	}, [pricingConfigsData, isLoading]);

	const hasCarPricingConfig = (carId: string): boolean => {
		if (!carId || isLoading) return false;
		return pricingConfigMap.has(carId);
	};

	return { hasCarPricingConfig, isLoading };
}
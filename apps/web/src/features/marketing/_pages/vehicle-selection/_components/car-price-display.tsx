import { useGetCarPricingEstimateQuery } from "@/features/marketing/_hooks/query/use-get-car-pricing-estimate-query";

interface CarPriceDisplayProps {
	carId: string;
	className?: string;
	variant?: "card" | "summary"; // card for main display, summary for bottom bar
}

export function CarPriceDisplay({ carId, className, variant = "card" }: CarPriceDisplayProps) {
	const { data: pricing, isLoading } = useGetCarPricingEstimateQuery({ carId });

	if (isLoading) {
		return (
			<div className={className}>
				<div className="text-sm text-muted-foreground animate-pulse">
					Loading...
				</div>
			</div>
		);
	}

	if (!pricing || !pricing?.hasActivePricing) {
		return (
			<div className={className}>
				{variant === "card" ? (
					<>
						<div className="text-sm sm:text-lg lg:text-xl font-bold text-primary">
							Contact for Price
						</div>
						<div className="text-xs text-muted-foreground hidden sm:block">custom quote</div>
					</>
				) : (
					<span className="text-sm text-muted-foreground">Contact for pricing</span>
				)}
			</div>
		);
	}

	if (variant === "summary") {
		const additionalKmRate = pricing?.additionalKmRate || 0;
		return (
			<div className={className}>
				<span>From ${pricing?.firstKmRate || 0}{additionalKmRate > 0 ? ` + $${additionalKmRate}/km` : ''}</span>
			</div>
		);
	}

	const additionalKmRate = pricing?.additionalKmRate || 0;
	return (
		<div className={className}>
			<div className="text-2xl font-bold text-primary">
				${pricing?.firstKmRate || 0}
			</div>
			<div className="text-sm text-gray-600">
				first {pricing?.firstKmLimit || 10}km
			</div>
		</div>
	);
}
import { useGetCarPricingEstimateQuery } from "@/features/marketing/_hooks/query/use-get-car-pricing-estimate-query";

interface CarPriceDisplayProps {
	carId: string;
	className?: string;
	variant?: "card" | "summary"; // card for main display, summary for bottom bar
}

export function CarPriceDisplay({
	carId,
	className,
	variant = "card",
}: CarPriceDisplayProps) {
	const { data: pricing, isLoading } = useGetCarPricingEstimateQuery({ carId });

	if (isLoading) {
		return (
			<div className={className}>
				<div className="animate-pulse text-muted-foreground text-sm">
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
						<div className="font-bold text-primary text-sm sm:text-lg lg:text-xl">
							Contact for Price
						</div>
						<div className="hidden text-muted-foreground text-xs sm:block">
							custom quote
						</div>
					</>
				) : (
					<span className="text-muted-foreground text-sm">
						Contact for pricing
					</span>
				)}
			</div>
		);
	}

	if (variant === "summary") {
		const additionalKmRate = pricing?.additionalKmRate || 0;
		return (
			<div className={className}>
				<span>
					From ${pricing?.firstKmRate || 0}
					{additionalKmRate > 0 ? ` + $${additionalKmRate}/km` : ""}
				</span>
			</div>
		);
	}

	const additionalKmRate = pricing?.additionalKmRate || 0;
	return (
		<div className={className}>
			<div className="font-bold text-2xl text-primary">
				${pricing?.firstKmRate || 0}
			</div>
			<div className="text-gray-600 text-sm">
				first {pricing?.firstKmLimit || 10}km
			</div>
		</div>
	);
}

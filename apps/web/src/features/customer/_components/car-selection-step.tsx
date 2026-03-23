import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	Calculator,
	Car,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGetAvailableCarsQuery } from "@/features/customer/_hooks/query/use-get-available-cars-query";
import { useCalculateCarSpecificQuoteMutation } from "../_hooks/query/use-calculate-car-specific-quote-mutation";
import type { QuoteResult, RouteData } from "../_types/instant-quote";

interface CarSelectionStepProps {
	selectedCarId?: string;
	onCarSelect: (carId: string) => void;
	onBack: () => void;
	onNext: () => void;
	// Price comparison from instant quote
	instantQuote?: QuoteResult;
	routeData?: RouteData;
}

export function CarSelectionStep({
	selectedCarId,
	onCarSelect,
	onBack,
	onNext,
	instantQuote,
	routeData,
}: CarSelectionStepProps) {
	const { data: carsData, isLoading, error } = useGetAvailableCarsQuery();
	const cars = carsData?.data;
	const calculateCarQuoteMutation = useCalculateCarSpecificQuoteMutation();
	const [carPrices, setCarPrices] = useState<Record<string, number>>({});
	const loadedPricesRef = useRef<Set<string>>(new Set());

	// Calculate prices for each car when route data is available
	useEffect(() => {
		if (cars && routeData) {
			cars.forEach(async (car) => {
				// Skip if we already calculated a price for this car
				if (loadedPricesRef.current.has(car.id)) return;

				// Mark as loading to prevent duplicate requests
				loadedPricesRef.current.add(car.id);

				try {
					const quote = await calculateCarQuoteMutation.mutateAsync({
						carId: car.id,
						originAddress: routeData.originAddress,
						destinationAddress: routeData.destinationAddress,
						originLatitude: routeData.originLatitude,
						originLongitude: routeData.originLongitude,
						destinationLatitude: routeData.destinationLatitude,
						destinationLongitude: routeData.destinationLongitude,
						stops: routeData.stops,
					});
					if (quote?.totalAmount) {
						setCarPrices((prev) => ({
							...prev,
							[car.id]: quote.totalAmount,
						}));
					}
				} catch (error) {
					console.error(`Failed to calculate price for car ${car.id}:`, error);
					// Remove from loaded set on error so it can retry
					loadedPricesRef.current.delete(car.id);
				}
			});
		}
	}, [cars, routeData]);

	const formatPrice = (price: number) => `$${(price / 100).toFixed(2)}`;

	const getPriceComparison = (carPrice: number) => {
		if (!instantQuote) return null;

		const difference = carPrice - instantQuote.totalAmount;
		const percentChange = Math.abs(
			(difference / instantQuote.totalAmount) * 100,
		);

		if (Math.abs(difference) < 50) return null; // Ignore small differences

		return {
			difference,
			percentChange: Math.round(percentChange),
			isHigher: difference > 0,
		};
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Car className="h-5 w-5" />
						Select Your Vehicle
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-24 w-full" />
					))}
				</CardContent>
			</Card>
		);
	}

	if (error || !cars?.length) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Car className="h-5 w-5" />
						Select Your Vehicle
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							{error
								? "Failed to load available cars."
								: "No cars available at the moment."}
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Car className="h-5 w-5" />
					Select Your Vehicle
				</CardTitle>
				<CardDescription>
					Choose the perfect car for your journey
					{instantQuote && (
						<span className="mt-1 block text-xs">
							<Calculator className="mr-1 inline h-3 w-3" />
							Prices updated for your specific route
						</span>
					)}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Show instant quote reference if available */}
				{instantQuote && (
					<div className="rounded-lg border bg-muted/50 p-3">
						<div className="flex items-center gap-2 text-sm">
							<Calculator className="h-4 w-4 text-muted-foreground" />
							<span className="font-medium">
								Your instant quote: {formatPrice(instantQuote.totalAmount)}
							</span>
						</div>
						<p className="mt-1 text-muted-foreground text-xs">
							Prices below are calculated with each car's specific base fare
						</p>
					</div>
				)}

				<div className="grid gap-3">
					{cars.map((car) => {
						const carPrice = carPrices[car.id];
						const priceComparison = carPrice
							? getPriceComparison(carPrice)
							: null;

						return (
							<div
								key={car.id}
								onClick={() => onCarSelect(car.id)}
								className={`cursor-pointer rounded-lg border p-4 transition-all ${
									selectedCarId === car.id
										? "border-primary bg-primary/5"
										: "border-border hover:border-primary/50"
								}`}
							>
								<div className="flex items-center gap-4">
									{car.imageUrl && (
										<img
											src={car.imageUrl}
											alt={`${car.brandName} ${car.modelName}`}
											className="h-12 w-16 rounded object-cover"
										/>
									)}
									<div className="flex-1">
										<div className="flex items-center justify-between gap-2">
											<div className="flex items-center gap-2">
												<h3 className="font-semibold">
													{car.brandName} {car.modelName}
												</h3>
												{selectedCarId === car.id && (
													<Badge variant="default" className="text-xs">
														Selected
													</Badge>
												)}
											</div>

											{/* Price Display */}
											<div className="text-right">
												{carPrice ? (
													<div className="space-y-1">
														<div className="font-semibold text-primary">
															{formatPrice(carPrice)}
														</div>
														{priceComparison && (
															<div
																className={`flex items-center gap-1 text-xs ${
																	priceComparison.isHigher
																		? "text-red-600"
																		: "text-green-600"
																}`}
															>
																{priceComparison.isHigher ? (
																	<TrendingUp className="h-3 w-3" />
																) : (
																	<TrendingDown className="h-3 w-3" />
																)}
																<span>
																	{priceComparison.isHigher ? "+" : "-"}
																	{formatPrice(
																		Math.abs(priceComparison.difference),
																	)}
																	{priceComparison.percentChange > 5 &&
																		` (${priceComparison.percentChange}%)`}
																</span>
															</div>
														)}
														{instantQuote && !priceComparison && (
															<div className="text-muted-foreground text-xs">
																Same as quoted
															</div>
														)}
													</div>
												) : routeData ? (
													<div className="text-muted-foreground text-xs">
														Calculating...
													</div>
												) : null}
											</div>
										</div>

										<div className="mt-1 flex items-center gap-4 text-muted-foreground text-sm">
											<div className="flex items-center gap-1">
												<Users className="h-3 w-3" />
												<span>{car.passengerCapacity} seats</span>
											</div>
											<span>{car.categoryName}</span>
											<span>{car.engineType}</span>
										</div>

										{car.features && car.features.length > 0 && (
											<div className="mt-2 flex flex-wrap gap-1">
												{car.features.slice(0, 3).map((feature: any) => (
													<Badge
														key={feature.id}
														variant="secondary"
														className="text-xs"
													>
														{feature.name}
													</Badge>
												))}
												{car.features.length > 3 && (
													<Badge variant="secondary" className="text-xs">
														+{car.features.length - 3} more
													</Badge>
												)}
											</div>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Navigation Buttons */}
				<div className="flex justify-between pt-4">
					<Button variant="outline" onClick={onBack}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Button>
					<Button onClick={onNext} disabled={!selectedCarId}>
						Next
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

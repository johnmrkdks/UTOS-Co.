import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Car, Users, ArrowLeft, ArrowRight, AlertCircle, Calculator, TrendingUp, TrendingDown } from "lucide-react";
import { useGetAvailableCarsQuery } from "@/features/customer/_hooks/query/use-get-available-cars-query";
import { useCalculateCarSpecificQuoteMutation } from "../_hooks/query/use-calculate-car-specific-quote-mutation";
import { type QuoteResult, type RouteData } from "../_types/instant-quote";

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
	routeData
}: CarSelectionStepProps) {
	const { data: carsData, isLoading, error } = useGetAvailableCarsQuery();
	const cars = carsData?.data;
	const calculateCarQuoteMutation = useCalculateCarSpecificQuoteMutation();
	const [carPrices, setCarPrices] = useState<Record<string, number>>({});

	// Calculate prices for each car when route data is available
	useEffect(() => {
		if (cars && routeData && !calculateCarQuoteMutation.isPending) {
			cars.forEach(async (car) => {
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
					setCarPrices(prev => ({
						...prev,
						[car.id]: quote.totalAmount
					}));
				} catch (error) {
					console.error(`Failed to calculate price for car ${car.id}:`, error);
				}
			});
		}
	}, [cars, routeData, calculateCarQuoteMutation]);

	const formatPrice = (price: number) => `$${(price / 100).toFixed(2)}`;
	
	const getPriceComparison = (carPrice: number) => {
		if (!instantQuote) return null;
		
		const difference = carPrice - instantQuote.totalAmount;
		const percentChange = Math.abs((difference / instantQuote.totalAmount) * 100);
		
		if (Math.abs(difference) < 50) return null; // Ignore small differences
		
		return {
			difference,
			percentChange: Math.round(percentChange),
			isHigher: difference > 0
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
							{error ? "Failed to load available cars." : "No cars available at the moment."}
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
						<span className="block text-xs mt-1">
							<Calculator className="h-3 w-3 inline mr-1" />
							Prices updated for your specific route
						</span>
					)}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Show instant quote reference if available */}
				{instantQuote && (
					<div className="bg-muted/50 p-3 rounded-lg border">
						<div className="flex items-center gap-2 text-sm">
							<Calculator className="h-4 w-4 text-muted-foreground" />
							<span className="font-medium">Your instant quote: {formatPrice(instantQuote.totalAmount)}</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Prices below are calculated with each car's specific base fare
						</p>
					</div>
				)}

				<div className="grid gap-3">
					{cars.map((car) => {
						const carPrice = carPrices[car.id];
						const priceComparison = carPrice ? getPriceComparison(carPrice) : null;
						
						return (
							<div
								key={car.id}
								onClick={() => onCarSelect(car.id)}
								className={`border rounded-lg p-4 cursor-pointer transition-all ${
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
											className="w-16 h-12 object-cover rounded"
										/>
									)}
									<div className="flex-1">
										<div className="flex items-center gap-2 justify-between">
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
															<div className={`flex items-center gap-1 text-xs ${
																priceComparison.isHigher ? 'text-red-600' : 'text-green-600'
															}`}>
																{priceComparison.isHigher ? (
																	<TrendingUp className="h-3 w-3" />
																) : (
																	<TrendingDown className="h-3 w-3" />
																)}
																<span>
																	{priceComparison.isHigher ? '+' : '-'}
																	{formatPrice(Math.abs(priceComparison.difference))}
																	{priceComparison.percentChange > 5 && 
																		` (${priceComparison.percentChange}%)`
																	}
																</span>
															</div>
														)}
														{instantQuote && !priceComparison && (
															<div className="text-xs text-muted-foreground">
																Same as quoted
															</div>
														)}
													</div>
												) : routeData ? (
													<div className="text-xs text-muted-foreground">
														Calculating...
													</div>
												) : null}
											</div>
										</div>
										
										<div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
											<div className="flex items-center gap-1">
												<Users className="h-3 w-3" />
												<span>{car.passengerCapacity} seats</span>
											</div>
											<span>{car.categoryName}</span>
											<span>{car.engineType}</span>
										</div>
										
										{car.features && car.features.length > 0 && (
											<div className="flex flex-wrap gap-1 mt-2">
												{car.features.slice(0, 3).map((feature) => (
													<Badge key={feature.id} variant="secondary" className="text-xs">
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
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<Button 
						onClick={onNext} 
						disabled={!selectedCarId}
					>
						Next
						<ArrowRight className="h-4 w-4 ml-2" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
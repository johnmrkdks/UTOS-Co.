import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { 
	ArrowLeft, 
	Car, 
	Users, 
	MapPin, 
	Calculator,
	Loader2,
	CheckCircle
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { useCalculateInstantQuoteMutation } from "@/features/marketing/_pages/home/_hooks/query/use-calculate-instant-quote-mutation";
import { useGetPublishedCarsQuery } from "@/features/customer/_hooks/query/use-get-published-cars-query";

export function CalculateQuotePage() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/_marketing/calculate-quote" });
	const [isCalculating, setIsCalculating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	
	const calculateQuoteMutation = useCalculateInstantQuoteMutation();
	const { data: carsData } = useGetPublishedCarsQuery({ limit: 50 });

	const selectedCar = search.selectedCarId && carsData?.data ? 
		carsData.data.find(car => car.id === search.selectedCarId) : null;

	// Parse stops if provided
	const stops = search.stops ? (() => {
		try {
			return JSON.parse(search.stops);
		} catch (e) {
			console.warn("Failed to parse stops data:", e);
			return [];
		}
	})() : [];

	useEffect(() => {
		// Auto-start calculation when component mounts
		if (search.origin && search.destination && search.selectedCarId) {
			handleCalculateQuote();
		}
	}, [search]);

	const handleCalculateQuote = async () => {
		if (!search.origin || !search.destination || !search.selectedCarId) {
			setError("Missing required route information");
			return;
		}

		setIsCalculating(true);
		setError(null);

		try {
			// Extract coordinates from search params
			const originLat = search.originLat ? parseFloat(search.originLat) : undefined;
			const originLng = search.originLng ? parseFloat(search.originLng) : undefined;
			const destinationLat = search.destinationLat ? parseFloat(search.destinationLat) : undefined;
			const destinationLng = search.destinationLng ? parseFloat(search.destinationLng) : undefined;

			// Prepare stops data
			const stopsData = stops?.map((stop: any, index: number) => ({
				address: stop.address,
				latitude: undefined, // Will be resolved by Google Places if needed
				longitude: undefined,
			})) || [];

			const result = await calculateQuoteMutation.mutateAsync({
				originAddress: search.origin,
				destinationAddress: search.destination,
				carId: search.selectedCarId,
				originLatitude: originLat,
				originLongitude: originLng,
				destinationLatitude: destinationLat,
				destinationLongitude: destinationLng,
				stops: stopsData,
			});

			// Navigate to results page with secure quote ID
			if (result && (result as any).quoteId) {
				navigate({
					to: "/quote-results",
					search: { quoteId: (result as any).quoteId }
				});
			} else {
				throw new Error("Quote calculation succeeded but no secure quote ID was returned");
			}
		} catch (error: any) {
			console.error("Quote calculation failed:", error);
			setError(error.message || "Failed to calculate quote. Please try again.");
		} finally {
			setIsCalculating(false);
		}
	};

	const handleGoBack = () => {
		// Go back to vehicle selection with route data
		const params = new URLSearchParams();
		if (search.origin) params.set("origin", search.origin);
		if (search.destination) params.set("destination", search.destination);
		if (search.originLat) params.set("originLat", search.originLat);
		if (search.originLng) params.set("originLng", search.originLng);
		if (search.destinationLat) params.set("destinationLat", search.destinationLat);
		if (search.destinationLng) params.set("destinationLng", search.destinationLng);
		if (search.stops) params.set("stops", search.stops);

		navigate({ 
			to: "/select-vehicle", 
			search: Object.fromEntries(params) 
		});
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleGoBack}
								className="gap-2"
								disabled={isCalculating}
							>
								<ArrowLeft className="w-4 h-4" />
								Back to Vehicles
							</Button>
							<div className="hidden sm:block h-6 w-px bg-border" />
							<div className="hidden sm:block">
								<h1 className="text-lg font-semibold">Calculate Quote</h1>
								<p className="text-sm text-muted-foreground">Getting your fare estimate</p>
							</div>
						</div>

						{/* Mobile title */}
						<div className="sm:hidden">
							<h1 className="text-lg font-semibold">Calculate Quote</h1>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-6">
				<div className="max-w-2xl mx-auto space-y-6">
					{/* Route Summary */}
					<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
						<CardContent className="p-4">
							<h3 className="font-medium mb-3 text-sm flex items-center gap-2">
								<MapPin className="h-4 w-4 text-primary" />
								Your Journey
							</h3>
							
							{/* Route Visual Display */}
							<div className="space-y-3">
								{/* Origin */}
								<div className="flex items-start gap-3 text-xs">
									<div className="relative mt-1">
										<div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm flex-shrink-0" />
										{/* Connector line for stops or destination */}
										{((stops && stops.length > 0) || search.destination) && (
											<div className="absolute left-1/2 top-3 w-px h-6 bg-gradient-to-b from-green-500 to-gray-300 transform -translate-x-1/2"></div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-medium text-gray-900">From</div>
										<div className="text-muted-foreground text-xs leading-tight break-words">{search.origin}</div>
									</div>
								</div>
								
								{/* Stops */}
								{stops && stops.length > 0 && stops.map((stop: any, index: number) => (
									<div key={index} className="flex items-start gap-3 text-xs">
										<div className="relative mt-1">
											<div className="w-3 h-3 rounded-full bg-orange-500 border-2 border-white shadow-sm flex-shrink-0" />
											{/* Connector line to next stop or destination */}
											<div className="absolute left-1/2 top-3 w-px h-6 bg-gradient-to-b from-orange-500 to-gray-300 transform -translate-x-1/2"></div>
										</div>
										<div className="flex-1 min-w-0">
											<div className="font-medium text-gray-900">Stop {index + 1}</div>
											<div className="text-muted-foreground text-xs leading-tight break-words">{stop.address}</div>
										</div>
									</div>
								))}
								
								{/* Destination */}
								<div className="flex items-start gap-3 text-xs">
									<div className="relative mt-1">
										<div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm flex-shrink-0" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-medium text-gray-900">To</div>
										<div className="text-muted-foreground text-xs leading-tight break-words">{search.destination}</div>
									</div>
								</div>
							</div>
							
							{/* Route Status Indicator */}
							<div className="absolute top-2 right-2">
								<div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
							</div>
						</CardContent>
					</Card>

					{/* Selected Vehicle */}
					{selectedCar && (
						<Card>
							<CardContent className="p-4">
								<h3 className="font-medium mb-3 text-sm flex items-center gap-2">
									<Car className="h-4 w-4 text-blue-600" />
									Selected Vehicle
								</h3>
								<div className="flex items-center gap-3">
									{selectedCar.images && selectedCar.images.length > 0 && (
										<img
											src={selectedCar.images.find(img => img.isMain)?.url || selectedCar.images[0].url}
											alt={selectedCar.name}
											className="w-16 h-12 object-cover rounded border"
										/>
									)}
									<div className="flex-1 min-w-0">
										<div className="font-medium text-sm text-gray-900">
											{selectedCar.name}
										</div>
										<div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
											<span className="flex items-center gap-1">
												<Users className="h-3 w-3" />
												{selectedCar.seatingCapacity} seats
											</span>
											<span>{selectedCar.category?.name}</span>
											<span>{selectedCar.fuelType?.name}</span>
										</div>
										{selectedCar.features && selectedCar.features.length > 0 && (
											<div className="flex flex-wrap gap-1 mt-1">
												{selectedCar.features.slice(0, 2).map((feature: any) => (
													<Badge key={feature.id} variant="secondary" className="text-xs px-1 py-0">
														{feature.name}
													</Badge>
												))}
												{selectedCar.features.length > 2 && (
													<Badge variant="secondary" className="text-xs px-1 py-0">
														+{selectedCar.features.length - 2} more
													</Badge>
												)}
											</div>
										)}
									</div>
									{!isCalculating && !error && (
										<CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
									)}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Calculation Status */}
					<Card>
						<CardContent className="p-6">
							{isCalculating ? (
								<div className="text-center space-y-4">
									<Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
									<div>
										<h3 className="text-lg font-semibold">Calculating Your Quote</h3>
										<p className="text-sm text-muted-foreground mt-1">
											We're getting real-time distance data and applying our pricing to give you an accurate estimate...
										</p>
									</div>
									<div className="space-y-2 text-sm text-muted-foreground">
										<div className="flex items-center justify-center gap-2">
											<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
											<span>Calculating distance and duration</span>
										</div>
										<div className="flex items-center justify-center gap-2">
											<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
											<span>Applying pricing rates</span>
										</div>
										<div className="flex items-center justify-center gap-2">
											<div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
											<span>Checking for surge pricing</span>
										</div>
									</div>
								</div>
							) : error ? (
								<div className="space-y-4">
									<Alert>
										<AlertDescription>
											{error}
										</AlertDescription>
									</Alert>
									<div className="text-center">
										<Button 
											onClick={handleCalculateQuote}
											className="gap-2"
											disabled={isCalculating}
										>
											<Calculator className="w-4 h-4" />
											Try Again
										</Button>
									</div>
								</div>
							) : (
								<div className="text-center space-y-4">
									<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
										<Calculator className="w-6 h-6 text-primary" />
									</div>
									<div>
										<h3 className="text-lg font-semibold">Ready to Calculate</h3>
										<p className="text-sm text-muted-foreground">
											We have your route and vehicle selection. Click below to get your personalized quote.
										</p>
									</div>
									<Button 
										onClick={handleCalculateQuote}
										className="gap-2"
										size="lg"
									>
										<Calculator className="w-5 h-5" />
										Calculate Quote
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Info */}
					<div className="text-center text-xs text-muted-foreground space-y-1">
						<p>* Calculations use real-time traffic and distance data</p>
						<p>* Prices include all taxes and fees</p>
					</div>
				</div>
			</div>
		</div>
	);
}
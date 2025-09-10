import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
	ArrowLeft, 
	Car, 
	Users, 
	MapPin, 
	Calculator,
	Loader2,
	CheckCircle,
	Plus,
	X,
	Briefcase
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { useCalculateInstantQuoteMutation } from "@/features/marketing/_pages/home/_hooks/query/use-calculate-instant-quote-mutation";
import { useGetPublishedCarsQuery } from "@/features/customer/_hooks/query/use-get-published-cars-query";
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple";

const quoteFormSchema = z.object({
	originAddress: z.string().min(1, "Please enter your pickup location"),
	destinationAddress: z.string().min(1, "Please enter your destination"),
	stops: z.array(z.object({
		address: z.string().min(1, "Stop address is required"),
	})).optional().default([]),
});

interface CalculateQuotePageProps {
	isCustomerArea?: boolean;
}

export function CalculateQuotePage({ isCustomerArea = false }: CalculateQuotePageProps) {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as any;
	const [isCalculating, setIsCalculating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [originGeometry, setOriginGeometry] = useState<any>(null);
	const [destinationGeometry, setDestinationGeometry] = useState<any>(null);
	const [stopsGeometry, setStopsGeometry] = useState<any[]>([]);
	
	const calculateQuoteMutation = useCalculateInstantQuoteMutation();
	const { data: carsData } = useGetPublishedCarsQuery({ limit: 50 });

	const selectedCar = search.selectedCarId && carsData?.data ? 
		carsData.data.find(car => car.id === search.selectedCarId) : null;

	// Form for route input
	const form = useForm({
		resolver: zodResolver(quoteFormSchema),
		defaultValues: {
			originAddress: search.origin || "",
			destinationAddress: search.destination || "",
			stops: [],
		},
	});

	const { fields: stopFields, append: appendStop, remove: removeStop } = useFieldArray({
		control: form.control,
		name: "stops",
	});

	// Check if we have route data already
	const hasRouteData = search.origin && search.destination;

	// Parse stops if provided
	const stops = search.stops ? (() => {
		try {
			return JSON.parse(search.stops);
		} catch (e) {
			console.warn("Failed to parse stops data:", e);
			return [];
		}
	})() : [];

	// Form submission handler
	const handleFormSubmit = async (data: z.infer<typeof quoteFormSchema>) => {
		if (!search.selectedCarId) {
			setError("No vehicle selected");
			return;
		}

		setIsCalculating(true);
		setError(null);

		try {
			// Extract coordinates from geometry objects
			const originLat = originGeometry?.location?.lat();
			const originLng = originGeometry?.location?.lng();
			const destinationLat = destinationGeometry?.location?.lat();
			const destinationLng = destinationGeometry?.location?.lng();

			// Prepare stops data
			const stopsData = data.stops?.map((stop, index) => ({
				address: stop.address,
				latitude: stopsGeometry[index]?.location?.lat(),
				longitude: stopsGeometry[index]?.location?.lng(),
			})) || [];

			const result = await calculateQuoteMutation.mutateAsync({
				originAddress: data.originAddress,
				destinationAddress: data.destinationAddress,
				carId: search.selectedCarId,
				originLatitude: originLat,
				originLongitude: originLng,
				destinationLatitude: destinationLat,
				destinationLongitude: destinationLng,
				stops: stopsData,
			});

			// Navigate to booking or results page with secure quote ID
			if (result && (result as any).quoteId) {
				const quoteId = (result as any).quoteId;
				
				// If coming from fleet (has selectedCarId but no prior route data), skip quote results and go directly to booking
				if (search.selectedCarId && !search.origin) {
					navigate({
						to: "/book-quote/$quoteId",
						params: { quoteId }
					});
				} else {
					// Otherwise, go to quote results
					navigate({
						to: "/quote-results",
						search: { quoteId }
					});
				}
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

	useEffect(() => {
		// Auto-start calculation when component mounts if we have all data
		if (hasRouteData && search.selectedCarId) {
			handleCalculateQuote();
		}
	}, [search, hasRouteData]);

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

			// Navigate to booking or results page with secure quote ID
			if (result && (result as any).quoteId) {
				const quoteId = (result as any).quoteId;
				
				// If coming from fleet (has selectedCarId but no prior route data), skip quote results and go directly to booking
				if (search.selectedCarId && !search.origin) {
					navigate({
						to: "/book-quote/$quoteId",
						params: { quoteId }
					});
				} else {
					// Otherwise, go to quote results
					navigate({
						to: "/quote-results",
						search: { quoteId }
					});
				}
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
		// If we have a selected car but no route data, we came from fleet
		if (search.selectedCarId && !hasRouteData) {
			navigate({ to: "/fleet" });
		} else {
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
		}
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
								{search.selectedCarId && !hasRouteData ? "Back to Fleet" : "Back to Vehicles"}
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
				<div className="max-w-7xl mx-auto">
					{/* Desktop Grid Layout */}
					<div className="grid lg:grid-cols-3 gap-8">
						{/* Main Content Column */}
						<div className="lg:col-span-2 space-y-6">
					{hasRouteData ? (
						/* Route Summary - Only show when we have route data */
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
					) : (
						/* Route Input Form - Show when no route data */
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<MapPin className="h-5 w-5 text-primary" />
									Enter Your Journey Details
								</CardTitle>
								<CardDescription>
									Please provide your pickup and destination locations to calculate your fare.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Form {...form as any}>
									<form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
										{/* Origin */}
										<FormField
											control={form.control as any}
											name="originAddress"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Pickup Location</FormLabel>
													<FormControl>
														<GooglePlacesInput
															value={field.value}
															onChange={field.onChange}
															onPlaceSelected={setOriginGeometry}
															placeholder="Enter pickup address"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										{/* Destination */}
										<FormField
											control={form.control as any}
											name="destinationAddress"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Destination</FormLabel>
													<FormControl>
														<GooglePlacesInput
															value={field.value}
															onChange={field.onChange}
															onPlaceSelected={setDestinationGeometry}
															placeholder="Enter destination address"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										{/* Stops */}
										{stopFields.map((field, index) => (
											<div key={field.id} className="flex gap-2">
												<FormField
													control={form.control as any}
													name={`stops.${index}.address`}
													render={({ field: stopField }) => (
														<FormItem className="flex-1">
															<FormLabel>Stop {index + 1}</FormLabel>
															<FormControl>
																<GooglePlacesInput
																	value={stopField.value}
																	onChange={stopField.onChange}
																	onPlaceSelected={(geometry) => {
																		const newStopsGeometry = [...stopsGeometry];
																		newStopsGeometry[index] = geometry;
																		setStopsGeometry(newStopsGeometry);
																	}}
																	placeholder={`Stop ${index + 1} address`}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => removeStop(index)}
													className="mt-8"
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										))}

										{/* Add Stop Button */}
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => appendStop({ address: "" })}
											className="w-full"
										>
											<Plus className="h-4 w-4 mr-2" />
											Add Stop
										</Button>

										{/* Submit Button */}
										<Button 
											type="submit" 
											className="w-full" 
											size="lg"
											disabled={isCalculating}
										>
											{isCalculating ? (
												<>
													<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													Calculating...
												</>
											) : (
												<>
													<Calculator className="h-4 w-4 mr-2" />
													Calculate Quote
												</>
											)}
										</Button>
									</form>
								</Form>
							</CardContent>
						</Card>
					)}

					{/* Mobile Selected Vehicle */}
					{selectedCar && (
						<Card className="lg:hidden">
							<CardContent className="p-4">
								<h3 className="font-medium mb-3 text-sm flex items-center gap-2">
									<Car className="h-4 w-4 text-primary" />
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
										<div className="font-medium text-sm text-foreground">
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

					{/* Calculation Status - Only show when we have route data */}
					{hasRouteData && (
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
					)}

					{/* Error Alert - Show for form submission errors when no route data */}
					{!hasRouteData && error && (
						<Alert>
							<AlertDescription>
								{error}
							</AlertDescription>
						</Alert>
					)}

					{/* Info */}
					<div className="text-center text-xs text-muted-foreground space-y-1 lg:hidden">
						<p>* Calculations use real-time traffic and distance data</p>
						<p>* Prices include all taxes and fees</p>
					</div>
						</div>

						{/* Desktop Sidebar */}
						<div className="lg:block hidden space-y-6">
							{/* Selected Vehicle */}
							{selectedCar && (
								<Card className="sticky top-24">
									<CardContent className="p-6">
										<h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
											<Car className="h-5 w-5 text-primary" />
											Selected Vehicle
										</h3>
										
										{/* Vehicle Image */}
										{selectedCar.images && selectedCar.images.length > 0 && (
											<div className="mb-4">
												<img
													src={selectedCar.images.find(img => img.isMain)?.url || selectedCar.images[0].url}
													alt={selectedCar.name}
													className="w-full h-48 object-cover rounded-lg border"
												/>
											</div>
										)}
										
										<div className="space-y-4">
											{/* Vehicle Name */}
											<div>
												<h4 className="font-semibold text-xl text-foreground">
													{selectedCar.name}
												</h4>
												<p className="text-muted-foreground text-sm mt-1">
													{selectedCar.description}
												</p>
											</div>

											{/* Vehicle Details */}
											<div className="grid grid-cols-2 gap-4 text-sm">
												<div className="flex items-center gap-2">
													<Users className="h-4 w-4 text-primary" />
													<span>{selectedCar.seatingCapacity} passengers</span>
												</div>
												{selectedCar.luggageCapacity && (
													<div className="flex items-center gap-2">
														<Briefcase className="h-4 w-4 text-primary" />
														<span>{selectedCar.luggageCapacity} bags</span>
													</div>
												)}
												{selectedCar.category && (
													<div className="text-muted-foreground">
														{selectedCar.category.name}
													</div>
												)}
												{selectedCar.fuelType && (
													<div className="text-muted-foreground">
														{selectedCar.fuelType.name}
													</div>
												)}
											</div>

											{/* Vehicle Features */}
											{selectedCar.features && selectedCar.features.length > 0 && (
												<div>
													<h5 className="font-medium text-sm mb-2">Premium Features</h5>
													<div className="flex flex-wrap gap-2">
														{selectedCar.features.slice(0, 4).map((feature: any) => (
															<Badge key={feature.id} variant="secondary" className="text-xs">
																{feature.name}
															</Badge>
														))}
														{selectedCar.features.length > 4 && (
															<Badge variant="secondary" className="text-xs">
																+{selectedCar.features.length - 4} more
															</Badge>
														)}
													</div>
												</div>
											)}

											{/* Status Indicator */}
											{!isCalculating && !error && (
												<div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
													<CheckCircle className="w-5 h-5 text-green-600" />
													<span className="text-green-800 font-medium text-sm">Vehicle Selected</span>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							)}


							{/* Pricing Info */}
							<div className="text-xs text-muted-foreground space-y-1 p-4 bg-muted/30 rounded-lg">
								<p className="font-medium">Pricing Information</p>
								<p>* Calculations use real-time traffic data</p>
								<p>* All prices include taxes and fees</p>
								<p>* Final price confirmed before booking</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
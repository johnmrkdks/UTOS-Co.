import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import {
	ArrowLeft,
	Briefcase,
	Calculator,
	Car,
	CheckCircle,
	Loader2,
	MapPin,
	Plus,
	Users,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useGetPublishedCarsQuery } from "@/features/customer/_hooks/query/use-get-published-cars-query";
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple";
import { useCalculateInstantQuoteMutation } from "@/features/marketing/_pages/home/_hooks/query/use-calculate-instant-quote-mutation";

const quoteFormSchema = z.object({
	originAddress: z.string().min(1, "Please enter your pickup location"),
	destinationAddress: z.string().min(1, "Please enter your destination"),
	stops: z
		.array(
			z.object({
				address: z.string().min(1, "Stop address is required"),
			}),
		)
		.optional()
		.default([]),
});

interface CalculateQuotePageProps {
	isCustomerArea?: boolean;
}

export function CalculateQuotePage({
	isCustomerArea = false,
}: CalculateQuotePageProps) {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as any;
	const [isCalculating, setIsCalculating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [originGeometry, setOriginGeometry] = useState<any>(null);
	const [destinationGeometry, setDestinationGeometry] = useState<any>(null);
	const [stopsGeometry, setStopsGeometry] = useState<any[]>([]);

	const calculateQuoteMutation = useCalculateInstantQuoteMutation();
	const { data: carsData } = useGetPublishedCarsQuery({ limit: 50 });

	const selectedCar =
		search.selectedCarId && carsData?.data
			? carsData.data.find((car) => car.id === search.selectedCarId)
			: null;

	// Form for route input
	const form = useForm({
		resolver: zodResolver(quoteFormSchema),
		defaultValues: {
			originAddress: search.origin || "",
			destinationAddress: search.destination || "",
			stops: [],
		},
	});

	const {
		fields: stopFields,
		append: appendStop,
		remove: removeStop,
	} = useFieldArray({
		control: form.control,
		name: "stops",
	});

	// Check if we have route data already
	const hasRouteData = search.origin && search.destination;

	// Parse stops if provided
	const stops = search.stops
		? (() => {
				try {
					return JSON.parse(search.stops);
				} catch (e) {
					console.warn("Failed to parse stops data:", e);
					return [];
				}
			})()
		: [];

	// Form submission handler
	const handleFormSubmit = async (data: z.infer<typeof quoteFormSchema>) => {
		if (!search.selectedCarId) {
			setError("No vehicle selected");
			return;
		}

		setIsCalculating(true);
		setError(null);

		try {
			// Extract coordinates from geometry objects (place = { placeId, description, geometry: { location } })
			const originLat = originGeometry?.geometry?.location?.lat?.();
			const originLng = originGeometry?.geometry?.location?.lng?.();
			const destinationLat = destinationGeometry?.geometry?.location?.lat?.();
			const destinationLng = destinationGeometry?.geometry?.location?.lng?.();

			// Prepare stops data
			const stopsData =
				data.stops?.map((stop, index) => ({
					address: stop.address,
					latitude: stopsGeometry[index]?.geometry?.location?.lat?.(),
					longitude: stopsGeometry[index]?.geometry?.location?.lng?.(),
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
						params: { quoteId },
						resetScroll: true,
					});
				} else {
					// Otherwise, go to quote results
					navigate({
						to: "/quote-results",
						search: { quoteId },
						resetScroll: true,
					});
				}
			} else {
				throw new Error(
					"Quote calculation succeeded but no secure quote ID was returned",
				);
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
			const originLat = search.originLat
				? Number.parseFloat(search.originLat)
				: undefined;
			const originLng = search.originLng
				? Number.parseFloat(search.originLng)
				: undefined;
			const destinationLat = search.destinationLat
				? Number.parseFloat(search.destinationLat)
				: undefined;
			const destinationLng = search.destinationLng
				? Number.parseFloat(search.destinationLng)
				: undefined;

			// Prepare stops data
			const stopsData =
				stops?.map((stop: any, index: number) => ({
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
						params: { quoteId },
						resetScroll: true,
					});
				} else {
					// Otherwise, go to quote results
					navigate({
						to: "/quote-results",
						search: { quoteId },
						resetScroll: true,
					});
				}
			} else {
				throw new Error(
					"Quote calculation succeeded but no secure quote ID was returned",
				);
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
			navigate({ to: "/fleet", resetScroll: true });
		} else {
			// Go back to vehicle selection with route data
			const params = new URLSearchParams();
			if (search.origin) params.set("origin", search.origin);
			if (search.destination) params.set("destination", search.destination);
			if (search.originLat) params.set("originLat", search.originLat);
			if (search.originLng) params.set("originLng", search.originLng);
			if (search.destinationLat)
				params.set("destinationLat", search.destinationLat);
			if (search.destinationLng)
				params.set("destinationLng", search.destinationLng);
			if (search.stops) params.set("stops", search.stops);

			navigate({
				to: "/select-vehicle",
				search: Object.fromEntries(params),
				resetScroll: true,
			});
		}
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
								<ArrowLeft className="h-4 w-4" />
								{search.selectedCarId && !hasRouteData
									? "Back to Fleet"
									: "Back to Vehicles"}
							</Button>
							<div className="hidden h-6 w-px bg-border sm:block" />
							<div className="hidden sm:block">
								<h1 className="font-semibold text-lg">Calculate Quote</h1>
								<p className="text-muted-foreground text-sm">
									Getting your fare estimate
								</p>
							</div>
						</div>

						{/* Mobile title */}
						<div className="sm:hidden">
							<h1 className="font-semibold text-lg">Calculate Quote</h1>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-6">
				<div className="mx-auto max-w-7xl">
					{/* Desktop Grid Layout */}
					<div className="grid gap-8 lg:grid-cols-3">
						{/* Main Content Column */}
						<div className="space-y-6 lg:col-span-2">
							{hasRouteData ? (
								/* Route Summary - Only show when we have route data */
								<Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
									<CardContent className="p-4">
										<h3 className="mb-3 flex items-center gap-2 font-medium text-sm">
											<MapPin className="h-4 w-4 text-primary" />
											Your Journey
										</h3>

										{/* Route Visual Display */}
										<div className="space-y-3">
											{/* Origin */}
											<div className="flex items-start gap-3 text-xs">
												<div className="relative mt-1">
													<div className="h-3 w-3 flex-shrink-0 rounded-full border-2 border-white bg-green-500 shadow-sm" />
													{/* Connector line for stops or destination */}
													{((stops && stops.length > 0) ||
														search.destination) && (
														<div className="-translate-x-1/2 absolute top-3 left-1/2 h-6 w-px transform bg-gradient-to-b from-green-500 to-gray-300" />
													)}
												</div>
												<div className="min-w-0 flex-1">
													<div className="font-medium text-gray-900">From</div>
													<div className="break-words text-muted-foreground text-xs leading-tight">
														{search.origin}
													</div>
												</div>
											</div>

											{/* Stops */}
											{stops &&
												stops.length > 0 &&
												stops.map((stop: any, index: number) => (
													<div
														key={index}
														className="flex items-start gap-3 text-xs"
													>
														<div className="relative mt-1">
															<div className="h-3 w-3 flex-shrink-0 rounded-full border-2 border-white bg-orange-500 shadow-sm" />
															{/* Connector line to next stop or destination */}
															<div className="-translate-x-1/2 absolute top-3 left-1/2 h-6 w-px transform bg-gradient-to-b from-orange-500 to-gray-300" />
														</div>
														<div className="min-w-0 flex-1">
															<div className="font-medium text-gray-900">
																Stop {index + 1}
															</div>
															<div className="break-words text-muted-foreground text-xs leading-tight">
																{stop.address}
															</div>
														</div>
													</div>
												))}

											{/* Destination */}
											<div className="flex items-start gap-3 text-xs">
												<div className="relative mt-1">
													<div className="h-3 w-3 flex-shrink-0 rounded-full border-2 border-white bg-red-500 shadow-sm" />
												</div>
												<div className="min-w-0 flex-1">
													<div className="font-medium text-gray-900">To</div>
													<div className="break-words text-muted-foreground text-xs leading-tight">
														{search.destination}
													</div>
												</div>
											</div>
										</div>

										{/* Route Status Indicator */}
										<div className="absolute top-2 right-2">
											<div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
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
											Please provide your pickup and destination locations to
											calculate your fare.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Form {...(form as any)}>
											<form
												onSubmit={form.handleSubmit(handleFormSubmit)}
												className="space-y-4"
											>
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
																	onPlaceSelect={setOriginGeometry}
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
																	onPlaceSelect={setDestinationGeometry}
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
																			onPlaceSelect={(geometry) => {
																				const newStopsGeometry = [
																					...stopsGeometry,
																				];
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
													<Plus className="mr-2 h-4 w-4" />
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
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															Calculating...
														</>
													) : (
														<>
															<Calculator className="mr-2 h-4 w-4" />
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
										<h3 className="mb-3 flex items-center gap-2 font-medium text-sm">
											<Car className="h-4 w-4 text-primary" />
											Selected Vehicle
										</h3>
										<div className="flex items-center gap-3">
											{selectedCar.images && selectedCar.images.length > 0 && (
												<img
													src={
														selectedCar.images.find((img: any) => img.isMain)
															?.url || selectedCar.images[0].url
													}
													alt={selectedCar.name}
													className="h-12 w-16 rounded border object-cover"
												/>
											)}
											<div className="min-w-0 flex-1">
												<div className="font-medium text-foreground text-sm">
													{selectedCar.name}
												</div>
												<div className="mt-1 flex items-center gap-3 text-muted-foreground text-xs">
													<span className="flex items-center gap-1">
														<Users className="h-3 w-3" />
														{selectedCar.seatingCapacity} seats
													</span>
													<span>{selectedCar.category?.name}</span>
													<span>{selectedCar.fuelType?.name}</span>
												</div>
												{selectedCar.features &&
													selectedCar.features.length > 0 && (
														<div className="mt-1 flex flex-wrap gap-1">
															{selectedCar.features
																.slice(0, 2)
																.map((feature: any) => (
																	<Badge
																		key={feature.id}
																		variant="secondary"
																		className="px-1 py-0 text-xs"
																	>
																		{feature.name}
																	</Badge>
																))}
															{selectedCar.features.length > 2 && (
																<Badge
																	variant="secondary"
																	className="px-1 py-0 text-xs"
																>
																	+{selectedCar.features.length - 2} more
																</Badge>
															)}
														</div>
													)}
											</div>
											{!isCalculating && !error && (
												<CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
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
											<div className="space-y-4 text-center">
												<Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
												<div>
													<h3 className="font-semibold text-lg">
														Calculating Your Quote
													</h3>
													<p className="mt-1 text-muted-foreground text-sm">
														We're getting real-time distance data and applying
														our pricing to give you an accurate estimate...
													</p>
												</div>
												<div className="space-y-2 text-muted-foreground text-sm">
													<div className="flex items-center justify-center gap-2">
														<div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
														<span>Calculating distance and duration</span>
													</div>
													<div className="flex items-center justify-center gap-2">
														<div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
														<span>Applying pricing rates</span>
													</div>
													<div className="flex items-center justify-center gap-2">
														<div className="h-2 w-2 animate-pulse rounded-full bg-purple-500" />
														<span>Checking for surge pricing</span>
													</div>
												</div>
											</div>
										) : error ? (
											<div className="space-y-4">
												<Alert>
													<AlertDescription>{error}</AlertDescription>
												</Alert>
												<div className="text-center">
													<Button
														onClick={handleCalculateQuote}
														className="gap-2"
														disabled={isCalculating}
													>
														<Calculator className="h-4 w-4" />
														Try Again
													</Button>
												</div>
											</div>
										) : (
											<div className="space-y-4 text-center">
												<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
													<Calculator className="h-6 w-6 text-primary" />
												</div>
												<div>
													<h3 className="font-semibold text-lg">
														Ready to Calculate
													</h3>
													<p className="text-muted-foreground text-sm">
														We have your route and vehicle selection. Click
														below to get your personalized quote.
													</p>
												</div>
												<Button
													onClick={handleCalculateQuote}
													className="gap-2"
													size="lg"
												>
													<Calculator className="h-5 w-5" />
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
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							{/* Info */}
							<div className="space-y-1 text-center text-muted-foreground text-xs lg:hidden">
								<p>* Calculations use real-time traffic and distance data</p>
								<p>* Prices include all taxes and fees</p>
							</div>
						</div>

						{/* Desktop Sidebar */}
						<div className="hidden space-y-6 lg:block">
							{/* Selected Vehicle */}
							{selectedCar && (
								<Card className="sticky top-24">
									<CardContent className="p-6">
										<h3 className="mb-4 flex items-center gap-2 font-semibold text-lg">
											<Car className="h-5 w-5 text-primary" />
											Selected Vehicle
										</h3>

										{/* Vehicle Image */}
										{selectedCar.images && selectedCar.images.length > 0 && (
											<div className="mb-4">
												<img
													src={
														selectedCar.images.find((img: any) => img.isMain)
															?.url || selectedCar.images[0].url
													}
													alt={selectedCar.name}
													className="h-48 w-full rounded-lg border object-cover"
												/>
											</div>
										)}

										<div className="space-y-4">
											{/* Vehicle Name */}
											<div>
												<h4 className="font-semibold text-foreground text-xl">
													{selectedCar.name}
												</h4>
												<p className="mt-1 text-muted-foreground text-sm">
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
											{selectedCar.features &&
												selectedCar.features.length > 0 && (
													<div>
														<h5 className="mb-2 font-medium text-sm">
															Premium Features
														</h5>
														<div className="flex flex-wrap gap-2">
															{selectedCar.features
																.slice(0, 4)
																.map((feature: any) => (
																	<Badge
																		key={feature.id}
																		variant="secondary"
																		className="text-xs"
																	>
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
												<div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
													<CheckCircle className="h-5 w-5 text-green-600" />
													<span className="font-medium text-green-800 text-sm">
														Vehicle Selected
													</span>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							)}

							{/* Pricing Info */}
							<div className="space-y-1 rounded-lg bg-muted/30 p-4 text-muted-foreground text-xs">
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

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { Calculator, MapPin, ArrowLeft, ArrowRight, ChevronDown, ChevronRight, AlertCircle, Plus, X, LogIn, Car, Users, Loader2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { GooglePlacesInput } from "./google-places-input-simple"
import { useCalculateInstantQuoteMutation } from "../_hooks/query/use-calculate-instant-quote-mutation"
import { useCheckInstantQuoteAvailabilityQuery } from "../_hooks/query/use-check-instant-quote-availability-query"
import { useUserQuery } from "@/hooks/query/use-user-query"

const instantQuoteSchema = z.object({
	originAddress: z.string().min(1, "Origin address is required"),
	destinationAddress: z.string().min(1, "Destination address is required"),
	carId: z.string().optional(), // Optional for backward compatibility, required for accurate quotes
	stops: z.array(z.object({
		address: z.string().min(1, "Stop address is required"),
	})).optional().default([]),
})

type InstantQuoteForm = z.infer<typeof instantQuoteSchema>

interface QuoteResult {
	baseFare: number
	distanceFare: number
	timeFare: number
	extraCharges: number
	totalAmount: number
	estimatedDistance: number
	estimatedDuration: number
	breakdown: {
		baseRate: number
		perKmRate: number
		perMinuteRate: number
		minimumFare: number
		surgePricing?: number
	}
}

type Step = "input" | "results"

export function InstantQuoteWidget() {
	const [currentStep, setCurrentStep] = useState<Step>("input")
	const [quote, setQuote] = useState<QuoteResult | null>(null)
	const navigate = useNavigate()
	const search = useSearch({ strict: false }) as any
	const [originGeometry, setOriginGeometry] = useState<any>(null)
	const [destinationGeometry, setDestinationGeometry] = useState<any>(null)
	const [stopsGeometry, setStopsGeometry] = useState<any[]>([])
	const [showBreakdown, setShowBreakdown] = useState(false)
	const [isRestoringFromSelection, setIsRestoringFromSelection] = useState(false)
	
	const { session, isLoading: userLoading } = useUserQuery()
	const calculateQuoteMutation = useCalculateInstantQuoteMutation()
	const availabilityQuery = useCheckInstantQuoteAvailabilityQuery()

	const form = useForm({
		resolver: zodResolver(instantQuoteSchema),
		defaultValues: {
			originAddress: "",
			destinationAddress: "",
			carId: "",
			stops: [],
		},
	})

	const { fields: stopFields, append: appendStop, remove: removeStop } = useFieldArray({
		control: form.control,
		name: "stops",
	})

	const watchedValues = form.watch(["originAddress", "destinationAddress", "carId"])
	const isAvailable = availabilityQuery.data?.available
	const canProceedToCarSelection = watchedValues[0] && watchedValues[1] && isAvailable
	const canCalculateQuote = watchedValues[0] && watchedValues[1] && watchedValues[2] && isAvailable

	// Function definitions first
	const handleOriginSelect = (place: { placeId: string; description: string; geometry?: any }) => {
		setOriginGeometry(place.geometry)
		form.setValue("originAddress", place.description)
	}

	const handleDestinationSelect = (place: { placeId: string; description: string; geometry?: any }) => {
		setDestinationGeometry(place.geometry)
		form.setValue("destinationAddress", place.description)
	}

	const handleStopSelect = (index: number, place: { placeId: string; description: string; geometry?: any }) => {
		const newStopsGeometry = [...stopsGeometry]
		newStopsGeometry[index] = place.geometry
		setStopsGeometry(newStopsGeometry)
		form.setValue(`stops.${index}.address`, place.description)
	}

	const addStop = () => {
		appendStop({ address: "" })
		setStopsGeometry([...stopsGeometry, null])
	}

	const removeStopAt = (index: number) => {
		removeStop(index)
		const newStopsGeometry = [...stopsGeometry]
		newStopsGeometry.splice(index, 1)
		setStopsGeometry(newStopsGeometry)
	}

	const proceedToCarSelection = () => {
		const formData = form.getValues();
		
		// Navigate to dedicated vehicle selection page
		const params = new URLSearchParams();
		if (formData.originAddress) params.set("origin", formData.originAddress);
		if (formData.destinationAddress) params.set("destination", formData.destinationAddress);
		if (originGeometry?.location) {
			params.set("originLat", originGeometry.location.lat().toString());
			params.set("originLng", originGeometry.location.lng().toString());
		}
		if (destinationGeometry?.location) {
			params.set("destinationLat", destinationGeometry.location.lat().toString());
			params.set("destinationLng", destinationGeometry.location.lng().toString());
		}
		if (formData.stops && formData.stops.length > 0) {
			params.set("stops", JSON.stringify(formData.stops));
		}

		navigate({ 
			to: "/select-vehicle", 
			search: Object.fromEntries(params) 
		});
	}

	const backToRouteInput = () => {
		setCurrentStep("input")
	}

	const handleCalculateQuote = async () => {
		const formData = form.getValues()

		// Extract coordinates from geometry if available
		const originLat = originGeometry?.location?.lat?.();
		const originLng = originGeometry?.location?.lng?.();
		const destinationLat = destinationGeometry?.location?.lat?.();
		const destinationLng = destinationGeometry?.location?.lng?.();

		// Extract stops coordinates
		const stopsData = formData.stops?.map((stop, index) => ({
			address: stop.address,
			latitude: stopsGeometry[index]?.location?.lat?.(),
			longitude: stopsGeometry[index]?.location?.lng?.(),
		})) || [];

		const result = await calculateQuoteMutation.mutateAsync({
			originAddress: formData.originAddress,
			destinationAddress: formData.destinationAddress,
			carId: formData.carId, // Pass selected car ID for accurate pricing
			originLatitude: originLat,
			originLongitude: originLng,
			destinationLatitude: destinationLat,
			destinationLongitude: destinationLng,
			stops: stopsData,
			// scheduledPickupTime is optional and defaults to current time for surge pricing
		})
		setQuote(result)
		setCurrentStep("results")
	}

	const resetQuote = () => {
		setQuote(null)
		setOriginGeometry(null)
		setDestinationGeometry(null)
		setStopsGeometry([])
		setCurrentStep("input")
		setShowBreakdown(false)
		form.reset()
	}

	const handleBookThisJourney = () => {
		if (!quote) return
		
		const formData = form.getValues()
		
		// Prepare route data for URL params for guest booking
		const quoteParams = {
			origin: formData.originAddress,
			destination: formData.destinationAddress,
			distance: ((quote.estimatedDistance || 0) / 1000).toString(), // Convert to km
			duration: Math.round((quote.estimatedDuration || 0) / 60).toString(), // Convert to minutes
			totalFare: quote.totalAmount.toFixed(2), // Real decimal value
		}

		// Navigate to guest booking flow (no authentication required)
		navigate({
			to: "/book-quote",
			search: quoteParams
		})
	}

	const goBackToInput = () => {
		setCurrentStep("input")
		setShowBreakdown(false)
	}

	const isCalculating = calculateQuoteMutation.isPending

	// Restore form data when returning from vehicle selection
	useEffect(() => {
		if (search?.selectedCarId) {
			console.log("🔄 Restoring form data from vehicle selection", search);
			setIsRestoringFromSelection(true);
			
			// Restore form values
			if (search.origin) form.setValue("originAddress", search.origin);
			if (search.destination) form.setValue("destinationAddress", search.destination);
			if (search.selectedCarId) form.setValue("carId", search.selectedCarId);
			
			// Restore stops if provided
			if (search.stops) {
				try {
					const stops = JSON.parse(search.stops);
					form.setValue("stops", stops);
					setStopsGeometry(new Array(stops.length).fill(null));
				} catch (e) {
					console.warn("Failed to parse stops data:", e);
				}
			}

			// Restore geometry if provided
			if (search.originLat && search.originLng) {
				setOriginGeometry({
					location: {
						lat: () => parseFloat(search.originLat),
						lng: () => parseFloat(search.originLng)
					}
				});
			}

			if (search.destinationLat && search.destinationLng) {
				setDestinationGeometry({
					location: {
						lat: () => parseFloat(search.destinationLat),
						lng: () => parseFloat(search.destinationLng)
					}
				});
			}

			// Auto-calculate quote if we have all required data
			if (search.origin && search.destination && search.selectedCarId) {
				console.log("🚀 Auto-calculating quote with restored data");
				setCurrentStep("input"); // Ensure we're in input step
				
				// Calculate quote after a short delay to ensure state is updated
				const timer = setTimeout(async () => {
					try {
						await handleCalculateQuote();
					} finally {
						setIsRestoringFromSelection(false);
					}
				}, 1000);

				// Clean up timer
				return () => {
					clearTimeout(timer);
					setIsRestoringFromSelection(false);
				};
			} else {
				setIsRestoringFromSelection(false);
			}

			// Clear URL params after restoring
			navigate({ to: "/", search: {} }, { replace: true });
		}
	}, [search?.selectedCarId]); // Only depend on selectedCarId to prevent infinite loops

	// Loading state for availability check or restoring from vehicle selection
	if (availabilityQuery.isLoading || isRestoringFromSelection) {
		return (
			<Card className="w-full max-w-2xl mx-auto shadow-lg">
				<CardHeader className="text-center pb-4">
					<CardTitle className="flex items-center justify-center gap-2 text-xl">
						<Calculator className="h-5 w-5 text-primary" />
						Get Instant Quote
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{isRestoringFromSelection ? (
						<div className="text-center py-8">
							<div className="flex items-center justify-center gap-3 mb-4">
								<Loader2 className="h-6 w-6 animate-spin text-primary" />
								<span className="text-lg font-medium">Processing your selection...</span>
							</div>
							<div className="space-y-2 text-sm text-muted-foreground">
								<p>✓ Restoring your route details</p>
								<p>✓ Applying selected vehicle</p>
								<p className="flex items-center justify-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									Calculating estimated fare
								</p>
							</div>
						</div>
					) : (
						<>
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-10 w-full" />
						</>
					)}
				</CardContent>
			</Card>
		)
	}

	// Service unavailable state
	if (availabilityQuery.data && !availabilityQuery.data.available) {
		return (
			<Card className="w-full max-w-2xl mx-auto shadow-lg">
				<CardHeader className="text-center pb-4">
					<CardTitle className="flex items-center justify-center gap-2 text-xl">
						<Calculator className="h-5 w-5 text-muted-foreground" />
						Get Instant Quote
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							Instant quote service is temporarily unavailable. Please contact us directly for pricing information or check back later.
						</AlertDescription>
					</Alert>
					<div className="mt-4 text-center">
						<Button variant="outline" onClick={() => availabilityQuery.refetch()}>
							Try Again
						</Button>
					</div>
				</CardContent>
			</Card>
		)
	}


	return (
		<Card className="w-full max-w-2xl mx-auto shadow-lg">
			{currentStep === "input" && (
				<CardHeader className="text-center pb-4">
					<CardTitle className="flex items-center justify-center gap-2 text-xl">
						<Calculator className="h-5 w-5 text-primary" />
						Get Instant Quote
					</CardTitle>
					<div className="flex flex-col gap-1 text-xs">
						<p>Calculate your fare instantly for luxury chauffeur service across NSW.</p>
						<span className="font-semibold">Available Mon-Sun 00:00 – 23:45</span>
					</div>
				</CardHeader>
			)}
			<CardContent>
				{currentStep === "input" && (
					<div className="space-y-4">
						<Form {...form}>
							<form onSubmit={(e) => e.preventDefault()} className="space-y-4">
								{/* Trip Details */}
								<div className="space-y-4">
									<FormField
										control={form.control}
										name="originAddress"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<GooglePlacesInput
														disabled={!isAvailable}
														value={field.value || ""}
														onChange={field.onChange}
														onPlaceSelect={handleOriginSelect}
														placeholder="Origin - Enter pickup location in NSW..."
														className="text-xs md:text-sm bg-background"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Stops Section */}
									{stopFields.map((field, index) => (
										<FormField
											key={field.id}
											control={form.control}
											name={`stops.${index}.address`}
											render={({ field: stopField }) => (
												<FormItem>
													<FormControl>
														<GooglePlacesInput
															disabled={!isAvailable}
															value={stopField.value || ""}
															onChange={stopField.onChange}
															onPlaceSelect={(place) => handleStopSelect(index, place)}
															placeholder={`Stop ${index + 1} - Enter stop address in NSW...`}
															className="text-xs md:text-sm bg-background"
															showRemoveButton={true}
															onRemove={() => removeStopAt(index)}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									))}

									<FormField
										control={form.control}
										name="destinationAddress"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<GooglePlacesInput
														disabled={!isAvailable}
														value={field.value || ""}
														onChange={field.onChange}
														onPlaceSelect={handleDestinationSelect}
														placeholder="Destination - Enter destination in NSW..."
														className="text-xs md:text-sm bg-background"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Add Stop Button */}
									{stopFields.length < 3 && (
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={addStop}
											disabled={!isAvailable}
											className="text-xs border-dashed"
										>
											<Plus className="h-3 w-3" />
											Add Stop
										</Button>
									)}
								</div>

								{/* Quote Calculation Button */}
								<Button
									type="button"
									onClick={proceedToCarSelection}
									disabled={!canProceedToCarSelection}
									className="w-full h-10 text-sm font-semibold"
									size="default"
								>
									<Car className="mr-2 h-5 w-5" />
									Choose Vehicle & Get Quote
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>

								{!isAvailable ? (
									<p className="text-xs text-destructive text-center">
										* Service temporarily unavailable
									</p>
								) : !watchedValues[0] || !watchedValues[1] ? (
									<p className="text-xs text-muted-foreground text-center">
										* Regular Transfers Only - extras may apply
									</p>
								) : null}
							</form>
						</Form>
					</div>
				)}


				{currentStep === "results" && quote && (
					<div className="space-y-4">
						{/* Back Button */}
						<Button
							variant="outline"
							onClick={goBackToInput}
							className="flex items-center gap-2"
							size="sm"
						>
							<ArrowLeft className="h-4 w-4" />
							Back
						</Button>

						{/* Enhanced Trip Summary */}
						<div className="space-y-3">
							<div className="relative p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
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
											{(form.getValues("stops")?.length > 0 || form.getValues("destinationAddress")) && (
												<div className="absolute left-1/2 top-3 w-px h-6 bg-gradient-to-b from-green-500 to-gray-300 transform -translate-x-1/2"></div>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<div className="font-medium text-gray-900">From</div>
											<div className="text-muted-foreground text-xs leading-tight break-words">{form.getValues("originAddress")}</div>
										</div>
									</div>
									
									{/* Stops */}
									{form.getValues("stops")?.map((stop, index) => (
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
											<div className="text-muted-foreground text-xs leading-tight break-words">{form.getValues("destinationAddress")}</div>
										</div>
									</div>
								</div>
								
								{/* Route Status Indicator */}
								<div className="absolute top-2 right-2">
									<div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
								</div>
							</div>

							{/* Journey Info */}
							<div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
								<MapPin className="h-3 w-3" />
								<span>
									{(quote.estimatedDistance / 1000).toFixed(1)} km • {Math.round(quote.estimatedDuration / 60)} min journey
								</span>
							</div>

							{/* Estimated Fare Display */}
							<div className="bg-background border rounded-lg p-3">
								<div className="flex justify-between items-center font-bold text-lg">
									<span>Estimated Fare</span>
									<span className="text-primary">${quote.totalAmount.toFixed(2)}</span>
								</div>

								{/* Collapsible Cost Breakdown */}
								<button
									onClick={() => setShowBreakdown(!showBreakdown)}
									className="flex items-center gap-2 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
								>
									{showBreakdown ? (
										<ChevronDown className="h-3 w-3" />
									) : (
										<ChevronRight className="h-3 w-3" />
									)}
									View breakdown
								</button>

								{showBreakdown && (
									<div className="mt-2 pt-2 border-t space-y-1">
										<div className="flex justify-between text-xs">
											<span>Base fare</span>
											<span>${(quote.baseFare / 100).toFixed(2)}</span>
										</div>
										<div className="flex justify-between text-xs">
											<span>Distance fare</span>
											<span>${(quote.distanceFare / 100).toFixed(2)}</span>
										</div>
										{quote.extraCharges > 0 && (
											<div className="flex justify-between text-xs">
												<span>Extra charges</span>
												<span>${(quote.extraCharges / 100).toFixed(2)}</span>
											</div>
										)}
									</div>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex flex-col gap-2">
								<Button 
									onClick={handleBookThisJourney}
									className="w-full h-10 text-sm font-semibold"
								>
									Book This Journey
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>

								<Button variant="outline" onClick={resetQuote} className="w-full h-9 text-xs">
									Get New Quote
								</Button>
							</div>

							<div className="space-y-2">
								<p className="text-xs text-muted-foreground text-center">
									* Prices are estimates and may vary based on traffic and other factors
								</p>
								<p className="text-xs text-primary text-center">
									No account required - book as a guest
								</p>
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "@tanstack/react-router"
import { Calculator, MapPin, ArrowLeft, ArrowRight, ChevronDown, ChevronRight, AlertCircle, Plus, X, LogIn, Car } from "lucide-react"
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
import { useGetPublishedCarsQuery } from "@/features/customer/_hooks/query/use-get-published-cars-query"

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

type Step = "input" | "car-selection" | "results"

export function InstantQuoteWidget() {
	const [currentStep, setCurrentStep] = useState<Step>("input")
	const [quote, setQuote] = useState<QuoteResult | null>(null)
	const [originGeometry, setOriginGeometry] = useState<any>(null)
	const [destinationGeometry, setDestinationGeometry] = useState<any>(null)
	const [stopsGeometry, setStopsGeometry] = useState<any[]>([])
	const [showBreakdown, setShowBreakdown] = useState(false)
	
	const navigate = useNavigate()
	const { session, isLoading: userLoading } = useUserQuery()
	const calculateQuoteMutation = useCalculateInstantQuoteMutation()
	const availabilityQuery = useCheckInstantQuoteAvailabilityQuery()
	const { data: publishedCars, isLoading: carsLoading } = useGetPublishedCarsQuery({})

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

	// Loading state for availability check
	if (availabilityQuery.isLoading) {
		return (
			<Card className="w-full max-w-2xl mx-auto shadow-lg">
				<CardHeader className="text-center pb-4">
					<CardTitle className="flex items-center justify-center gap-2 text-xl">
						<Calculator className="h-5 w-5 text-primary" />
						Get Instant Quote
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-10 w-full" />
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
		setCurrentStep("car-selection")
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
			totalFare: (quote.totalAmount / 100).toFixed(2), // Convert from cents to dollars
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

				{currentStep === "car-selection" && (
					<div className="space-y-4">
						{/* Header for car selection step */}
						<div className="text-center pb-4">
							<h3 className="text-lg font-semibold flex items-center justify-center gap-2">
								<Car className="h-5 w-5 text-primary" />
								Choose Your Vehicle
							</h3>
							<p className="text-sm text-muted-foreground mt-2">
								Select a vehicle to get accurate pricing for your journey
							</p>
						</div>

						{/* Back Button */}
						<Button
							variant="outline"
							onClick={backToRouteInput}
							className="flex items-center gap-2"
							size="sm"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to Route
						</Button>

						{/* Car Selection Grid */}
						<Form {...form}>
							<FormField
								control={form.control}
								name="carId"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<div className="grid grid-cols-1 gap-3">
												{carsLoading ? (
													<>
														<Skeleton className="h-20 w-full" />
														<Skeleton className="h-20 w-full" />
														<Skeleton className="h-20 w-full" />
													</>
												) : publishedCars?.data?.length ? (
													publishedCars.data.map((car) => (
														<Card
															key={car.id}
															className={`cursor-pointer transition-all hover:shadow-md ${
																field.value === car.id 
																	? "ring-2 ring-primary bg-primary/5" 
																	: "hover:bg-muted/50"
															}`}
															onClick={() => field.onChange(car.id)}
														>
															<CardContent className="p-4">
																<div className="flex items-center justify-between">
																	<div className="flex items-center gap-3">
																		<div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
																			<Car className="h-6 w-6 text-muted-foreground" />
																		</div>
																		<div>
																			<h4 className="font-medium">{car.name}</h4>
																			<div className="flex items-center gap-2 text-sm text-muted-foreground">
																				<span>{car.category?.name}</span>
																				<span>•</span>
																				<span>{car.seatingCapacity} seats</span>
																			</div>
																		</div>
																	</div>
																	<div className="text-right">
																		<div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
																			Select for pricing
																		</div>
																	</div>
																</div>
															</CardContent>
														</Card>
													))
												) : (
													<Alert>
														<AlertCircle className="h-4 w-4" />
														<AlertDescription>
															No vehicles available at the moment. Please try again later.
														</AlertDescription>
													</Alert>
												)}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</Form>

						{/* Get Quote Button */}
						<Button
							type="button"
							onClick={handleCalculateQuote}
							disabled={!canCalculateQuote || isCalculating}
							className="w-full h-10 text-sm font-semibold"
							size="default"
						>
							{isCalculating ? (
								<>
									<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
									Calculating Quote...
								</>
							) : (
								<>
									<Calculator className="mr-2 h-5 w-5" />
									Get Accurate Quote
									<ArrowRight className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>
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

						{/* Trip Summary */}
						<div className="space-y-3">
							<div className="bg-muted/30 p-3 rounded-lg">
								<h3 className="font-medium mb-2 text-sm">Trip Details</h3>
								<div className="space-y-1.5 text-xs">
									<div className="flex items-start gap-2">
										<div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
										<div className="flex-1">
											<div className="font-medium">From</div>
											<div className="text-muted-foreground">{form.getValues("originAddress")}</div>
										</div>
									</div>
									{form.getValues("stops")?.map((stop, index) => (
										<div key={index} className="flex items-start gap-2">
											<div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
											<div className="flex-1">
												<div className="font-medium">Stop {index + 1}</div>
												<div className="text-muted-foreground">{stop.address}</div>
											</div>
										</div>
									))}
									<div className="flex items-start gap-2">
										<div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
										<div className="flex-1">
											<div className="font-medium">To</div>
											<div className="text-muted-foreground">{form.getValues("destinationAddress")}</div>
										</div>
									</div>
								</div>
							</div>

							{/* Journey Info */}
							<div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
								<MapPin className="h-3 w-3" />
								<span>
									{(quote.estimatedDistance / 1000).toFixed(1)} km • {Math.round(quote.estimatedDuration / 60)} min journey
								</span>
							</div>

							{/* Total Fare Display */}
							<div className="bg-background border rounded-lg p-3">
								<div className="flex justify-between items-center font-bold text-lg">
									<span>Total Fare</span>
									<span className="text-primary">${(quote.totalAmount / 100).toFixed(2)}</span>
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

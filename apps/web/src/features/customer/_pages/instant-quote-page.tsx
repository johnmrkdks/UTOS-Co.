import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@workspace/ui/components/form";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import {
	MapPin,
	Plus,
	Calculator,
	Car,
	Route,
	X,
	Bookmark,
	History,
	Star,
	Package,
	ArrowRight,
	ArrowLeft,
	ChevronDown,
	ChevronRight,
	AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple";
import { useCalculateInstantQuoteMutation } from "@/features/marketing/_pages/home/_hooks/query/use-calculate-instant-quote-mutation";
import { useCheckInstantQuoteAvailabilityQuery } from "@/features/marketing/_pages/home/_hooks/query/use-check-instant-quote-availability-query";

const instantQuoteSchema = z.object({
	originAddress: z.string().min(1, "Origin address is required"),
	destinationAddress: z.string().min(1, "Destination address is required"),
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

interface Stop {
	id: string;
	address: string;
	duration?: number;
}

export function InstantQuotePage() {
	const { session } = useUserQuery();
	const [activeTab, setActiveTab] = useState("new-quote");
	const [currentStep, setCurrentStep] = useState<Step>("input");
	const [quote, setQuote] = useState<QuoteResult | null>(null);
	const [originGeometry, setOriginGeometry] = useState<any>(null);
	const [destinationGeometry, setDestinationGeometry] = useState<any>(null);
	const [stopsGeometry, setStopsGeometry] = useState<any[]>([]);
	const [showBreakdown, setShowBreakdown] = useState(false);

	const calculateQuoteMutation = useCalculateInstantQuoteMutation();
	const availabilityQuery = useCheckInstantQuoteAvailabilityQuery();

	const form = useForm({
		resolver: zodResolver(instantQuoteSchema),
		defaultValues: {
			originAddress: "",
			destinationAddress: "",
			stops: [],
		},
	});

	const { fields: stopFields, append: appendStop, remove: removeStop } = useFieldArray({
		control: form.control,
		name: "stops",
	});

	const watchedValues = form.watch(["originAddress", "destinationAddress"]);
	const isAvailable = availabilityQuery.data?.available;
	const canCalculateQuote = watchedValues[0] && watchedValues[1] && isAvailable;

	// Mock data for saved routes and history (keeping these for the other tabs)
	const savedRoutes = [
		{ id: 1, name: "Home to Airport", from: "123 Main St, Sydney", to: "Sydney Airport", used: 5 },
		{ id: 2, name: "Office to Hotel", from: "456 Business Ave", to: "Luxury Hotel Downtown", used: 2 },
		{ id: 3, name: "City Tour Route", from: "Central Station", to: "Opera House", used: 1 }
	];

	const recentQuotes = [
		{ id: 1, from: "Circular Quay", to: "Bondi Beach", price: "$85", date: "2 days ago" },
		{ id: 2, from: "Airport", to: "CBD", price: "$65", date: "1 week ago" },
	];

	// Loading state for availability check
	if (availabilityQuery.isLoading) {
		return (
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold text-gray-900">Fare Estimator</h1>
					<p className="text-gray-600">Get instant fare estimates for your custom trips</p>
				</div>
				<Card>
					<CardContent className="space-y-4 p-6">
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-10 w-full" />
					</CardContent>
				</Card>
			</div>
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

	const loadSavedRoute = (route: any) => {
		form.setValue("originAddress", route.from);
		form.setValue("destinationAddress", route.to);
		setActiveTab("new-quote");
	};

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

	const goBackToInput = () => {
		setCurrentStep("input")
		setShowBreakdown(false)
	}

	const isCalculating = calculateQuoteMutation.isPending;

	return (
		<div className="max-w-6xl mx-auto space-y-6">
			{/* Header */}
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold text-gray-900">Instant Quote</h1>
				<p className="text-gray-600">Get instant fare estimates for your custom trips</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="new-quote" className="flex items-center gap-2">
						<Calculator className="h-4 w-4" />
						New Quote
					</TabsTrigger>
					<TabsTrigger value="saved-routes" className="flex items-center gap-2">
						<Bookmark className="h-4 w-4" />
						Saved Routes
					</TabsTrigger>
					<TabsTrigger value="history" className="flex items-center gap-2">
						<History className="h-4 w-4" />
						Quote History
					</TabsTrigger>
				</TabsList>

				<TabsContent value="new-quote" className="space-y-6">
					{/* Service unavailable state */}
					{availabilityQuery.data && !availabilityQuery.data.available ? (
						<Card>
							<CardContent className="p-6">
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
					) : currentStep === "input" ? (
						<div className="grid gap-6 lg:grid-cols-2">
							{/* Enhanced Quote Form with GooglePlacesInput */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Calculator className="h-5 w-5" />
										Trip Details
									</CardTitle>
									<CardDescription>
										Enter your pickup and destination for fare estimate
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Form {...form}>
										<form onSubmit={(e) => e.preventDefault()} className="space-y-4">
											{/* Origin Address */}
											<FormField
												control={form.control}
												name="originAddress"
												render={({ field }) => (
													<FormItem>
														<div className="flex items-center gap-2 mb-2">
															<MapPin className="h-4 w-4 text-green-600" />
															<span className="text-sm font-medium">Pickup Location</span>
														</div>
														<FormControl>
															<GooglePlacesInput
																disabled={!isAvailable}
																value={field.value || ""}
																onChange={field.onChange}
																onPlaceSelect={handleOriginSelect}
																placeholder="Enter pickup location in Australia..."
																className="text-sm bg-background"
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
															<div className="flex items-center gap-2 mb-2">
																<Route className="h-4 w-4 text-blue-600" />
																<span className="text-sm font-medium">Stop {index + 1}</span>
															</div>
															<FormControl>
																<GooglePlacesInput
																	disabled={!isAvailable}
																	value={stopField.value || ""}
																	onChange={stopField.onChange}
																	onPlaceSelect={(place) => handleStopSelect(index, place)}
																	placeholder={`Enter stop address in Australia...`}
																	className="text-sm bg-background"
																	showRemoveButton={true}
																	onRemove={() => removeStopAt(index)}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											))}

											{/* Destination Address */}
											<FormField
												control={form.control}
												name="destinationAddress"
												render={({ field }) => (
													<FormItem>
														<div className="flex items-center gap-2 mb-2">
															<MapPin className="h-4 w-4 text-red-600" />
															<span className="text-sm font-medium">Dropoff Location</span>
														</div>
														<FormControl>
															<GooglePlacesInput
																disabled={!isAvailable}
																value={field.value || ""}
																onChange={field.onChange}
																onPlaceSelect={handleDestinationSelect}
																placeholder="Enter destination in Australia..."
																className="text-sm bg-background"
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
													onClick={addStop}
													disabled={!isAvailable}
													className="w-full flex items-center gap-2"
												>
													<Plus className="h-4 w-4" />
													Add Stop
												</Button>
											)}

											{/* Calculate Button */}
											<Button
												type="button"
												onClick={handleCalculateQuote}
												disabled={!canCalculateQuote || isCalculating}
												className="w-full"
											>
												{isCalculating ? (
													<>
														<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
														Calculating...
													</>
												) : (
													<>
														<Calculator className="mr-2 h-4 w-4" />
														Estimate Fare
														<ArrowRight className="ml-2 h-4 w-4" />
													</>
												)}
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
								</CardContent>
							</Card>

							{/* Empty Results State */}
							<Card className="flex items-center justify-center h-96">
								<CardContent className="text-center">
									<Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Estimate</h3>
									<p className="text-gray-600">
										Fill in your pickup and destination to get fare estimate
									</p>
								</CardContent>
							</Card>
						</div>
					) : (
						/* Quote Results */
						<div className="space-y-4">
							{/* Back Button */}
							<Button
								variant="outline"
								onClick={goBackToInput}
								className="flex items-center gap-2"
								size="sm"
							>
								<ArrowLeft className="h-4 w-4" />
								Back to Form
							</Button>

							<div className="grid gap-6 lg:grid-cols-2">
								{/* Trip Summary */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Car className="h-5 w-5" />
											Trip Details
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="bg-muted/30 p-3 rounded-lg">
											<h3 className="font-medium mb-2 text-sm">Route Summary</h3>
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
										{quote && (
											<div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
												<MapPin className="h-3 w-3" />
												<span>
													{(quote.estimatedDistance / 1000).toFixed(1)} km • {Math.round(quote.estimatedDuration / 60)} min journey
												</span>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Fare Results */}
								{quote && (
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<Calculator className="h-5 w-5" />
												Your Fare Estimate
											</CardTitle>
											<CardDescription>
												Calculated fare breakdown
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
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
												<Button className="w-full">
													<Car className="h-4 w-4 mr-2" />
													Book This Journey
													<ArrowRight className="ml-2 h-4 w-4" />
												</Button>

												<div className="grid grid-cols-2 gap-2">
													<Button variant="outline" onClick={resetQuote}>
														Get New Quote
													</Button>
													<Button variant="outline">
														<Bookmark className="h-4 w-4 mr-2" />
														Save Route
													</Button>
												</div>
											</div>

											<p className="text-xs text-muted-foreground text-center">
												* Prices are estimates and may vary based on traffic and other factors
											</p>
										</CardContent>
									</Card>
								)}
							</div>
						</div>
					)}
				</TabsContent>

				<TabsContent value="saved-routes" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Bookmark className="h-5 w-5" />
								Your Saved Routes
							</CardTitle>
							<CardDescription>
								Quick access to your frequently used routes
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-3">
								{savedRoutes.map((route) => (
									<div key={route.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => loadSavedRoute(route)}>
										<div className="flex justify-between items-start mb-2">
											<h4 className="font-medium">{route.name}</h4>
											<Badge variant="secondary">{route.used} times</Badge>
										</div>
										<div className="space-y-1 text-sm text-gray-600">
											<div className="flex items-center gap-2">
												<MapPin className="h-3 w-3 text-green-600" />
												<span>{route.from}</span>
											</div>
											<div className="flex items-center gap-2">
												<MapPin className="h-3 w-3 text-red-600" />
												<span>{route.to}</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="history" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<History className="h-5 w-5" />
								Recent Quotes
							</CardTitle>
							<CardDescription>
								Your quote history and saved estimates
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-3">
								{recentQuotes.map((quote) => (
									<div key={quote.id} className="border rounded-lg p-4">
										<div className="flex justify-between items-center mb-2">
											<span className="font-medium">{quote.price}</span>
											<span className="text-sm text-gray-500">{quote.date}</span>
										</div>
										<div className="space-y-1 text-sm text-gray-600">
											<div className="flex items-center gap-2">
												<MapPin className="h-3 w-3 text-green-600" />
												<span>{quote.from}</span>
											</div>
											<div className="flex items-center gap-2">
												<MapPin className="h-3 w-3 text-red-600" />
												<span>{quote.to}</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Cross-sell CTA */}
			<Card className="bg-primary/5 border-primary/20">
				<CardContent className="p-6 text-center">
					<h3 className="text-lg font-semibold mb-2">Looking for Fixed Services?</h3>
					<p className="text-gray-600 mb-4">
						Browse our curated collection of luxury services with fixed pricing.
					</p>
					<Button variant="outline" asChild>
						<a href="/customer/services">
							<Package className="h-4 w-4 mr-2" />
							Browse Services
						</a>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

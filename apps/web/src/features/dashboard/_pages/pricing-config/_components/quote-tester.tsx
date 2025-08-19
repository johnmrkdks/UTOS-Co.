import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useGetPricingConfigsQuery } from "../_hooks/query/use-get-pricing-configs-query";
import { Calculator, MapPin, Clock, DollarSign, Route, Plus, X, ArrowRight } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple";
import { useCalculateInstantQuoteMutation } from "@/features/marketing/_pages/home/_hooks/query/use-calculate-instant-quote-mutation";

const quoteTesterSchema = z.object({
	pricingConfigId: z.string().min(1, "Please select a pricing configuration"),
	distance: z.number().min(0.1, "Distance must be at least 0.1 km"),
	duration: z.number().min(1, "Duration must be at least 1 minute"),
	additionalStops: z.number().min(0, "Additional stops cannot be negative"),
	waitingTime: z.number().min(0, "Waiting time cannot be negative"),
	timeOfDay: z.string().min(1, "Please select time of day"),
	dayType: z.enum(["weekday", "weekend"]),
});

const realAddressTesterSchema = z.object({
	pricingConfigId: z.string().min(1, "Please select a pricing configuration"),
	originAddress: z.string().min(1, "Origin address is required"),
	destinationAddress: z.string().min(1, "Destination address is required"),
	stops: z.array(z.object({
		address: z.string().min(1, "Stop address is required"),
	})).optional().default([]),
	waitingTime: z.number().min(0, "Waiting time cannot be negative"),
	timeOfDay: z.string().min(1, "Please select time of day"),
	dayType: z.enum(["weekday", "weekend"]),
});

type QuoteTesterForm = z.infer<typeof quoteTesterSchema>;
type RealAddressTesterForm = z.infer<typeof realAddressTesterSchema>;

export function QuoteTester() {
	const [quote, setQuote] = useState<any>(null);
	const [activeTab, setActiveTab] = useState("manual");
	const [originGeometry, setOriginGeometry] = useState<any>(null);
	const [destinationGeometry, setDestinationGeometry] = useState<any>(null);
	const [stopsGeometry, setStopsGeometry] = useState<any[]>([]);
	
	const pricingConfigsQuery = useGetPricingConfigsQuery({});
	const calculateQuoteMutation = useCalculateInstantQuoteMutation();
	
	const form = useForm<QuoteTesterForm>({
		resolver: zodResolver(quoteTesterSchema),
		defaultValues: {
			pricingConfigId: "",
			distance: 10,
			duration: 30,
			additionalStops: 0,
			waitingTime: 0,
			timeOfDay: "10:00",
			dayType: "weekday",
		},
	});

	const addressForm = useForm<RealAddressTesterForm>({
		resolver: zodResolver(realAddressTesterSchema),
		defaultValues: {
			pricingConfigId: "",
			originAddress: "",
			destinationAddress: "",
			stops: [],
			waitingTime: 0,
			timeOfDay: "10:00",
			dayType: "weekday",
		},
	});

	const { fields: stopFields, append: appendStop, remove: removeStop } = useFieldArray({
		control: addressForm.control,
		name: "stops",
	});

	const handleOriginSelect = (place: { placeId: string; description: string; geometry?: any }) => {
		setOriginGeometry(place.geometry)
		addressForm.setValue("originAddress", place.description)
	}

	const handleDestinationSelect = (place: { placeId: string; description: string; geometry?: any }) => {
		setDestinationGeometry(place.geometry)
		addressForm.setValue("destinationAddress", place.description)
	}

	const handleStopSelect = (index: number, place: { placeId: string; description: string; geometry?: any }) => {
		const newStopsGeometry = [...stopsGeometry]
		newStopsGeometry[index] = place.geometry
		setStopsGeometry(newStopsGeometry)
		addressForm.setValue(`stops.${index}.address`, place.description)
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

	const onAddressSubmit = async (data: RealAddressTesterForm) => {
		// Extract coordinates from geometry if available
		const originLat = originGeometry?.location?.lat?.();
		const originLng = originGeometry?.location?.lng?.();
		const destinationLat = destinationGeometry?.location?.lat?.();
		const destinationLng = destinationGeometry?.location?.lng?.();

		// Extract stops coordinates
		const stopsData = data.stops?.map((stop, index) => ({
			address: stop.address,
			latitude: stopsGeometry[index]?.location?.lat?.(),
			longitude: stopsGeometry[index]?.location?.lng?.(),
		})) || [];

		try {
			// Get real distance and duration from Google Maps
			const result = await calculateQuoteMutation.mutateAsync({
				originAddress: data.originAddress,
				destinationAddress: data.destinationAddress,
				originLatitude: originLat,
				originLongitude: originLng,
				destinationLatitude: destinationLat,
				destinationLongitude: destinationLng,
				stops: stopsData,
			});

			// Use the real distance and duration for quote calculation
			const distance = result.estimatedDistance / 1000; // Convert to km
			const duration = result.estimatedDuration / 60; // Convert to minutes

			// Now calculate the quote using the selected pricing config
			const config = pricingConfigsQuery.data?.data?.find(
				(c: any) => c.id === data.pricingConfigId
			);

			if (!config) return;

			// Calculate base fare
			let totalFare = config.baseFare || 0;

			// Calculate distance fare using real distance
			let distanceFare = 0;
			if (config.firstKmRate && distance > 0) {
				const firstKmDistance = Math.min(distance, config.firstKmLimit || 5);
				const remainingDistance = Math.max(0, distance - (config.firstKmLimit || 5));
				
				distanceFare = (firstKmDistance * (config.firstKmRate || 0)) + 
							  (remainingDistance * (config.pricePerKm || 0));
			} else {
				distanceFare = distance * (config.pricePerKm || 0);
			}

			// Calculate time fare using real duration
			let timeFare = 0;
			if (config.pricePerMinute) {
				timeFare = duration * config.pricePerMinute;
			}

			// Calculate multiplier
			let multiplier = 1.0;
			const hour = parseInt(data.timeOfDay.split(':')[0]);
			
			// Check peak hours
			if (config.peakHourStart && config.peakHourEnd) {
				const peakStart = parseInt(config.peakHourStart.split(':')[0]);
				const peakEnd = parseInt(config.peakHourEnd.split(':')[0]);
				if (hour >= peakStart && hour <= peakEnd) {
					multiplier = config.peakHourMultiplier || 1.0;
				}
			}
			
			// Check night hours
			if (config.nightHourStart && config.nightHourEnd) {
				const nightStart = parseInt(config.nightHourStart.split(':')[0]);
				const nightEnd = parseInt(config.nightHourEnd.split(':')[0]);
				if (hour >= nightStart || hour <= nightEnd) {
					multiplier = Math.max(multiplier, config.nightMultiplier || 1.0);
				}
			}
			
			// Weekend multiplier
			if (data.dayType === "weekend" && config.weekendMultiplier) {
				multiplier = Math.max(multiplier, config.weekendMultiplier);
			}

			// Additional charges
			const stopCharges = data.stops?.length * (config.stopCharge || 0) || 0;
			const waitingCharges = data.waitingTime * (config.waitingChargePerMinute || 0);

			// Calculate final amounts
			const subtotal = totalFare + distanceFare + timeFare;
			const subtotalWithMultiplier = subtotal * multiplier;
			const finalTotal = subtotalWithMultiplier + stopCharges + waitingCharges;

			setQuote({
				config: config.name,
				realData: {
					distance: distance,
					duration: duration,
					addresses: {
						origin: data.originAddress,
						destination: data.destinationAddress,
						stops: data.stops || [],
					}
				},
				breakdown: {
					baseFare: totalFare,
					distanceFare: distanceFare,
					timeFare: timeFare,
					multiplier: multiplier,
					stopCharges: stopCharges,
					waitingCharges: waitingCharges,
					subtotal: subtotal,
					subtotalWithMultiplier: subtotalWithMultiplier,
					total: finalTotal,
				},
				parameters: data,
				isRealTest: true,
			});

		} catch (error) {
			console.error("Error calculating real address quote:", error);
		}
	}

	const onSubmit = (data: QuoteTesterForm) => {
		const config = pricingConfigsQuery.data?.data?.find(
			(c: any) => c.id === data.pricingConfigId
		);

		if (!config) return;

		// Calculate base fare
		let totalFare = config.baseFare || 0;

		// Calculate distance fare
		let distanceFare = 0;
		if (config.firstKmRate && data.distance > 0) {
			const firstKmDistance = Math.min(data.distance, config.firstKmLimit || 5);
			const remainingDistance = Math.max(0, data.distance - (config.firstKmLimit || 5));
			
			distanceFare = (firstKmDistance * (config.firstKmRate || 0)) + 
						  (remainingDistance * (config.pricePerKm || 0));
		} else {
			distanceFare = data.distance * (config.pricePerKm || 0);
		}

		// Calculate time fare
		let timeFare = 0;
		if (config.pricePerMinute) {
			timeFare = data.duration * config.pricePerMinute;
		}

		// Calculate multiplier
		let multiplier = 1.0;
		const hour = parseInt(data.timeOfDay.split(':')[0]);
		
		// Check peak hours
		if (config.peakHourStart && config.peakHourEnd) {
			const peakStart = parseInt(config.peakHourStart.split(':')[0]);
			const peakEnd = parseInt(config.peakHourEnd.split(':')[0]);
			if (hour >= peakStart && hour <= peakEnd) {
				multiplier = config.peakHourMultiplier || 1.0;
			}
		}
		
		// Check night hours
		if (config.nightHourStart && config.nightHourEnd) {
			const nightStart = parseInt(config.nightHourStart.split(':')[0]);
			const nightEnd = parseInt(config.nightHourEnd.split(':')[0]);
			if (hour >= nightStart || hour <= nightEnd) {
				multiplier = Math.max(multiplier, config.nightMultiplier || 1.0);
			}
		}
		
		// Weekend multiplier
		if (data.dayType === "weekend" && config.weekendMultiplier) {
			multiplier = Math.max(multiplier, config.weekendMultiplier);
		}

		// Additional charges
		const stopCharges = data.additionalStops * (config.stopCharge || 0);
		const waitingCharges = data.waitingTime * (config.waitingChargePerMinute || 0);

		// Calculate final amounts
		const subtotal = totalFare + distanceFare + timeFare;
		const subtotalWithMultiplier = subtotal * multiplier;
		const finalTotal = subtotalWithMultiplier + stopCharges + waitingCharges;

		setQuote({
			config: config.name,
			breakdown: {
				baseFare: totalFare,
				distanceFare: distanceFare,
				timeFare: timeFare,
				multiplier: multiplier,
				stopCharges: stopCharges,
				waitingCharges: waitingCharges,
				subtotal: subtotal,
				subtotalWithMultiplier: subtotalWithMultiplier,
				total: finalTotal,
			},
			parameters: data,
		});
	};

	return (
		<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="manual">Manual Parameters</TabsTrigger>
				<TabsTrigger value="addresses">Real Addresses</TabsTrigger>
			</TabsList>

			<TabsContent value="manual">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Manual Input Form */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calculator className="h-5 w-5" />
								Test Parameters
							</CardTitle>
							<CardDescription>
								Enter booking details to calculate quote
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
									<FormField
										control={form.control}
										name="pricingConfigId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Pricing Configuration</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select configuration" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{pricingConfigsQuery.data?.data?.map((config: any) => (
															<SelectItem key={config.id} value={config.id}>
																{config.name} {config.isActive && <Badge variant="secondary" className="ml-2">Active</Badge>}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="distance"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Distance (km)</FormLabel>
													<FormControl>
														<Input 
															type="number" 
															step="0.1" 
															min="0.1"
															{...field} 
															onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="duration"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Duration (minutes)</FormLabel>
													<FormControl>
														<Input 
															type="number" 
															min="1"
															{...field} 
															onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="additionalStops"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Additional Stops</FormLabel>
													<FormControl>
														<Input 
															type="number" 
															min="0"
															{...field} 
															onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="waitingTime"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Waiting Time (min)</FormLabel>
													<FormControl>
														<Input 
															type="number" 
															min="0"
															{...field} 
															onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="timeOfDay"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Time of Day</FormLabel>
													<FormControl>
														<Input type="time" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="dayType"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Day Type</FormLabel>
													<Select onValueChange={field.onChange} defaultValue={field.value}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select day type" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="weekday">Weekday</SelectItem>
															<SelectItem value="weekend">Weekend</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<Button type="submit" className="w-full">
										Calculate Quote
									</Button>
								</form>
							</Form>
						</CardContent>
					</Card>

					{/* Quote Results */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<DollarSign className="h-5 w-5" />
								Quote Results
							</CardTitle>
							<CardDescription>
								{quote?.isRealTest ? "Real address test results" : "Manual test results"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{quote ? (
								<div className="space-y-4">
									<div className="text-center">
										<p className="text-sm text-muted-foreground">Total Fare</p>
										<p className="text-3xl font-bold">${quote.breakdown.total.toFixed(2)}</p>
										<p className="text-sm text-muted-foreground">Using {quote.config}</p>
									</div>

									{quote.realData && (
										<div className="bg-blue-50 p-3 rounded-lg">
											<h4 className="font-medium text-sm mb-2">Real Test Data</h4>
											<div className="text-xs space-y-1">
												<p><strong>Distance:</strong> {quote.realData.distance.toFixed(2)} km</p>
												<p><strong>Duration:</strong> {quote.realData.duration.toFixed(0)} min</p>
												<p><strong>From:</strong> {quote.realData.addresses.origin}</p>
												<p><strong>To:</strong> {quote.realData.addresses.destination}</p>
												{quote.realData.addresses.stops.length > 0 && (
													<p><strong>Stops:</strong> {quote.realData.addresses.stops.map((s: any) => s.address).join(', ')}</p>
												)}
											</div>
										</div>
									)}

									<Separator />

									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="flex items-center gap-2">
												<MapPin className="h-4 w-4" />
												Base Fare
											</span>
											<span>${quote.breakdown.baseFare.toFixed(2)}</span>
										</div>

										<div className="flex justify-between">
											<span className="flex items-center gap-2">
												<MapPin className="h-4 w-4" />
												Distance Fare ({quote.realData ? quote.realData.distance.toFixed(2) : quote.parameters.distance}km)
											</span>
											<span>${quote.breakdown.distanceFare.toFixed(2)}</span>
										</div>

										{quote.breakdown.timeFare > 0 && (
											<div className="flex justify-between">
												<span className="flex items-center gap-2">
													<Clock className="h-4 w-4" />
													Time Fare ({quote.realData ? quote.realData.duration.toFixed(0) : quote.parameters.duration}min)
												</span>
												<span>${quote.breakdown.timeFare.toFixed(2)}</span>
											</div>
										)}

										{quote.breakdown.multiplier !== 1.0 && (
											<div className="flex justify-between text-orange-600">
												<span>Time Multiplier ({quote.breakdown.multiplier}x)</span>
												<span>+${(quote.breakdown.subtotalWithMultiplier - quote.breakdown.subtotal).toFixed(2)}</span>
											</div>
										)}

										{quote.breakdown.stopCharges > 0 && (
											<div className="flex justify-between">
												<span>Stop Charges ({quote.realData ? quote.realData.addresses.stops.length : quote.parameters.additionalStops} stops)</span>
												<span>${quote.breakdown.stopCharges.toFixed(2)}</span>
											</div>
										)}

										{quote.breakdown.waitingCharges > 0 && (
											<div className="flex justify-between">
												<span>Waiting Charges ({quote.parameters.waitingTime}min)</span>
												<span>${quote.breakdown.waitingCharges.toFixed(2)}</span>
											</div>
										)}
									</div>

									<Separator />

									<div className="flex justify-between font-semibold text-lg">
										<span>Total</span>
										<span>${quote.breakdown.total.toFixed(2)}</span>
									</div>
								</div>
							) : (
								<div className="text-center py-8">
									<Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
									<p className="text-muted-foreground">Enter parameters and calculate quote</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</TabsContent>

			<TabsContent value="addresses">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Real Address Input Form */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Route className="h-5 w-5" />
								Real Address Testing
							</CardTitle>
							<CardDescription>
								Enter real addresses to test with Google Maps distance calculation
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Form {...addressForm}>
								<form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
									<FormField
										control={addressForm.control}
										name="pricingConfigId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Pricing Configuration</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select configuration" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{pricingConfigsQuery.data?.data?.map((config: any) => (
															<SelectItem key={config.id} value={config.id}>
																{config.name} {config.isActive && <Badge variant="secondary" className="ml-2">Active</Badge>}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Origin Address */}
									<FormField
										control={addressForm.control}
										name="originAddress"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<MapPin className="h-4 w-4 text-green-600" />
													Origin Address
												</FormLabel>
												<FormControl>
													<GooglePlacesInput
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

									{/* Stops */}
									{stopFields.map((field, index) => (
										<FormField
											key={field.id}
											control={addressForm.control}
											name={`stops.${index}.address`}
											render={({ field: stopField }) => (
												<FormItem>
													<FormLabel className="flex items-center gap-2">
														<Route className="h-4 w-4 text-blue-600" />
														Stop {index + 1}
													</FormLabel>
													<FormControl>
														<GooglePlacesInput
															value={stopField.value || ""}
															onChange={stopField.onChange}
															onPlaceSelect={(place) => handleStopSelect(index, place)}
															placeholder="Enter stop address in Australia..."
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

									{/* Add Stop Button */}
									{stopFields.length < 3 && (
										<Button
											type="button"
											variant="outline"
											onClick={addStop}
											className="w-full flex items-center gap-2"
										>
											<Plus className="h-4 w-4" />
											Add Stop
										</Button>
									)}

									{/* Destination Address */}
									<FormField
										control={addressForm.control}
										name="destinationAddress"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<MapPin className="h-4 w-4 text-red-600" />
													Destination Address
												</FormLabel>
												<FormControl>
													<GooglePlacesInput
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

									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={addressForm.control}
											name="waitingTime"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Waiting Time (min)</FormLabel>
													<FormControl>
														<Input 
															type="number" 
															min="0"
															{...field} 
															onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={addressForm.control}
											name="timeOfDay"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Time of Day</FormLabel>
													<FormControl>
														<Input type="time" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={addressForm.control}
										name="dayType"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Day Type</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select day type" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="weekday">Weekday</SelectItem>
														<SelectItem value="weekend">Weekend</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<Button 
										type="submit" 
										className="w-full"
										disabled={calculateQuoteMutation.isPending}
									>
										{calculateQuoteMutation.isPending ? (
											<>
												<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
												Calculating...
											</>
										) : (
											<>
												Calculate Real Quote
												<ArrowRight className="ml-2 h-4 w-4" />
											</>
										)}
									</Button>
								</form>
							</Form>
						</CardContent>
					</Card>

					{/* Same Quote Results Card as Manual Tab */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<DollarSign className="h-5 w-5" />
								Quote Results
							</CardTitle>
							<CardDescription>
								{quote?.isRealTest ? "Real address test results" : "Manual test results"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{quote ? (
								<div className="space-y-4">
									<div className="text-center">
										<p className="text-sm text-muted-foreground">Total Fare</p>
										<p className="text-3xl font-bold">${quote.breakdown.total.toFixed(2)}</p>
										<p className="text-sm text-muted-foreground">Using {quote.config}</p>
									</div>

									{quote.realData && (
										<div className="bg-blue-50 p-3 rounded-lg">
											<h4 className="font-medium text-sm mb-2">Real Test Data</h4>
											<div className="text-xs space-y-1">
												<p><strong>Distance:</strong> {quote.realData.distance.toFixed(2)} km</p>
												<p><strong>Duration:</strong> {quote.realData.duration.toFixed(0)} min</p>
												<p><strong>From:</strong> {quote.realData.addresses.origin}</p>
												<p><strong>To:</strong> {quote.realData.addresses.destination}</p>
												{quote.realData.addresses.stops.length > 0 && (
													<p><strong>Stops:</strong> {quote.realData.addresses.stops.map((s: any) => s.address).join(', ')}</p>
												)}
											</div>
										</div>
									)}

									<Separator />

									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="flex items-center gap-2">
												<MapPin className="h-4 w-4" />
												Base Fare
											</span>
											<span>${quote.breakdown.baseFare.toFixed(2)}</span>
										</div>

										<div className="flex justify-between">
											<span className="flex items-center gap-2">
												<MapPin className="h-4 w-4" />
												Distance Fare ({quote.realData ? quote.realData.distance.toFixed(2) : quote.parameters.distance}km)
											</span>
											<span>${quote.breakdown.distanceFare.toFixed(2)}</span>
										</div>

										{quote.breakdown.timeFare > 0 && (
											<div className="flex justify-between">
												<span className="flex items-center gap-2">
													<Clock className="h-4 w-4" />
													Time Fare ({quote.realData ? quote.realData.duration.toFixed(0) : quote.parameters.duration}min)
												</span>
												<span>${quote.breakdown.timeFare.toFixed(2)}</span>
											</div>
										)}

										{quote.breakdown.multiplier !== 1.0 && (
											<div className="flex justify-between text-orange-600">
												<span>Time Multiplier ({quote.breakdown.multiplier}x)</span>
												<span>+${(quote.breakdown.subtotalWithMultiplier - quote.breakdown.subtotal).toFixed(2)}</span>
											</div>
										)}

										{quote.breakdown.stopCharges > 0 && (
											<div className="flex justify-between">
												<span>Stop Charges ({quote.realData ? quote.realData.addresses.stops.length : quote.parameters.additionalStops} stops)</span>
												<span>${quote.breakdown.stopCharges.toFixed(2)}</span>
											</div>
										)}

										{quote.breakdown.waitingCharges > 0 && (
											<div className="flex justify-between">
												<span>Waiting Charges ({quote.parameters.waitingTime}min)</span>
												<span>${quote.breakdown.waitingCharges.toFixed(2)}</span>
											</div>
										)}
									</div>

									<Separator />

									<div className="flex justify-between font-semibold text-lg">
										<span>Total</span>
										<span>${quote.breakdown.total.toFixed(2)}</span>
									</div>
								</div>
							) : (
								<div className="text-center py-8">
									<Route className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
									<p className="text-muted-foreground">Enter addresses and calculate real quote</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</TabsContent>
		</Tabs>
	);
}
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@workspace/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
	ArrowRight,
	Calculator,
	Clock,
	DollarSign,
	MapPin,
	Plus,
	Route,
	X,
} from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple";
import { useCalculateInstantQuoteMutation } from "@/features/marketing/_pages/home/_hooks/query/use-calculate-instant-quote-mutation";
import { useGetPricingConfigsQuery } from "../_hooks/query/use-get-pricing-configs-query";

const quoteTesterSchema = z.object({
	pricingConfigId: z.string().min(1, "Please select a pricing configuration"),
	distance: z.number().min(0.1, "Distance must be at least 0.1 km"),
});

const realAddressTesterSchema = z.object({
	pricingConfigId: z.string().min(1, "Please select a pricing configuration"),
	originAddress: z.string().min(1, "Origin address is required"),
	destinationAddress: z.string().min(1, "Destination address is required"),
	stops: z
		.array(
			z.object({
				address: z.string().min(1, "Stop address is required"),
			}),
		)
		.optional()
		.default([]),
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
		},
	});

	const addressForm = useForm<RealAddressTesterForm>({
		resolver: zodResolver(realAddressTesterSchema),
		defaultValues: {
			pricingConfigId: "",
			originAddress: "",
			destinationAddress: "",
			stops: [],
		},
	});

	const {
		fields: stopFields,
		append: appendStop,
		remove: removeStop,
	} = useFieldArray({
		control: addressForm.control,
		name: "stops",
	});

	const handleOriginSelect = (place: {
		placeId: string;
		description: string;
		geometry?: any;
	}) => {
		setOriginGeometry(place.geometry);
		addressForm.setValue("originAddress", place.description);
	};

	const handleDestinationSelect = (place: {
		placeId: string;
		description: string;
		geometry?: any;
	}) => {
		setDestinationGeometry(place.geometry);
		addressForm.setValue("destinationAddress", place.description);
	};

	const handleStopSelect = (
		index: number,
		place: { placeId: string; description: string; geometry?: any },
	) => {
		const newStopsGeometry = [...stopsGeometry];
		newStopsGeometry[index] = place.geometry;
		setStopsGeometry(newStopsGeometry);
		addressForm.setValue(`stops.${index}.address`, place.description);
	};

	const addStop = () => {
		appendStop({ address: "" });
		setStopsGeometry([...stopsGeometry, null]);
	};

	const removeStopAt = (index: number) => {
		removeStop(index);
		const newStopsGeometry = [...stopsGeometry];
		newStopsGeometry.splice(index, 1);
		setStopsGeometry(newStopsGeometry);
	};

	const onAddressSubmit = async (data: RealAddressTesterForm) => {
		// Extract coordinates from geometry if available
		const originLat = originGeometry?.location?.lat?.();
		const originLng = originGeometry?.location?.lng?.();
		const destinationLat = destinationGeometry?.location?.lat?.();
		const destinationLng = destinationGeometry?.location?.lng?.();

		// Extract stops coordinates
		const stopsData =
			data.stops?.map((stop, index) => ({
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
				(c: any) => c.id === data.pricingConfigId,
			);

			if (!config) return;

			// Calculate using simplified two-tier pricing
			let firstKmFare = 0;
			let additionalKmFare = 0;

			const firstKmLimit = config.firstKmLimit || 10;

			if (distance <= firstKmLimit) {
				// Distance is within first tier - pay flat rate
				firstKmFare = config.firstKmRate || 0;
			} else {
				// Distance exceeds first tier - flat rate + additional per km
				firstKmFare = config.firstKmRate || 0;
				const additionalDistance = distance - firstKmLimit;
				additionalKmFare = additionalDistance * (config.pricePerKm || 0);
			}

			const finalTotal = firstKmFare + additionalKmFare;

			setQuote({
				config: config.name,
				realData: {
					distance: distance,
					duration: duration,
					addresses: {
						origin: data.originAddress,
						destination: data.destinationAddress,
						stops: data.stops || [],
					},
				},
				breakdown: {
					firstKmFare: firstKmFare,
					additionalKmFare: additionalKmFare,
					total: finalTotal,
					firstKmLimit: firstKmLimit,
					additionalDistance: Math.max(0, distance - firstKmLimit),
				},
				parameters: data,
				isRealTest: true,
			});
		} catch (error) {
			console.error("Error calculating real address quote:", error);
		}
	};

	const onSubmit = (data: QuoteTesterForm) => {
		const config = pricingConfigsQuery.data?.data?.find(
			(c: any) => c.id === data.pricingConfigId,
		);

		if (!config) return;

		// Calculate using simplified two-tier pricing
		let firstKmFare = 0;
		let additionalKmFare = 0;

		const firstKmLimit = config.firstKmLimit || 10;

		if (data.distance <= firstKmLimit) {
			// Distance is within first tier - pay flat rate
			firstKmFare = config.firstKmRate || 0;
		} else {
			// Distance exceeds first tier - flat rate + additional per km
			firstKmFare = config.firstKmRate || 0;
			const additionalDistance = data.distance - firstKmLimit;
			additionalKmFare = additionalDistance * (config.pricePerKm || 0);
		}

		const finalTotal = firstKmFare + additionalKmFare;

		setQuote({
			config: config.name,
			breakdown: {
				firstKmFare: firstKmFare,
				additionalKmFare: additionalKmFare,
				total: finalTotal,
				firstKmLimit: firstKmLimit,
				additionalDistance: Math.max(0, data.distance - firstKmLimit),
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
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{/* Manual Input Form */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calculator className="h-5 w-5" />
								Test Parameters
							</CardTitle>
							<CardDescription>
								Test simplified two-tier pricing with distance input
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Form {...(form as any)}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-4"
								>
									<FormField
										control={form.control as any}
										name="pricingConfigId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Pricing Configuration</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select configuration" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{pricingConfigsQuery.data?.data?.map(
															(config: any) => (
																<SelectItem key={config.id} value={config.id}>
																	{config.name}{" "}
																	{config.isActive && (
																		<Badge variant="secondary" className="ml-2">
																			Active
																		</Badge>
																	)}
																</SelectItem>
															),
														)}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control as any}
										name="distance"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Distance (km)</FormLabel>
												<FormControl>
													<Input
														type="number"
														step="0.1"
														min="0.1"
														placeholder="e.g., 15.5"
														{...field}
														onChange={(e) =>
															field.onChange(
																Number.parseFloat(e.target.value) || 0,
															)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

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
								{quote?.isRealTest
									? "Real address test results"
									: "Manual test results"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{quote ? (
								<div className="space-y-4">
									<div className="text-center">
										<p className="text-muted-foreground text-sm">Total Fare</p>
										<p className="font-bold text-3xl">
											${quote.breakdown.total.toFixed(2)}
										</p>
										<p className="text-muted-foreground text-sm">
											Using {quote.config}
										</p>
									</div>

									{quote.realData && (
										<div className="rounded-lg bg-blue-50 p-3">
											<h4 className="mb-2 font-medium text-sm">
												Real Test Data
											</h4>
											<div className="space-y-1 text-xs">
												<p>
													<strong>Distance:</strong>{" "}
													{quote.realData.distance.toFixed(2)} km
												</p>
												<p>
													<strong>Duration:</strong>{" "}
													{quote.realData.duration.toFixed(0)} min
												</p>
												<p>
													<strong>From:</strong>{" "}
													{quote.realData.addresses.origin}
												</p>
												<p>
													<strong>To:</strong>{" "}
													{quote.realData.addresses.destination}
												</p>
												{quote.realData.addresses.stops.length > 0 && (
													<p>
														<strong>Stops:</strong>{" "}
														{quote.realData.addresses.stops
															.map((s: any) => s.address)
															.join(", ")}
													</p>
												)}
											</div>
										</div>
									)}

									<Separator />

									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="flex items-center gap-2">
												<DollarSign className="h-4 w-4 text-blue-600" />
												First {quote.breakdown.firstKmLimit}km (Flat Rate)
											</span>
											<span className="font-semibold">
												${quote.breakdown.firstKmFare.toFixed(2)}
											</span>
										</div>

										{quote.breakdown.additionalDistance > 0 && (
											<div className="flex justify-between">
												<span className="flex items-center gap-2">
													<MapPin className="h-4 w-4 text-green-600" />
													Additional{" "}
													{quote.breakdown.additionalDistance.toFixed(2)}km
												</span>
												<span className="font-semibold">
													${quote.breakdown.additionalKmFare.toFixed(2)}
												</span>
											</div>
										)}

										{quote.breakdown.additionalDistance === 0 && (
											<div className="rounded-lg bg-blue-50 p-3">
												<p className="text-blue-800 text-sm">
													<strong>Within flat rate limit:</strong> No additional
													charges apply since the distance (
													{quote.realData
														? quote.realData.distance.toFixed(2)
														: quote.parameters.distance}
													km) is within the first {quote.breakdown.firstKmLimit}
													km tier.
												</p>
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
								<div className="py-8 text-center">
									<Calculator className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
									<p className="text-muted-foreground">
										Enter parameters and calculate quote
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</TabsContent>

			<TabsContent value="addresses">
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{/* Real Address Input Form */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Route className="h-5 w-5" />
								Real Address Testing
							</CardTitle>
							<CardDescription>
								Test with real addresses using Google Maps for accurate distance
								calculation
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Form {...(addressForm as any)}>
								<form
									onSubmit={addressForm.handleSubmit(onAddressSubmit)}
									className="space-y-4"
								>
									<FormField
										control={addressForm.control}
										name="pricingConfigId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Pricing Configuration</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select configuration" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{pricingConfigsQuery.data?.data?.map(
															(config: any) => (
																<SelectItem key={config.id} value={config.id}>
																	{config.name}{" "}
																	{config.isActive && (
																		<Badge variant="secondary" className="ml-2">
																			Active
																		</Badge>
																	)}
																</SelectItem>
															),
														)}
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
														className="bg-background text-sm"
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
															onPlaceSelect={(place) =>
																handleStopSelect(index, place)
															}
															placeholder="Enter stop address in Australia..."
															className="bg-background text-sm"
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
											className="flex w-full items-center gap-2"
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
														className="bg-background text-sm"
													/>
												</FormControl>
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
								{quote?.isRealTest
									? "Real address test results"
									: "Manual test results"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{quote ? (
								<div className="space-y-4">
									<div className="text-center">
										<p className="text-muted-foreground text-sm">Total Fare</p>
										<p className="font-bold text-3xl">
											${quote.breakdown.total.toFixed(2)}
										</p>
										<p className="text-muted-foreground text-sm">
											Using {quote.config}
										</p>
									</div>

									{quote.realData && (
										<div className="rounded-lg bg-blue-50 p-3">
											<h4 className="mb-2 font-medium text-sm">
												Real Test Data
											</h4>
											<div className="space-y-1 text-xs">
												<p>
													<strong>Distance:</strong>{" "}
													{quote.realData.distance.toFixed(2)} km
												</p>
												<p>
													<strong>Duration:</strong>{" "}
													{quote.realData.duration.toFixed(0)} min
												</p>
												<p>
													<strong>From:</strong>{" "}
													{quote.realData.addresses.origin}
												</p>
												<p>
													<strong>To:</strong>{" "}
													{quote.realData.addresses.destination}
												</p>
												{quote.realData.addresses.stops.length > 0 && (
													<p>
														<strong>Stops:</strong>{" "}
														{quote.realData.addresses.stops
															.map((s: any) => s.address)
															.join(", ")}
													</p>
												)}
											</div>
										</div>
									)}

									<Separator />

									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="flex items-center gap-2">
												<DollarSign className="h-4 w-4 text-blue-600" />
												First {quote.breakdown.firstKmLimit}km (Flat Rate)
											</span>
											<span className="font-semibold">
												${quote.breakdown.firstKmFare.toFixed(2)}
											</span>
										</div>

										{quote.breakdown.additionalDistance > 0 && (
											<div className="flex justify-between">
												<span className="flex items-center gap-2">
													<MapPin className="h-4 w-4 text-green-600" />
													Additional{" "}
													{quote.breakdown.additionalDistance.toFixed(2)}km
												</span>
												<span className="font-semibold">
													${quote.breakdown.additionalKmFare.toFixed(2)}
												</span>
											</div>
										)}

										{quote.breakdown.additionalDistance === 0 && (
											<div className="rounded-lg bg-blue-50 p-3">
												<p className="text-blue-800 text-sm">
													<strong>Within flat rate limit:</strong> No additional
													charges apply since the distance (
													{quote.realData
														? quote.realData.distance.toFixed(2)
														: quote.parameters.distance}
													km) is within the first {quote.breakdown.firstKmLimit}
													km tier.
												</p>
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
								<div className="py-8 text-center">
									<Route className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
									<p className="text-muted-foreground">
										Enter addresses and calculate real quote
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</TabsContent>
		</Tabs>
	);
}

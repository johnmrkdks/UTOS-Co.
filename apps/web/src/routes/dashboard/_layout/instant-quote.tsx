import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator, ArrowRight, Plus, X, MapPin, Car, Clock, Users } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple";
import { useCheckInstantQuoteAvailabilityQuery } from "@/features/marketing/_pages/home/_hooks/query/use-check-instant-quote-availability-query";
import { useGetPublishedCarsQuery } from "@/features/customer/_hooks/query/use-get-published-cars-query";

const customerQuoteSchema = z.object({
	originAddress: z.string().min(1, "Origin address is required"),
	destinationAddress: z.string().min(1, "Destination address is required"),
	stops: z.array(z.object({
		address: z.string().min(1, "Stop address is required"),
	})).optional().default([]),
});

export const Route = createFileRoute("/dashboard/_layout/instant-quote")({
	component: CustomerInstantQuotePage,
});

function CustomerInstantQuotePage() {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as any;
	const [originGeometry, setOriginGeometry] = useState<any>(null);
	const [destinationGeometry, setDestinationGeometry] = useState<any>(null);
	const [stopsGeometry, setStopsGeometry] = useState<any[]>([]);
	
	const availabilityQuery = useCheckInstantQuoteAvailabilityQuery();
	const { data: carsData } = useGetPublishedCarsQuery({ limit: 50 });
	
	// Get pre-selected car if available
	const preSelectedCar = search.selectedCarId && carsData?.data ? 
		carsData.data.find((car: any) => car.id === search.selectedCarId) : null;

	const form = useForm({
		resolver: zodResolver(customerQuoteSchema),
		defaultValues: {
			originAddress: "",
			destinationAddress: "",
			stops: [],
		},
	})

	const { fields: stopFields, append: appendStop, remove: removeStop } = useFieldArray({
		control: form.control,
		name: "stops",
	})

	const watchedValues = form.watch(["originAddress", "destinationAddress"]);
	const isAvailable = availabilityQuery.data?.available;
	const canProceedToCarSelection = watchedValues[0] && watchedValues[1] && isAvailable;

	const onSubmit = (data: z.infer<typeof customerQuoteSchema>) => {
		if (!originGeometry || !destinationGeometry) {
			return
		}

		// Navigate to vehicle selection with route data
		const params = new URLSearchParams();
		params.set("origin", data.originAddress);
		params.set("destination", data.destinationAddress);
		params.set("originLat", originGeometry.location.lat().toString());
		params.set("originLng", originGeometry.location.lng().toString());
		params.set("destinationLat", destinationGeometry.location.lat().toString());
		params.set("destinationLng", destinationGeometry.location.lng().toString());
		params.set("fromCustomerArea", "true");
		
		// Pass through pre-selected car if available
		if (search.selectedCarId) {
			params.set("selectedCarId", search.selectedCarId);
		}
		
		if (data.stops && data.stops.length > 0) {
			const stopsData = data.stops.map((stop, index) => ({
				address: stop.address,
				latitude: stopsGeometry[index]?.location?.lat?.() || null,
				longitude: stopsGeometry[index]?.location?.lng?.() || null,
			}))
			params.set("stops", JSON.stringify(stopsData));
		}

		// If car is pre-selected, skip vehicle selection and go to calculate quote
		if (search.selectedCarId) {
			// Authenticated users stay within customer area - use customer calculate quote
			params.set("fromCustomerArea", "true");
			
			navigate({ 
				to: "/dashboard/calculate-quote", // Keep authenticated users in customer area
				search: Object.fromEntries(params) as any
			})
		} else {
			// No car selected, go to vehicle selection first
			navigate({ 
				to: "/select-vehicle", 
				search: Object.fromEntries(params) as any
			})
		}
	}

	const addStop = () => {
		appendStop({ address: "" });
		setStopsGeometry(prev => [...prev, null]);
	}

	const removeStopHandler = (index: number) => {
		removeStop(index);
		setStopsGeometry(prev => prev.filter((_, i) => i !== index));
	}

	const updateStopGeometry = (index: number, geometry: any) => {
		setStopsGeometry(prev => {
			const updated = [...prev];
			updated[index] = geometry;
			return updated;
		})
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-2xl md:text-3xl font-bold tracking-tight">
					Get Instant Quote
				</h1>
				<p className="text-muted-foreground text-sm md:text-base">
					Enter your journey details to see available vehicles and pricing
				</p>
			</div>

			{/* Availability Status */}
			{!availabilityQuery.isLoading && (
				<>
					{isAvailable ? (
						<Alert>
							<Calculator className="h-4 w-4" />
							<AlertDescription>
								✅ Instant quotes are available! Enter your route to get started.
							</AlertDescription>
						</Alert>
					) : (
						<Alert>
							<AlertDescription>
								⚠️ Instant quotes are currently unavailable. Please contact us directly for bookings.
							</AlertDescription>
						</Alert>
					)}
				</>
			)}

			{/* Pre-selected Car Display */}
			{preSelectedCar && (
				<Card className="border-primary/20 bg-primary/5">
					<CardContent className="p-4">
						<div className="flex items-center gap-2 mb-3">
							<Car className="h-4 w-4 text-primary" />
							<span className="text-sm font-medium text-primary">Selected Vehicle</span>
							<Badge variant="secondary" className="text-xs">Pre-selected</Badge>
						</div>
						<div className="flex items-center gap-3">
							{preSelectedCar.images && preSelectedCar.images.length > 0 && (
								<img
									src={preSelectedCar.images.find((img: any) => img.isMain)?.url || preSelectedCar.images[0].url}
									alt={preSelectedCar.name}
									className="w-16 h-12 object-cover rounded border"
								/>
							)}
							<div className="flex-1 min-w-0">
								<div className="font-medium text-sm text-gray-900">
									{preSelectedCar.name}
								</div>
								<div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
									<span className="flex items-center gap-1">
										<Users className="h-3 w-3" />
										{preSelectedCar.seatingCapacity} seats
									</span>
									<span>{preSelectedCar.category?.name}</span>
									<span>{preSelectedCar.fuelType?.name}</span>
								</div>
								{preSelectedCar.features && preSelectedCar.features.length > 0 && (
									<div className="flex flex-wrap gap-1 mt-1">
										{preSelectedCar.features.slice(0, 2).map((feature: any) => (
											<Badge key={feature.id} variant="secondary" className="text-xs px-1 py-0">
												{feature.name}
											</Badge>
										))}
										{preSelectedCar.features.length > 2 && (
											<Badge variant="secondary" className="text-xs px-1 py-0">
												+{preSelectedCar.features.length - 2} more
											</Badge>
										)}
									</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Route Input Form */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MapPin className="h-5 w-5" />
						Journey Details
					</CardTitle>
					<CardDescription>
						Enter your pickup and destination addresses
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{/* Origin Address */}
							<FormField
								control={form.control}
								name="originAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pickup Location</FormLabel>
										<FormControl>
											<GooglePlacesInput
												{...field}
												placeholder="Enter pickup address..."
												onPlaceSelect={(place) => {
													field.onChange(place.description)
													setOriginGeometry(place.geometry)
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Destination Address */}
							<FormField
								control={form.control}
								name="destinationAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Destination</FormLabel>
										<FormControl>
											<GooglePlacesInput
												{...field}
												placeholder="Enter destination address..."
												onPlaceSelect={(place) => {
													field.onChange(place.description)
													setDestinationGeometry(place.geometry)
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Stops */}
							{stopFields.length > 0 && (
								<div className="space-y-4">
									<FormLabel>Additional Stops</FormLabel>
									{stopFields.map((field, index) => (
										<div key={field.id} className="flex gap-2">
											<FormField
												control={form.control}
												name={`stops.${index}.address`}
												render={({ field: stopField }) => (
													<FormItem className="flex-1">
														<FormControl>
															<GooglePlacesInput
																{...stopField}
																placeholder={`Stop ${index + 1} address...`}
																onPlaceSelect={(place) => {
																	stopField.onChange(place.description)
																	updateStopGeometry(index, place.geometry)
																}}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<Button
												type="button"
												variant="outline"
												size="icon"
												onClick={() => removeStopHandler(index)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							)}

							{/* Add Stop Button */}
							{stopFields.length < 3 && (
								<Button
									type="button"
									variant="outline"
									onClick={addStop}
									className="w-full"
								>
									<Plus className="h-4 w-4 mr-2" />
									Add Stop (Optional)
								</Button>
							)}

							{/* Submit Button */}
							<Button 
								type="submit" 
								className="w-full" 
								size="lg"
								disabled={!canProceedToCarSelection || availabilityQuery.isLoading}
							>
								{availabilityQuery.isLoading ? (
									"Checking availability..."
								) : !isAvailable ? (
									"Service unavailable"
								) : !watchedValues[0] || !watchedValues[1] ? (
									"Enter pickup and destination"
								) : (
									<>
										<Calculator className="h-4 w-4 mr-2" />
										{preSelectedCar ? "Calculate Quote" : "Select Vehicle & Get Quote"}
										<ArrowRight className="h-4 w-4 ml-2" />
									</>
								)}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

			{/* Quick Actions for Existing Customers */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="p-4">
					<div className="flex items-center gap-3">
						<div className="bg-primary/10 p-2 rounded-lg">
							<Clock className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 className="font-medium text-sm">Quick Booking</h3>
							<p className="text-xs text-muted-foreground">Get quotes in under 30 seconds</p>
						</div>
					</div>
				</Card>
				<Card className="p-4">
					<div className="flex items-center gap-3">
						<div className="bg-green-100 p-2 rounded-lg">
							<Car className="h-5 w-5 text-green-600" />
						</div>
						<div>
							<h3 className="font-medium text-sm">Premium Fleet</h3>
							<p className="text-xs text-muted-foreground">Choose from luxury vehicles</p>
						</div>
					</div>
				</Card>
				<Card className="p-4">
					<div className="flex items-center gap-3">
						<div className="bg-blue-100 p-2 rounded-lg">
							<Users className="h-5 w-5 text-blue-600" />
						</div>
						<div>
							<h3 className="font-medium text-sm">Professional Service</h3>
							<p className="text-xs text-muted-foreground">Expert chauffeurs available</p>
						</div>
					</div>
				</Card>
			</div>
		</div>
	)
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { MapPin, Plus, Calculator, AlertCircle } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple";
import { instantQuoteSchema, type InstantQuoteFormData } from "../_schemas/instant-quote";
import { useCalculateInstantQuoteMutation } from "@/features/marketing/_pages/home/_hooks/query/use-calculate-instant-quote-mutation";
import { useCheckInstantQuoteAvailabilityQuery } from "@/features/marketing/_pages/home/_hooks/query/use-check-instant-quote-availability-query";
import { type QuoteResult, type RouteData } from "../_types/instant-quote";

interface InstantQuoteInputProps {
	initialData?: Partial<InstantQuoteFormData>;
	onQuoteCalculated: (quote: QuoteResult, routeData: RouteData) => void;
}

export function InstantQuoteInput({ initialData, onQuoteCalculated }: InstantQuoteInputProps) {
	const form = useForm<InstantQuoteFormData>({
		resolver: zodResolver(instantQuoteSchema),
		defaultValues: {
			originAddress: initialData?.originAddress || "",
			destinationAddress: initialData?.destinationAddress || "",
			stops: initialData?.stops || [],
			originLatitude: initialData?.originLatitude || 0,
			originLongitude: initialData?.originLongitude || 0,
			destinationLatitude: initialData?.destinationLatitude || 0,
			destinationLongitude: initialData?.destinationLongitude || 0,
			stopsGeometry: initialData?.stopsGeometry || []
		}
	});

	const { fields: stops, append: addStop, remove: removeStop } = useFieldArray({
		control: form.control,
		name: "stops"
	});

	const { data: availability } = useCheckInstantQuoteAvailabilityQuery();
	const calculateQuoteMutation = useCalculateInstantQuoteMutation();

	const onSubmit = async (data: InstantQuoteFormData) => {
		try {
			const result = await calculateQuoteMutation.mutateAsync({
				originAddress: data.originAddress,
				destinationAddress: data.destinationAddress,
				originLatitude: data.originLatitude,
				originLongitude: data.originLongitude,
				destinationLatitude: data.destinationLatitude,
				destinationLongitude: data.destinationLongitude,
				stops: data.stops || []
			});

			const routeData: RouteData = {
				originAddress: data.originAddress,
				destinationAddress: data.destinationAddress,
				originLatitude: data.originLatitude,
				originLongitude: data.originLongitude,
				destinationLatitude: data.destinationLatitude,
				destinationLongitude: data.destinationLongitude,
				stops: data.stops || []
			};

			onQuoteCalculated(result, routeData);
		} catch (error) {
			console.error("Quote calculation failed:", error);
		}
	};

	const addStopHandler = () => {
		addStop({
			id: `stop-${Date.now()}`,
			address: "",
			duration: 15
		});
	};

	if (!availability?.available) {
		return (
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					Instant quote service is currently unavailable. Please try again later.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calculator className="h-5 w-5" />
					Get Instant Quote
				</CardTitle>
				<CardDescription>
					Enter your journey details to get an instant fare estimate
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form as any}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{/* Origin */}
						<FormField
							control={form.control as any}
							name="originAddress"
							render={({ field }) => (
								<FormItem>
									<FormLabel>From</FormLabel>
									<FormControl>
										<GooglePlacesInput
											placeholder="Enter pickup location..."
											value={field.value}
											onAddressSelect={(address, geometry) => {
												field.onChange(address);
												if (geometry?.location) {
													form.setValue("originLatitude", geometry.location.lat());
													form.setValue("originLongitude", geometry.location.lng());
												}
											}}
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
									<FormLabel>To</FormLabel>
									<FormControl>
										<GooglePlacesInput
											placeholder="Enter destination..."
											value={field.value}
											onAddressSelect={(address, geometry) => {
												field.onChange(address);
												if (geometry?.location) {
													form.setValue("destinationLatitude", geometry.location.lat());
													form.setValue("destinationLongitude", geometry.location.lng());
												}
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Stops */}
						{stops.map((stop, index) => (
							<FormField
								key={stop.id}
								control={form.control as any}
								name={`stops.${index}.address`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Stop {index + 1}</FormLabel>
										<FormControl>
											<div className="flex gap-2">
												<GooglePlacesInput
													placeholder="Enter stop location..."
													value={field.value}
													onAddressSelect={(address, geometry) => {
														field.onChange(address);
														if (geometry?.location) {
															const stopsGeometry = form.getValues("stopsGeometry") || [];
															stopsGeometry[index] = geometry;
															form.setValue("stopsGeometry", stopsGeometry);
														}
													}}
												/>
												<Button
													type="button"
													variant="outline"
													size="icon"
													onClick={() => removeStop(index)}
												>
													×
												</Button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}

						{/* Add Stop Button */}
						<Button
							type="button"
							variant="outline"
							onClick={addStopHandler}
							className="w-full"
						>
							<Plus className="h-4 w-4 mr-2" />
							Add Stop
						</Button>

						{/* Submit Button */}
						<Button
							type="submit"
							className="w-full"
							disabled={calculateQuoteMutation.isPending}
						>
							<MapPin className="h-4 w-4 mr-2" />
							{calculateQuoteMutation.isPending ? "Calculating..." : "Get Quote"}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
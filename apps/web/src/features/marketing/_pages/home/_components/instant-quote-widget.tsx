import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
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
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
	AlertCircle,
	ArrowRight,
	Calculator,
	Car,
	Plus,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useCheckInstantQuoteAvailabilityQuery } from "../_hooks/query/use-check-instant-quote-availability-query";
import { GooglePlacesInput } from "./google-places-input-simple";

const instantQuoteSchema = z.object({
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

export function InstantQuoteWidget() {
	// Simplified widget that only handles route input and navigation to vehicle selection
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as any;
	const [originGeometry, setOriginGeometry] = useState<any>(null);
	const [destinationGeometry, setDestinationGeometry] = useState<any>(null);
	const [stopsGeometry, setStopsGeometry] = useState<any[]>([]);

	const availabilityQuery = useCheckInstantQuoteAvailabilityQuery();

	// Show special UI for direct booking from /booking page (car already selected)
	// but still need to collect route information
	const isDirectBooking = search.directBooking === "true" && search.carId;

	const form = useForm({
		resolver: zodResolver(instantQuoteSchema),
		defaultValues: {
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
		control: form.control,
		name: "stops",
	});

	const watchedValues = form.watch(["originAddress", "destinationAddress"]);
	const isAvailable = availabilityQuery.data?.available;
	const canProceedToCarSelection =
		watchedValues[0] && watchedValues[1] && isAvailable;

	// Function definitions first
	const handleOriginSelect = (place: {
		placeId: string;
		description: string;
		geometry?: any;
	}) => {
		setOriginGeometry(place.geometry);
		form.setValue("originAddress", place.description);
	};

	const handleDestinationSelect = (place: {
		placeId: string;
		description: string;
		geometry?: any;
	}) => {
		setDestinationGeometry(place.geometry);
		form.setValue("destinationAddress", place.description);
	};

	const handleStopSelect = (
		index: number,
		place: { placeId: string; description: string; geometry?: any },
	) => {
		const newStopsGeometry = [...stopsGeometry];
		newStopsGeometry[index] = place.geometry;
		setStopsGeometry(newStopsGeometry);
		form.setValue(`stops.${index}.address`, place.description);
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

	const proceedToCarSelection = () => {
		const formData = form.getValues();

		// Navigate to dedicated vehicle selection page
		const params = new URLSearchParams();
		if (formData.originAddress) params.set("origin", formData.originAddress);
		if (formData.destinationAddress)
			params.set("destination", formData.destinationAddress);
		if (originGeometry?.location) {
			params.set("originLat", originGeometry.location.lat().toString());
			params.set("originLng", originGeometry.location.lng().toString());
		}
		if (destinationGeometry?.location) {
			params.set(
				"destinationLat",
				destinationGeometry.location.lat().toString(),
			);
			params.set(
				"destinationLng",
				destinationGeometry.location.lng().toString(),
			);
		}
		if (formData.stops && formData.stops.length > 0) {
			params.set("stops", JSON.stringify(formData.stops));
		}

		if (isDirectBooking) {
			// Direct booking from /booking - car already selected, go directly to calculate quote (public route)
			params.set("selectedCarId", search.carId);
			navigate({
				to: "/calculate-quote",
				search: Object.fromEntries(params) as any,
				resetScroll: true,
			});
		} else {
			// Normal flow - need to select vehicle first
			navigate({
				to: "/select-vehicle",
				search: Object.fromEntries(params),
				resetScroll: true,
			});
		}
	};

	// Removed unused functions since we're using a simplified flow

	// No longer need to restore form data since we're using a different flow
	// The widget now only handles the initial route input and vehicle selection

	// Loading state for availability check
	if (availabilityQuery.isLoading) {
		return (
			<Card className="mx-auto w-full max-w-2xl shadow-lg">
				<CardHeader className="pb-4 text-center">
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
		);
	}

	// Service unavailable state
	if (availabilityQuery.data && !availabilityQuery.data.available) {
		return (
			<Card className="mx-auto w-full max-w-2xl shadow-lg">
				<CardHeader className="pb-4 text-center">
					<CardTitle className="flex items-center justify-center gap-2 text-xl">
						<Calculator className="h-5 w-5 text-muted-foreground" />
						Get Instant Quote
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							Instant quote service is temporarily unavailable. Please contact
							us directly for pricing information or check back later.
						</AlertDescription>
					</Alert>
					<div className="mt-4 text-center">
						<Button
							variant="outline"
							onClick={() => availabilityQuery.refetch()}
						>
							Try Again
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="mx-auto w-full max-w-2xl shadow-lg">
			<CardHeader className="pb-4 text-center">
				<CardTitle className="flex items-center justify-center gap-2 text-xl">
					<Calculator className="h-5 w-5 text-primary" />
					Get Instant Quote
				</CardTitle>
				<div className="flex flex-col gap-1 text-xs">
					<p>
						Calculate your fare instantly for luxury chauffeur service across
						NSW.
					</p>
					<span className="font-semibold">Available Mon-Sun 00:00 – 23:45</span>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<Form {...(form as any)}>
						<form onSubmit={(e) => e.preventDefault()} className="space-y-4">
							{/* Trip Details */}
							<div className="space-y-4">
								<FormField
									control={form.control as any}
									name="originAddress"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<GooglePlacesInput
													disabled={!isAvailable}
													value={field.value || ""}
													onChange={field.onChange}
													onPlaceSelect={handleOriginSelect}
													placeholder="Origin - Enter pickup location..."
													className="bg-background text-xs md:text-sm"
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
										control={form.control as any}
										name={`stops.${index}.address`}
										render={({ field: stopField }) => (
											<FormItem>
												<FormControl>
													<GooglePlacesInput
														disabled={!isAvailable}
														value={stopField.value || ""}
														onChange={stopField.onChange}
														onPlaceSelect={(place) =>
															handleStopSelect(index, place)
														}
														placeholder={`Stop ${index + 1} - Enter stop address in NSW...`}
														className="bg-background text-xs md:text-sm"
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
									control={form.control as any}
									name="destinationAddress"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<GooglePlacesInput
													disabled={!isAvailable}
													value={field.value || ""}
													onChange={field.onChange}
													onPlaceSelect={handleDestinationSelect}
													placeholder="Destination - Enter destination..."
													className="bg-background text-xs md:text-sm"
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
										className="border-dashed text-xs"
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
								className="h-10 w-full font-semibold text-sm"
								size="default"
							>
								<Car className="mr-2 h-5 w-5" />
								Choose Vehicle & Get Quote
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>

							{!isAvailable ? (
								<p className="text-center text-destructive text-xs">
									* Service temporarily unavailable
								</p>
							) : !watchedValues[0] || !watchedValues[1] ? (
								<p className="text-center text-muted-foreground text-xs">
									* Regular Transfers Only - extras may apply
								</p>
							) : null}
						</form>
					</Form>
				</div>
			</CardContent>
		</Card>
	);
}

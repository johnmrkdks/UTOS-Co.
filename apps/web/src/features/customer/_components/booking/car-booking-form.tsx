import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@workspace/ui/components/textarea";
import { ArrowRight, Calendar, MapPin, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ImprovedDateTimePicker } from "@/components/improved-datetime-picker";
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple";
import { authClient } from "@/lib/auth-client";
import {
	type CarAppointmentForm,
	createCarAppointmentSchema,
} from "../../_schemas/car-appointment-schema";

interface CarBookingFormProps {
	car: any;
	onSubmit: (
		data: CarAppointmentForm,
		originGeometry: any,
		destinationGeometry: any,
	) => void;
	onCancel: () => void;
}

export function CarBookingForm({
	car,
	onSubmit,
	onCancel,
}: CarBookingFormProps) {
	const [originGeometry, setOriginGeometry] = useState<any>(null);
	const [destinationGeometry, setDestinationGeometry] = useState<any>(null);

	const { data: session } = authClient.useSession();

	const form = useForm<CarAppointmentForm>({
		resolver: zodResolver(
			createCarAppointmentSchema(car.seatingCapacity),
		) as any,
		defaultValues: {
			originAddress: "",
			destinationAddress: "",
			customerName: session?.user?.name || "",
			customerPhone: "",
			customerEmail: session?.user?.email || "",
			passengerCount: 1,
			luggageCount: 0,
			scheduledPickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
			specialRequests: "",
		},
	});

	// Update form when session data loads
	useEffect(() => {
		if (session?.user) {
			if (session.user.name && !form.getValues("customerName")) {
				form.setValue("customerName", session.user.name);
			}
			if (session.user.email && !form.getValues("customerEmail")) {
				form.setValue("customerEmail", session.user.email);
			}
		}
	}, [session, form]);

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

	const handleFormSubmit = (data: CarAppointmentForm) => {
		onSubmit(data, originGeometry, destinationGeometry);
	};

	// Get minimum pickup time (1 hour from now)
	const minPickupTime = new Date(Date.now() + 60 * 60 * 1000);

	return (
		<div className="grid gap-4 sm:gap-8 lg:grid-cols-12">
			{/* Main Form */}
			<div className="lg:col-span-8">
				<Form {...(form as any)}>
					<form
						onSubmit={form.handleSubmit(handleFormSubmit)}
						className="space-y-4 sm:space-y-8"
					>
						{/* Route Details */}
						<Card className="border-0 shadow-lg">
							<CardHeader className="border-b bg-muted/30 pb-3 sm:pb-4">
								<CardTitle className="flex items-center gap-2 text-lg sm:gap-3 sm:text-xl">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
										<MapPin className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
									</div>
									Route Details
								</CardTitle>
								<CardDescription className="text-sm sm:text-base">
									Set your pickup and destination locations
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-4 sm:pt-6">
								<div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
									<FormField
										control={form.control as any}
										name="originAddress"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-medium text-sm sm:text-base">
													Pickup Location *
												</FormLabel>
												<FormControl>
													<GooglePlacesInput
														value={field.value || ""}
														onChange={field.onChange}
														onPlaceSelect={handleOriginSelect}
														placeholder="Enter pickup location in Australia..."
														className="h-10 text-sm sm:h-12 sm:text-base"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control as any}
										name="destinationAddress"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-medium text-sm sm:text-base">
													Destination *
												</FormLabel>
												<FormControl>
													<GooglePlacesInput
														value={field.value || ""}
														onChange={field.onChange}
														onPlaceSelect={handleDestinationSelect}
														placeholder="Enter destination in Australia..."
														className="h-10 text-sm sm:h-12 sm:text-base"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Service Details */}
						<Card className="border-0 shadow-lg">
							<CardHeader className="border-b bg-muted/30 pb-3 sm:pb-4">
								<CardTitle className="flex items-center gap-2 text-lg sm:gap-3 sm:text-xl">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
										<Calendar className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
									</div>
									Service Details
								</CardTitle>
								<CardDescription className="text-sm sm:text-base">
									Choose your schedule and trip preferences
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-4 sm:pt-6">
								<div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
									<FormField
										control={form.control as any}
										name="scheduledPickupTime"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-medium text-sm sm:text-base">
													Pickup Date & Time *
												</FormLabel>
												<FormControl>
													<ImprovedDateTimePicker
														value={field.value}
														onChange={field.onChange}
														placeholder="Select pickup date and time"
														minDate={minPickupTime}
														className="text-sm sm:text-base"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control as any}
										name="passengerCount"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-medium text-sm sm:text-base">
													Passengers *
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														type="number"
														min="1"
														max={car.seatingCapacity}
														onChange={(e) =>
															field.onChange(
																Number.parseInt(e.target.value) || 1,
															)
														}
														className="h-10 text-sm sm:h-12 sm:text-base"
													/>
												</FormControl>
												<FormMessage />
												<p className="text-muted-foreground text-xs sm:text-sm">
													Max {car.seatingCapacity} passengers
												</p>
											</FormItem>
										)}
									/>

									<FormField
										control={form.control as any}
										name="luggageCount"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-medium text-sm sm:text-base">
													Luggage Pieces
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														type="number"
														min="0"
														max="10"
														onChange={(e) =>
															field.onChange(
																Number.parseInt(e.target.value) || 0,
															)
														}
														className="h-10 text-sm sm:h-12 sm:text-base"
													/>
												</FormControl>
												<FormMessage />
												<p className="text-muted-foreground text-xs sm:text-sm">
													Max 10 pieces of luggage
												</p>
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Customer Details */}
						<Card className="border-0 shadow-lg">
							<CardHeader className="border-b bg-muted/30 pb-3 sm:pb-4">
								<CardTitle className="flex items-center gap-2 text-lg sm:gap-3 sm:text-xl">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
										<User className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
									</div>
									Your Details
								</CardTitle>
								{session?.user && (
									<CardDescription className="text-sm sm:text-base">
										Details automatically filled from your account
									</CardDescription>
								)}
							</CardHeader>
							<CardContent className="pt-4 sm:pt-6">
								<div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
									<FormField
										control={form.control as any}
										name="customerName"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-medium text-sm sm:text-base">
													Full Name *
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="Enter your full name"
														className="h-10 text-sm sm:h-12 sm:text-base"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control as any}
										name="customerPhone"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-medium text-sm sm:text-base">
													Phone Number *
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="+61 4XX XXX XXX"
														className="h-10 text-sm sm:h-12 sm:text-base"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="mt-4 sm:mt-6">
									<FormField
										control={form.control as any}
										name="customerEmail"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-medium text-sm sm:text-base">
													Email Address
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="your.email@example.com"
														type="email"
														className="h-10 text-sm sm:h-12 sm:text-base"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="mt-4 sm:mt-6">
									<FormField
										control={form.control as any}
										name="specialRequests"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-medium text-sm sm:text-base">
													Special Requests
												</FormLabel>
												<FormControl>
													<Textarea
														{...field}
														placeholder="Any special requirements, child seats, accessibility needs, etc..."
														rows={3}
														className="text-sm sm:text-base"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Action Buttons */}
						<div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
							<Button
								type="submit"
								size="lg"
								className="font-semibold text-sm sm:text-base"
							>
								Review Appointment
								<ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
							</Button>
							<Button
								type="button"
								variant="outline"
								size="lg"
								onClick={onCancel}
								className="text-sm sm:h-14 sm:w-auto sm:px-8 sm:text-base"
							>
								Cancel
							</Button>
						</div>
					</form>
				</Form>
			</div>

			{/* Sidebar */}
			<div className="lg:col-span-4">
				<div className="sticky top-4 space-y-4 sm:space-y-6">
					{/* Booking Summary */}
					<Card className="border-0 shadow-lg">
						<CardHeader className="border-b bg-primary/5 pb-3 sm:pb-4">
							<CardTitle className="text-base sm:text-lg">
								Booking Summary
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-4 sm:pt-6">
							<div className="space-y-3 sm:space-y-4">
								<div className="flex items-center gap-2 text-xs sm:gap-3 sm:text-sm">
									<span className="font-medium">
										{car.model?.brand?.name} {car.model?.name}
									</span>
								</div>
								<div className="text-xs sm:text-sm">
									<span>Up to {car.seatingCapacity} passengers</span>
								</div>
								<div className="text-xs sm:text-sm">
									<span>Professional chauffeur service</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

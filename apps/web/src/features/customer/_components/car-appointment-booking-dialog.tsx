import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Calendar, Clock, MapPin, User, Phone, Mail, Users, MessageSquare, Car, ArrowRight, X, Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useCreateCustomBookingMutation } from "@/features/customer/_hooks/mutation/use-create-custom-booking-mutation"

const carAppointmentSchema = z.object({
	// Route information
	originAddress: z.string().min(1, "Pickup location is required"),
	destinationAddress: z.string().min(1, "Destination is required"),
	
	// Customer details
	customerName: z.string().min(2, "Name must be at least 2 characters"),
	customerPhone: z.string().min(10, "Please enter a valid phone number"),
	customerEmail: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
	passengerCount: z.number().int().min(1, "At least 1 passenger required").max(8, "Maximum 8 passengers allowed"),
	
	// Timing
	scheduledPickupTime: z.date({
		required_error: "Please select a pickup date and time",
	}),
	
	// Service details
	estimatedDuration: z.number().int().min(30, "Minimum 30 minutes").default(120), // in minutes
	specialRequests: z.string().optional(),
})

type CarAppointmentForm = z.infer<typeof carAppointmentSchema>

interface CarAppointmentBookingDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	car: any
	onBookingConfirmed: (bookingId: string) => void
}

type BookingStep = "details" | "confirmation" | "processing" | "success"

export function CarAppointmentBookingDialog({
	open,
	onOpenChange,
	car,
	onBookingConfirmed,
}: CarAppointmentBookingDialogProps) {
	const [currentStep, setCurrentStep] = useState<BookingStep>("details")
	const [bookingId, setBookingId] = useState<string | null>(null)
	const [originGeometry, setOriginGeometry] = useState<any>(null)
	const [destinationGeometry, setDestinationGeometry] = useState<any>(null)
	
	const { data: session } = authClient.useSession()
	
	const createCustomBookingMutation = useCreateCustomBookingMutation({
		onSuccess: (data) => {
			toast.success("Appointment booked successfully!", {
				description: `Your luxury chauffeur appointment has been confirmed. Booking ID: ${data.id}`,
			})
			setBookingId(data.id)
			setCurrentStep("success")
			
			setTimeout(() => {
				onBookingConfirmed(data.id)
				onOpenChange(false)
				resetForm()
			}, 3000)
		},
		onError: (error) => {
			toast.error("Failed to book appointment", {
				description: error.message || "Please try again or contact support if the problem persists.",
			})
			setCurrentStep("details")
		},
	})

	const form = useForm<CarAppointmentForm>({
		resolver: zodResolver(carAppointmentSchema),
		defaultValues: {
			originAddress: "",
			destinationAddress: "",
			customerName: "",
			customerPhone: "",
			customerEmail: "",
			passengerCount: 1,
			scheduledPickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
			estimatedDuration: 120, // 2 hours default
			specialRequests: "",
		},
	})

	const handleOriginSelect = (place: { placeId: string; description: string; geometry?: any }) => {
		setOriginGeometry(place.geometry)
		form.setValue("originAddress", place.description)
	}

	const handleDestinationSelect = (place: { placeId: string; description: string; geometry?: any }) => {
		setDestinationGeometry(place.geometry)
		form.setValue("destinationAddress", place.description)
	}

	const handleSubmit = async (data: CarAppointmentForm) => {
		if (!session?.user?.id) {
			authClient.signIn.social({ provider: "google" });
			return;
		}

		setCurrentStep("processing")
		
		try {
			// Calculate base pricing for custom booking
			const baseFare = 5000 // $50.00 base fare in cents
			const estimatedDistance = 10000 // 10km default estimate in meters
			const distanceFare = Math.round(estimatedDistance * 0.002 * 100) // $2 per km in cents
			const timeFare = Math.round((data.estimatedDuration / 60) * 1000) // $10 per hour in cents
			const totalAmount = baseFare + distanceFare + timeFare

			await createCustomBookingMutation.mutateAsync({
				carId: car.id,
				userId: session.user.id,
				
				// Route information
				originAddress: data.originAddress,
				originLatitude: originGeometry?.location?.lat?.(),
				originLongitude: originGeometry?.location?.lng?.(),
				destinationAddress: data.destinationAddress,
				destinationLatitude: destinationGeometry?.location?.lat?.(),
				destinationLongitude: destinationGeometry?.location?.lng?.(),
				
				// Timing
				scheduledPickupTime: data.scheduledPickupTime,
				estimatedDuration: data.estimatedDuration * 60, // convert to seconds
				estimatedDistance,
				
				// Pricing
				baseFare,
				distanceFare,
				timeFare,
				quotedAmount: totalAmount,
				
				// Customer details
				customerName: data.customerName,
				customerPhone: data.customerPhone,
				customerEmail: data.customerEmail || undefined,
				passengerCount: data.passengerCount,
				specialRequests: data.specialRequests,
			})
		} catch (error) {
			console.error("Appointment booking failed:", error)
			setCurrentStep("details")
		}
	}

	const resetForm = () => {
		setCurrentStep("details")
		setBookingId(null)
		setOriginGeometry(null)
		setDestinationGeometry(null)
		form.reset()
	}

	const goToConfirmation = () => {
		setCurrentStep("confirmation")
	}

	const goBackToDetails = () => {
		setCurrentStep("details")
	}

	// Format date for display
	const formatDateTime = (date: Date) => {
		return new Intl.DateTimeFormat("en-AU", {
			weekday: "long",
			year: "numeric",
			month: "long", 
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date)
	}

	// Get minimum pickup time (1 hour from now)
	const minPickupTime = new Date(Date.now() + 60 * 60 * 1000)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader className="space-y-1">
					<DialogTitle className="flex items-center gap-2">
						<Car className="h-5 w-5 text-primary" />
						Book Appointment
					</DialogTitle>
					<DialogDescription>
						{currentStep === "details" && `Schedule a chauffeur service with ${car.model?.brand?.name} ${car.model?.name}`}
						{currentStep === "confirmation" && "Review your appointment details before confirming"}
						{currentStep === "processing" && "Creating your appointment..."}
						{currentStep === "success" && "Appointment confirmed successfully!"}
					</DialogDescription>
				</DialogHeader>

				{/* Car Display */}
				<Card className="mb-4">
					<CardContent className="pt-4">
						<div className="flex items-center gap-4">
							<div className="relative h-16 w-24 overflow-hidden rounded-lg">
								<img
									src={car.images?.[0]?.url || "/api/placeholder/96/64"}
									alt={`${car.model?.brand?.name} ${car.model?.name}`}
									className="h-full w-full object-cover"
								/>
							</div>
							<div className="flex-1">
								<h3 className="font-medium">
									{car.model?.brand?.name} {car.model?.name}
								</h3>
								<p className="text-sm text-muted-foreground">
									{car.model?.year} • {car.category?.name} • {car.seatingCapacity} passengers
								</p>
								<div className="flex gap-1 mt-1">
									{car.carsToFeatures?.slice(0, 2).map((carFeature: any) => (
										<Badge key={carFeature.feature.id} variant="secondary" className="text-xs">
											{carFeature.feature.name}
										</Badge>
									))}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Booking Details Step */}
				{currentStep === "details" && (
					<div className="space-y-6">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(goToConfirmation)} className="space-y-6">
								{/* Route Details */}
								<Card>
									<CardHeader className="pb-3">
										<CardTitle className="text-lg">Route Details</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<FormField
											control={form.control}
											name="originAddress"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Pickup Location *</FormLabel>
													<FormControl>
														<GooglePlacesInput
															value={field.value || ""}
															onChange={field.onChange}
															onPlaceSelect={handleOriginSelect}
															placeholder="Enter pickup location in Australia..."
															className="w-full"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="destinationAddress"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Destination *</FormLabel>
													<FormControl>
														<GooglePlacesInput
															value={field.value || ""}
															onChange={field.onChange}
															onPlaceSelect={handleDestinationSelect}
															placeholder="Enter destination in Australia..."
															className="w-full"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>

								{/* Service Details */}
								<Card>
									<CardHeader className="pb-3">
										<CardTitle className="text-lg">Service Details</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FormField
												control={form.control}
												name="scheduledPickupTime"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Pickup Date & Time *</FormLabel>
														<FormControl>
															<Input
																{...field}
																type="datetime-local"
																min={minPickupTime.toISOString().slice(0, 16)}
																value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
																onChange={(e) => field.onChange(new Date(e.target.value))}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="estimatedDuration"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Estimated Duration (minutes) *</FormLabel>
														<FormControl>
															<Input
																{...field}
																type="number"
																min="30"
																max="480"
																onChange={(e) => field.onChange(parseInt(e.target.value) || 120)}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<FormField
											control={form.control}
											name="passengerCount"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Number of Passengers *</FormLabel>
													<FormControl>
														<Input
															{...field}
															type="number"
															min="1"
															max={car.seatingCapacity}
															onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
														/>
													</FormControl>
													<FormMessage />
													<p className="text-xs text-muted-foreground">
														Maximum {car.seatingCapacity} passengers for this vehicle
													</p>
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>

								{/* Customer Details */}
								<Card>
									<CardHeader className="pb-3">
										<CardTitle className="text-lg">Your Details</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FormField
												control={form.control}
												name="customerName"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Full Name *</FormLabel>
														<FormControl>
															<Input {...field} placeholder="Enter your full name" />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="customerPhone"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Phone Number *</FormLabel>
														<FormControl>
															<Input {...field} placeholder="+61 4XX XXX XXX" />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<FormField
											control={form.control}
											name="customerEmail"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Email Address</FormLabel>
													<FormControl>
														<Input {...field} placeholder="your.email@example.com" type="email" />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="specialRequests"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Special Requests</FormLabel>
													<FormControl>
														<Textarea
															{...field}
															placeholder="Any special requirements, child seats, accessibility needs, etc..."
															rows={3}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>

								{/* Action Buttons */}
								<div className="flex flex-col gap-3">
									<Button type="submit" className="w-full">
										Review Appointment
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
									<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
										Cancel
									</Button>
								</div>
							</form>
						</Form>
					</div>
				)}

				{/* Confirmation Step */}
				{currentStep === "confirmation" && (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Confirm Your Appointment</CardTitle>
								<CardDescription>
									Please review all details before confirming your chauffeur service
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Service Details */}
								<div className="space-y-3">
									<h4 className="font-medium">Service Information</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
										<div>
											<span className="text-muted-foreground">Pickup:</span>
											<div className="font-medium">{formatDateTime(form.getValues("scheduledPickupTime"))}</div>
										</div>
										<div>
											<span className="text-muted-foreground">Duration:</span>
											<div className="font-medium">{form.getValues("estimatedDuration")} minutes</div>
										</div>
									</div>
									<div className="space-y-2 text-sm">
										<div>
											<span className="text-muted-foreground">From:</span>
											<div className="font-medium">{form.getValues("originAddress")}</div>
										</div>
										<div>
											<span className="text-muted-foreground">To:</span>
											<div className="font-medium">{form.getValues("destinationAddress")}</div>
										</div>
									</div>
								</div>

								<Separator />

								{/* Customer Details */}
								<div className="space-y-3">
									<h4 className="font-medium">Passenger Information</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
										<div>
											<span className="text-muted-foreground">Name:</span>
											<div className="font-medium">{form.getValues("customerName")}</div>
										</div>
										<div>
											<span className="text-muted-foreground">Phone:</span>
											<div className="font-medium">{form.getValues("customerPhone")}</div>
										</div>
										<div>
											<span className="text-muted-foreground">Email:</span>
											<div className="font-medium">{form.getValues("customerEmail") || "Not provided"}</div>
										</div>
										<div>
											<span className="text-muted-foreground">Passengers:</span>
											<div className="font-medium">{form.getValues("passengerCount")} person(s)</div>
										</div>
									</div>
									{form.getValues("specialRequests") && (
										<div>
											<span className="text-muted-foreground">Special Requests:</span>
											<div className="font-medium">{form.getValues("specialRequests")}</div>
										</div>
									)}
								</div>

								{/* Important Notes */}
								<div className="bg-muted/50 p-3 rounded-lg space-y-2">
									<h5 className="font-medium text-sm">Important Information</h5>
									<ul className="text-xs text-muted-foreground space-y-1">
										<li>• This is a custom appointment booking with your selected vehicle</li>
										<li>• Final pricing will be calculated based on actual distance and time</li>
										<li>• A driver will be assigned and will contact you before pickup</li>
										<li>• Cancellation policy: Free cancellation up to 2 hours before pickup</li>
									</ul>
								</div>

								{/* Action Buttons */}
								<div className="flex flex-col gap-3 pt-4">
									<Button onClick={() => handleSubmit(form.getValues())} className="w-full">
										Confirm Appointment
									</Button>
									<Button variant="outline" onClick={goBackToDetails}>
										Back to Edit Details
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Processing Step */}
				{currentStep === "processing" && (
					<div className="text-center py-8 space-y-4">
						<div className="mx-auto w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
						<div className="space-y-2">
							<h3 className="text-lg font-medium">Creating Your Appointment...</h3>
							<p className="text-muted-foreground">Please wait while we process your request</p>
						</div>
					</div>
				)}

				{/* Success Step */}
				{currentStep === "success" && (
					<div className="text-center py-8 space-y-6">
						<div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
							<div className="w-8 h-8 text-green-600">✓</div>
						</div>
						<div className="space-y-2">
							<h3 className="text-xl font-bold text-green-600">Appointment Confirmed!</h3>
							<p className="text-muted-foreground">
								Your chauffeur appointment has been booked successfully.
							</p>
							{bookingId && (
								<div className="bg-muted/50 p-3 rounded-lg">
									<p className="text-sm">
										<span className="font-medium">Booking Reference:</span> {bookingId}
									</p>
								</div>
							)}
						</div>
						<div className="space-y-2 text-sm text-muted-foreground">
							<p>• You will receive a confirmation email shortly</p>
							<p>• A driver will be assigned and will contact you before pickup</p>
							<p>• You can view this appointment in your bookings</p>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
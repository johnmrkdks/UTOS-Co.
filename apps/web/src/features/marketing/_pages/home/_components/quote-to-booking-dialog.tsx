import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Calendar, Clock, MapPin, User, Phone, Mail, Users, MessageSquare, CreditCard, ArrowRight, X } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { useCreateCustomBookingFromQuoteMutation } from "../_hooks/mutation/use-create-custom-booking-from-quote-mutation"
import { authClient } from "@/lib/auth-client"

const bookingDetailsSchema = z.object({
	customerName: z.string().min(2, "Name must be at least 2 characters"),
	customerPhone: z.string().min(10, "Please enter a valid phone number"),
	customerEmail: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
	passengerCount: z.number().int().min(1, "At least 1 passenger required").max(8, "Maximum 8 passengers allowed"),
	scheduledPickupTime: z.date({
		message: "Please select a pickup date and time",
	}),
	specialRequests: z.string().optional(),
})

type BookingDetailsForm = z.infer<typeof bookingDetailsSchema>

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

interface RouteData {
	originAddress: string
	destinationAddress: string
	originLatitude?: number
	originLongitude?: number
	destinationLatitude?: number
	destinationLongitude?: number
	stops: Array<{
		address: string
		latitude?: number
		longitude?: number
	}>
}

interface QuoteToBookingDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	quote: QuoteResult
	routeData: RouteData
	onBookingConfirmed: (bookingId: string) => void
}

type BookingStep = "details" | "confirmation" | "processing" | "success"

export function QuoteToBookingDialog({
	open,
	onOpenChange,
	quote,
	routeData,
	onBookingConfirmed,
}: QuoteToBookingDialogProps) {
	const [currentStep, setCurrentStep] = useState<BookingStep>("details")
	const [bookingId, setBookingId] = useState<string | null>(null)
	const createBookingMutation = useCreateCustomBookingFromQuoteMutation()
	const { data: session } = authClient.useSession()

	const form = useForm<BookingDetailsForm>({
		resolver: zodResolver(bookingDetailsSchema),
		defaultValues: {
			customerName: "",
			customerPhone: "",
			customerEmail: "",
			passengerCount: 1,
			scheduledPickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
			specialRequests: "",
		},
	})

	const handleSubmit = async (data: BookingDetailsForm) => {
		if (!session?.user?.id) {
			// If user is not logged in, redirect to login
			authClient.signIn.social({ provider: "google" });
			return;
		}

		setCurrentStep("processing")
		
		try {
			const result = await createBookingMutation.mutateAsync({
				userId: session.user.id,
				
				// Route data from quote
				originAddress: routeData.originAddress,
				originLatitude: routeData.originLatitude,
				originLongitude: routeData.originLongitude,
				destinationAddress: routeData.destinationAddress,
				destinationLatitude: routeData.destinationLatitude,
				destinationLongitude: routeData.destinationLongitude,
				
				// Stops from quote
				stops: routeData.stops,
				
				// Timing
				scheduledPickupTime: data.scheduledPickupTime.toISOString(),
				estimatedDuration: quote.estimatedDuration,
				estimatedDistance: quote.estimatedDistance,
				
				// Pricing from quote
				baseFare: quote.baseFare,
				distanceFare: quote.distanceFare,
				timeFare: quote.timeFare || 0,
				extraCharges: quote.extraCharges,
				quotedAmount: quote.totalAmount,
				
				// Customer details
				customerName: data.customerName,
				customerPhone: data.customerPhone,
				customerEmail: data.customerEmail || undefined,
				passengerCount: data.passengerCount,
				specialRequests: data.specialRequests,
			})
			
			setBookingId(result?.id || null)
			setCurrentStep("success")

			setTimeout(() => {
				if (result?.id) onBookingConfirmed(result.id)
				onOpenChange(false)
				resetForm()
			}, 3000)
		} catch (error) {
			console.error("Booking creation failed:", error)
			setCurrentStep("details")
		}
	}

	const resetForm = () => {
		setCurrentStep("details")
		setBookingId(null)
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
						<CreditCard className="h-5 w-5 text-primary" />
						Book This Journey
					</DialogTitle>
					<DialogDescription>
						{currentStep === "details" && "Enter your details to confirm this booking"}
						{currentStep === "confirmation" && "Review your booking details before confirming"}
						{currentStep === "processing" && "Creating your booking..."}
						{currentStep === "success" && "Booking confirmed successfully!"}
					</DialogDescription>
				</DialogHeader>

				{/* Booking Details Step */}
				{currentStep === "details" && (
					<div className="space-y-6">
						{/* Trip Summary */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-lg">Journey Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{/* Route Display */}
								<div className="space-y-2 text-sm">
									<div className="flex items-start gap-2">
										<div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
										<div>
											<div className="font-medium">From</div>
											<div className="text-muted-foreground">{routeData.originAddress}</div>
										</div>
									</div>
									{routeData.stops.map((stop, index) => (
										<div key={index} className="flex items-start gap-2">
											<div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
											<div>
												<div className="font-medium">Stop {index + 1}</div>
												<div className="text-muted-foreground">{stop.address}</div>
											</div>
										</div>
									))}
									<div className="flex items-start gap-2">
										<div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
										<div>
											<div className="font-medium">To</div>
											<div className="text-muted-foreground">{routeData.destinationAddress}</div>
										</div>
									</div>
								</div>

								{/* Journey Info */}
								<div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
									<div className="flex items-center gap-1">
										<MapPin className="h-4 w-4" />
										{(quote.estimatedDistance / 1000).toFixed(1)} km
									</div>
									<div className="flex items-center gap-1">
										<Clock className="h-4 w-4" />
										{Math.round(quote.estimatedDuration / 60)} min
									</div>
									<div className="flex items-center gap-1">
										<CreditCard className="h-4 w-4" />
										${quote.totalAmount.toFixed(2)}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Customer Details Form */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-lg">Your Details</CardTitle>
								<CardDescription>
									Please provide your information for this booking
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Form {...form as any}>
									<form onSubmit={form.handleSubmit(goToConfirmation)} className="space-y-4">
										{/* Name and Phone */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FormField
												control={form.control as any}
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
												control={form.control as any}
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

										{/* Email and Passenger Count */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FormField
												control={form.control as any}
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
												control={form.control as any}
												name="passengerCount"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Number of Passengers *</FormLabel>
														<FormControl>
															<Input
																{...field}
																type="number"
																min="1"
																max="8"
																onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										{/* Pickup Time */}
										<FormField
											control={form.control as any}
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
													<p className="text-xs text-muted-foreground">
														Minimum 1 hour advance booking required
													</p>
												</FormItem>
											)}
										/>

										{/* Special Requests */}
										<FormField
											control={form.control as any}
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

										{/* Action Buttons */}
										<div className="flex flex-col gap-3 pt-4">
											<Button type="submit" className="w-full">
												Review Booking
												<ArrowRight className="ml-2 h-4 w-4" />
											</Button>
											<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
												Cancel
											</Button>
										</div>
									</form>
								</Form>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Confirmation Step */}
				{currentStep === "confirmation" && (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Confirm Your Booking</CardTitle>
								<CardDescription>
									Please review all details before confirming your luxury chauffeur service
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
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
								</div>

								<Separator />

								{/* Journey Details */}
								<div className="space-y-3">
									<h4 className="font-medium">Journey Details</h4>
									<div className="space-y-2 text-sm">
										<div>
											<span className="text-muted-foreground">Pickup:</span>
											<div className="font-medium">{formatDateTime(form.getValues("scheduledPickupTime"))}</div>
										</div>
										<div>
											<span className="text-muted-foreground">Duration:</span>
											<div className="font-medium">~{Math.round(quote.estimatedDuration / 60)} minutes</div>
										</div>
										{form.getValues("specialRequests") && (
											<div>
												<span className="text-muted-foreground">Special Requests:</span>
												<div className="font-medium">{form.getValues("specialRequests")}</div>
											</div>
										)}
									</div>
								</div>

								<Separator />

								{/* Pricing Summary */}
								<div className="space-y-3">
									<h4 className="font-medium">Pricing Summary</h4>
									<div className="space-y-1 text-sm">
										<div className="flex justify-between">
											<span>Base fare</span>
											<span>${(quote.baseFare / 100).toFixed(2)}</span>
										</div>
										<div className="flex justify-between">
											<span>Distance fare</span>
											<span>${(quote.distanceFare / 100).toFixed(2)}</span>
										</div>
										{quote.extraCharges > 0 && (
											<div className="flex justify-between">
												<span>Extra charges</span>
												<span>${(quote.extraCharges / 100).toFixed(2)}</span>
											</div>
										)}
										<Separator />
										<div className="flex justify-between font-bold text-lg">
											<span>Total Amount</span>
											<span className="text-primary">${quote.totalAmount.toFixed(2)}</span>
										</div>
									</div>
								</div>

								{/* Important Notes */}
								<div className="bg-muted/50 p-3 rounded-lg space-y-2">
									<h5 className="font-medium text-sm">Important Information</h5>
									<ul className="text-xs text-muted-foreground space-y-1">
										<li>• Payment will be processed upon confirmation</li>
										<li>• A driver will be assigned and will contact you before pickup</li>
										<li>• Cancellation policy: Free cancellation up to 2 hours before pickup</li>
										<li>• This is an estimate - final amount may vary based on actual distance and time</li>
									</ul>
								</div>

								{/* Action Buttons */}
								<div className="flex flex-col gap-3 pt-4">
									<Button onClick={() => handleSubmit(form.getValues())} className="w-full">
										Confirm & Book Journey
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
							<h3 className="text-lg font-medium">Creating Your Booking...</h3>
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
							<h3 className="text-xl font-bold text-green-600">Booking Confirmed!</h3>
							<p className="text-muted-foreground">
								Your luxury chauffeur service has been booked successfully.
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
							<p>• You can view this booking in your dashboard</p>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
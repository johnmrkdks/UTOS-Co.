import { CheckCircle, Users, Clock, Car } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import type { CarAppointmentForm } from "../../_schemas/car-appointment-schema"

interface CarBookingConfirmationProps {
	car: any
	formData: CarAppointmentForm
	onConfirm: () => void
	onBack: () => void
}

export function CarBookingConfirmation({ car, formData, onConfirm, onBack }: CarBookingConfirmationProps) {
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

	return (
		<div className="grid gap-8 lg:grid-cols-3">
			{/* Main Content */}
			<div className="lg:col-span-2">
				<Card className="border-0 shadow-lg">
					<CardHeader className="border-b bg-primary/5 pb-6">
						<CardTitle className="text-2xl">Confirm Your Appointment</CardTitle>
						<CardDescription className="text-base">
							Please review all details before confirming your chauffeur service
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-8">
						<div className="space-y-8">
							{/* Service Details */}
							<div>
								<h4 className="mb-4 text-lg font-semibold">Service Information</h4>
								<div className="grid gap-6 sm:grid-cols-2">
									<div className="space-y-3">
										<div>
											<span className="text-sm text-muted-foreground">Pickup Date & Time</span>
											<div className="text-base font-medium">{formatDateTime(formData.scheduledPickupTime)}</div>
										</div>
										<div>
											<span className="text-sm text-muted-foreground">Passengers</span>
											<div className="text-base font-medium">{formData.passengerCount} person(s)</div>
										</div>
										<div>
											<span className="text-sm text-muted-foreground">Service Type</span>
											<div className="text-base font-medium">Distance-based luxury chauffeur</div>
										</div>
									</div>
									<div className="space-y-3">
										<div>
											<span className="text-sm text-muted-foreground">Pickup Location</span>
											<div className="text-base font-medium">{formData.originAddress}</div>
										</div>
										<div>
											<span className="text-sm text-muted-foreground">Destination</span>
											<div className="text-base font-medium">{formData.destinationAddress}</div>
										</div>
									</div>
								</div>
							</div>

							<Separator />

							{/* Customer Details */}
							<div>
								<h4 className="mb-4 text-lg font-semibold">Contact Information</h4>
								<div className="grid gap-6 sm:grid-cols-2">
									<div>
										<span className="text-sm text-muted-foreground">Full Name</span>
										<div className="text-base font-medium">{formData.customerName}</div>
									</div>
									<div>
										<span className="text-sm text-muted-foreground">Phone Number</span>
										<div className="text-base font-medium">{formData.customerPhone}</div>
									</div>
									<div>
										<span className="text-sm text-muted-foreground">Email Address</span>
										<div className="text-base font-medium">{formData.customerEmail || "Not provided"}</div>
									</div>
								</div>
								{formData.specialRequests && (
									<div className="mt-4">
										<span className="text-sm text-muted-foreground">Special Requests</span>
										<div className="mt-1 rounded-lg bg-muted/50 p-3 text-sm">{formData.specialRequests}</div>
									</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
					<Button onClick={onConfirm} size="lg" className="text-base font-semibold">
						Confirm Appointment
						<CheckCircle className="ml-2 h-5 w-5" />
					</Button>
					<Button variant="outline" size="lg" onClick={onBack} className="text-base sm:w-auto sm:px-8">
						Back to Edit Details
					</Button>
				</div>
			</div>

			{/* Summary Sidebar */}
			<div className="lg:col-span-1">
				<div className="sticky top-8">
					<Card className="border-0 shadow-lg">
						<CardHeader className="border-b bg-green-50 pb-4">
							<CardTitle className="text-lg text-green-800">Ready to Book</CardTitle>
						</CardHeader>
						<CardContent className="pt-6">
							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<Car className="h-5 w-5 text-muted-foreground" />
									<div>
										<div className="font-medium">{car.model?.brand?.name} {car.model?.name}</div>
										<div className="text-sm text-muted-foreground">{car.category?.name}</div>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<Users className="h-5 w-5 text-muted-foreground" />
									<span className="text-sm">{formData.passengerCount} of {car.seatingCapacity} passengers</span>
								</div>
								<div className="flex items-center gap-3">
									<Clock className="h-5 w-5 text-muted-foreground" />
									<span className="text-sm">Distance-based pricing</span>
								</div>
							</div>

							<Separator className="my-6" />

							<div className="space-y-3 text-sm">
								<div className="flex items-center gap-2 text-green-600">
									<CheckCircle className="h-4 w-4" />
									<span>Free cancellation</span>
								</div>
								<div className="flex items-center gap-2 text-green-600">
									<CheckCircle className="h-4 w-4" />
									<span>Professional chauffeur</span>
								</div>
								<div className="flex items-center gap-2 text-green-600">
									<CheckCircle className="h-4 w-4" />
									<span>Luxury vehicle</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}

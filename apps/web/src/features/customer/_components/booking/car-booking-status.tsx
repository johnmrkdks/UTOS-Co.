import { CheckCircle } from "lucide-react"
import { Card, CardContent } from "@workspace/ui/components/card"
import type { BookingStep } from "../../_schemas/car-appointment-schema"

interface CarBookingStatusProps {
	currentStep: BookingStep
	bookingId?: string | null
}

export function CarBookingStatus({ currentStep, bookingId }: CarBookingStatusProps) {
	if (currentStep === "processing") {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Card className="border-0 shadow-lg">
					<CardContent className="p-12 text-center">
						<div className="mx-auto mb-6 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
						<div className="space-y-3">
							<h3 className="text-2xl font-bold">Creating Your Appointment...</h3>
							<p className="text-lg text-muted-foreground">Please wait while we process your request</p>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (currentStep === "success") {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Card className="border-0 shadow-lg">
					<CardContent className="p-12 text-center">
						<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
							<CheckCircle className="h-10 w-10 text-green-600" />
						</div>
						<div className="space-y-4">
							<h3 className="text-3xl font-bold text-green-600">Appointment Confirmed!</h3>
							<p className="text-lg text-muted-foreground">
								Your luxury chauffeur appointment has been booked successfully.
							</p>
							{bookingId && (
								<div className="mx-auto max-w-sm rounded-lg bg-green-50 p-4">
									<p className="text-sm text-green-800">
										<span className="font-medium">Booking Reference:</span> {bookingId}
									</p>
								</div>
							)}
						</div>
						<div className="mt-8 space-y-2 text-muted-foreground">
							<p>• You will receive a confirmation email shortly</p>
							<p>• A driver will be assigned and will contact you before pickup</p>
							<p>• Redirecting to your bookings in a moment...</p>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	return null
}
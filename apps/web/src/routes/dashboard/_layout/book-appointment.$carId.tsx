import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Car } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CarBookingConfirmation } from "@/features/customer/_components/booking/car-booking-confirmation";
import { CarBookingForm } from "@/features/customer/_components/booking/car-booking-form";
import { CarBookingStatus } from "@/features/customer/_components/booking/car-booking-status";
import { CarBookingSteps } from "@/features/customer/_components/booking/car-booking-steps";
import { CarDisplay } from "@/features/customer/_components/booking/car-display";
import { useCreateCustomBookingMutation } from "@/features/customer/_hooks/mutation/use-create-custom-booking-mutation";
import { useGetCarQuery } from "@/features/customer/_hooks/query/use-get-car-query";
import type {
	BookingStep,
	CarAppointmentForm,
} from "@/features/customer/_schemas/car-appointment-schema";
import { authClient } from "@/lib/auth-client";
import { createLocalDateForBackend } from "@/utils/timezone";

export const Route = createFileRoute(
	"/dashboard/_layout/book-appointment/$carId",
)({
	component: CarBookingPage,
});

function CarBookingPage() {
	const { carId } = Route.useParams();
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState<BookingStep>("details");
	const [bookingId, setBookingId] = useState<string | null>(null);
	const [formData, setFormData] = useState<CarAppointmentForm | null>(null);
	const [originGeometry, setOriginGeometry] = useState<any>(null);
	const [destinationGeometry, setDestinationGeometry] = useState<any>(null);

	const { data: session } = authClient.useSession();
	const {
		data: car,
		isLoading: carLoading,
		error: carError,
	} = useGetCarQuery({ id: carId });

	const createCustomBookingMutation = useCreateCustomBookingMutation();

	const handleFormSubmit = (
		data: CarAppointmentForm,
		originGeo: any,
		destinationGeo: any,
	) => {
		setFormData(data);
		setOriginGeometry(originGeo);
		setDestinationGeometry(destinationGeo);
		setCurrentStep("confirmation");
	};

	const handleConfirmBooking = async () => {
		if (!session?.user?.id || !formData) {
			authClient.signIn.social({ provider: "google" });
			return;
		}

		setCurrentStep("processing");

		try {
			// Calculate base pricing for custom booking
			const baseFare = 5000; // $50.00 base fare in cents
			const estimatedDistance = 10000; // 10km default estimate in meters
			const distanceFare = Math.round(estimatedDistance * 0.002 * 100); // $2 per km in cents
			const totalAmount = baseFare + distanceFare;

			// Ensure scheduledPickupTime is a proper Date object and use timezone-aware conversion
			const pickupTime =
				formData.scheduledPickupTime instanceof Date
					? formData.scheduledPickupTime
					: new Date(formData.scheduledPickupTime);

			// Extract date and time components for timezone-aware handling
			const dateString = pickupTime.toISOString().split("T")[0];
			const timeString = pickupTime
				.toTimeString()
				.split(" ")[0]
				.substring(0, 5); // HH:MM format

			await createCustomBookingMutation.mutateAsync(
				{
					carId: car?.id || carId,
					userId: session.user.id,

					// Route information
					originAddress: formData.originAddress,
					originLatitude: originGeometry?.location?.lat?.(),
					originLongitude: originGeometry?.location?.lng?.(),
					destinationAddress: formData.destinationAddress,
					destinationLatitude: destinationGeometry?.location?.lat?.(),
					destinationLongitude: destinationGeometry?.location?.lng?.(),

					// Timing - send timezone-aware ISO string
					scheduledPickupTime: createLocalDateForBackend(
						dateString,
						timeString,
					),
					estimatedDistance,

					// Pricing
					baseFare,
					distanceFare,
					quotedAmount: totalAmount,

					// Customer details
					customerName: formData.customerName,
					customerPhone: formData.customerPhone,
					customerEmail: formData.customerEmail || undefined,
					passengerCount: formData.passengerCount,
					specialRequests: formData.specialRequests,
				},
				{
					onSuccess: (data) => {
						toast.success("Appointment booked successfully!", {
							description: `Your luxury chauffeur appointment has been confirmed. Booking ID: ${data?.id || "N/A"}`,
						});
						setBookingId(data?.id || null);
						setCurrentStep("success");

						// Redirect to bookings page after success
						setTimeout(() => {
							navigate({ to: "/admin/dashboard/bookings" });
						}, 3000);
					},
					onError: (error) => {
						toast.error("Failed to book appointment", {
							description:
								error.message ||
								"Please try again or contact support if the problem persists.",
						});
						setCurrentStep("details");
					},
				},
			);
		} catch (error) {
			console.error("Appointment booking failed:", error);
			setCurrentStep("details");
		}
	};

	const goBackToDetails = () => {
		setCurrentStep("details");
	};

	const goBackToCars = () => {
		navigate({ to: "/fleet" });
	};

	if (carLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background to-muted/20 px-2 py-4 sm:px-4 sm:py-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<div className="space-y-6">
						<div className="h-8 w-48 animate-pulse rounded bg-muted" />
						<div className="h-64 animate-pulse rounded bg-muted" />
					</div>
				</div>
			</div>
		);
	}

	if (carError || !car) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background to-muted/20 px-2 py-4 sm:px-4 sm:py-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<div className="space-y-6">
						<Alert>
							<Car className="h-4 w-4" />
							<AlertDescription>
								Car not found or error loading car details. Please try again.
							</AlertDescription>
						</Alert>
						<Button onClick={goBackToCars} variant="outline">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Cars
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted/20 px-2 py-4 sm:px-4 sm:py-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				{/* Header */}
				<div className="mb-4 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
					<div className="space-y-1">
						<h1 className="font-bold text-xl tracking-tight sm:text-3xl lg:text-4xl">
							Book Appointment
						</h1>
						<p className="text-muted-foreground text-sm sm:text-lg">
							Schedule your luxury chauffeur service
						</p>
					</div>
					<Button
						onClick={goBackToCars}
						variant="outline"
						size="sm"
						className="self-start text-xs sm:self-center sm:text-sm"
					>
						<ArrowLeft className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
						Back to Cars
					</Button>
				</div>

				{/* Progress Indicator */}
				<CarBookingSteps currentStep={currentStep} />

				{/* Car Display */}
				<CarDisplay car={car} />

				{/* Booking Steps */}
				{currentStep === "details" && (
					<CarBookingForm
						car={car}
						onSubmit={handleFormSubmit}
						onCancel={goBackToCars}
					/>
				)}

				{currentStep === "confirmation" && formData && (
					<CarBookingConfirmation
						car={car}
						formData={formData}
						onConfirm={handleConfirmBooking}
						onBack={goBackToDetails}
					/>
				)}

				{/* Processing and Success States */}
				<CarBookingStatus currentStep={currentStep} bookingId={bookingId} />
			</div>
		</div>
	);
}

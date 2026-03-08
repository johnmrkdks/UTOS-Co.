// @ts-nocheck
import { useState, lazy, Suspense } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { X, Loader2 } from "lucide-react"

// Lazy load the heavy components
const EnhancedCustomBookingForm = lazy(() =>
	import("./custom-booking/enhanced-custom-booking-form").then(module => ({
		default: module.EnhancedCustomBookingForm
	}))
)
const EnhancedQuoteDisplay = lazy(() =>
	import("./custom-booking/enhanced-quote-display").then(module => ({
		default: module.EnhancedQuoteDisplay
	}))
)

import type { EnhancedCustomBookingForm as EnhancedFormData } from "./custom-booking/enhanced-custom-booking-form"
import type { QuoteResult } from "../_types/booking"
import { useGetCarsQuery } from "../../car-management/_hooks/query/car/use-get-cars-query"
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider"
import { useCalculateInstantQuoteMutation } from "../_hooks/query/use-calculate-instant-quote-mutation"
import { useAdminCreateCustomBookingMutation } from "../_hooks/query/use-admin-create-custom-booking-mutation"
import { createLocalDateForBackend } from "@/utils/timezone"

export function CreateCustomBookingDialog() {
	const { isCreateCustomBookingDialogOpen, closeCreateCustomBookingDialog } = useBookingManagementModalProvider()
	const [quote, setQuote] = useState<QuoteResult | null>(null)
	const [isCalculatingQuote, setIsCalculatingQuote] = useState(false)
	const [currentFormData, setCurrentFormData] = useState<Partial<EnhancedFormData>>({})

	// Fetch data for dropdowns with enhanced car details only when dialog is open
	const { data: cars, isLoading: carsLoading } = useGetCarsQuery({
		limit: 50, // Reduced for faster loading
		enabled: isCreateCustomBookingDialogOpen, // Only fetch when dialog is open
	})

	const calculateQuoteMutation = useCalculateInstantQuoteMutation()
	const createCustomBookingMutation = useAdminCreateCustomBookingMutation(() => {
		closeCreateCustomBookingDialog()
		setQuote(null)
		setCurrentFormData({})
	})

	const handleCalculateQuote = (formData: EnhancedFormData) => {
		if (!formData.originLatitude || !formData.originLongitude ||
			!formData.destinationLatitude || !formData.destinationLongitude) {
			toast.error("Please select locations from the Google Places dropdown suggestions", {
				description: "Make sure to click on a location from the dropdown list that appears when typing addresses"
			})
			return
		}

		if (!formData.originAddress || !formData.destinationAddress) {
			toast.error("Origin and destination addresses are required", {
				description: "Please enter pickup and destination locations"
			})
			return
		}

		setCurrentFormData(formData)
		setIsCalculatingQuote(true)

		// Convert date and time to proper date object
		const scheduledPickupTime = createLocalDateForBackend(
			formData.scheduledPickupDate,
			formData.scheduledPickupTime
		)

		// Prepare stops data for quote calculation
		const stops = formData.stops?.map(stop => ({
			address: stop.address,
			latitude: stop.latitude || 0,
			longitude: stop.longitude || 0,
			waitingTime: stop.waitingTime || 5,
		})) || []

		const mutationPayload = {
			originAddress: formData.originAddress,
			destinationAddress: formData.destinationAddress,
			originLatitude: formData.originLatitude,
			originLongitude: formData.originLongitude,
			destinationLatitude: formData.destinationLatitude,
			destinationLongitude: formData.destinationLongitude,
			stops,
			carId: formData.carId,
			scheduledPickupTime: new Date(scheduledPickupTime),
			passengerCount: formData.passengerCount,
		};


		calculateQuoteMutation.mutate(
			mutationPayload,
			{
				onSuccess: (data: QuoteResult) => {
					setQuote(data)
					setIsCalculatingQuote(false)
					toast.success("Quote calculated successfully!")
				},
				onError: (error: any) => {
					setIsCalculatingQuote(false)
					toast.error("Failed to calculate quote", {
						description: error.message || "Please check your addresses and try again"
					})
				},
			},
		)
	}

	const handleSubmit = (data: EnhancedFormData) => {
		if (!quote) {
			toast.error("Please calculate a quote first")
			return
		}
		if (currentFormData.clientType === "existing" && !data.userId) {
			toast.error("Please select an existing customer")
			return
		}

		// Convert date and time to ISO string for backend
		const scheduledPickupTime = createLocalDateForBackend(
			data.scheduledPickupDate,
			data.scheduledPickupTime
		)

		// Prepare stops with stopOrder
		const stopsWithOrder = data.stops?.map((stop, index) => ({
			address: stop.address,
			latitude: stop.latitude,
			longitude: stop.longitude,
			stopOrder: index + 1, // 1-based indexing
			waitingTime: stop.waitingTime || 5,
			notes: stop.notes || "",
		})) || []

		// Prepare the booking data for submission (admin creates for client - userId optional for walk-in)
		const bookingData = {
			carId: data.carId,
			userId: data.userId || undefined, // Omit for walk-in; backend uses admin's userId
			originAddress: data.originAddress,
			originLatitude: data.originLatitude,
			originLongitude: data.originLongitude,
			destinationAddress: data.destinationAddress,
			destinationLatitude: data.destinationLatitude,
			destinationLongitude: data.destinationLongitude,
			scheduledPickupTime: scheduledPickupTime, // Already converted to ISO string
			customerName: data.customerName,
			customerPhone: data.customerPhone,
			customerEmail: data.customerEmail || "",
			passengerCount: data.passengerCount,
			luggageCount: data.luggageCount || 0,
			specialRequests: data.specialRequests || "",
			stops: stopsWithOrder,
			// Quote data - mapping from InstantQuote interface to schema requirements
			quotedAmount: quote.totalAmount,
			baseFare: quote.firstKmFare,
			distanceFare: quote.additionalKmFare,
			timeFare: 0, // InstantQuote doesn't include time-based fare
			estimatedDistance: quote.estimatedDistance,
			estimatedDuration: quote.estimatedDuration,
		}

		console.log("🔍 Creating custom booking with data:", bookingData);

		createCustomBookingMutation.mutate(bookingData)
	}

	const handleClose = () => {
		if (!createCustomBookingMutation.isPending) {
			closeCreateCustomBookingDialog()
			setQuote(null)
			setCurrentFormData({})
		}
	}

	// Find selected car for quote display
	const selectedCar = currentFormData.carId && cars?.data
		? cars.data.find(car => car.id === currentFormData.carId)
		: null

	return (
		<Dialog open={isCreateCustomBookingDialogOpen} onOpenChange={handleClose}>
			<DialogContent className="w-full !max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" showCloseButton={false}>
				<DialogHeader className="flex-shrink-0">
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle>Create Custom Booking</DialogTitle>
							<DialogDescription>
								Create custom bookings with Google Places integration, multiple stops, and accurate pricing.
							</DialogDescription>
						</div>
						<Button variant="ghost" size="icon" onClick={handleClose} disabled={createCustomBookingMutation.isPending}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
						{/* Form - Main content */}
						<div className="lg:col-span-2">
							<Suspense fallback={
								<div className="flex items-center justify-center h-64">
									<Loader2 className="h-8 w-8 animate-spin" />
								</div>
							}>
								<EnhancedCustomBookingForm
									cars={cars?.data}
									carsLoading={carsLoading}
									onSubmit={handleSubmit}
									onCalculateQuote={handleCalculateQuote}
									onFormChange={setCurrentFormData}
									isSubmitting={createCustomBookingMutation.isPending}
									isCalculatingQuote={isCalculatingQuote}
									quote={quote}
									isAdminContext
								/>
							</Suspense>
						</div>

						{/* Quote Display - Right sidebar */}
						<div className="lg:col-span-1">
							<Suspense fallback={
								<div className="flex items-center justify-center h-64">
									<Loader2 className="h-8 w-8 animate-spin" />
								</div>
							}>
								<EnhancedQuoteDisplay
									quote={quote}
									isCalculating={isCalculatingQuote}
									formData={currentFormData}
									selectedCar={selectedCar}
									onCalculateQuote={handleCalculateQuote}
									canCalculateQuote={Boolean(
										currentFormData.originLatitude &&
										currentFormData.originLongitude &&
										currentFormData.destinationLatitude &&
										currentFormData.destinationLongitude &&
										currentFormData.carId
									)}
								/>
							</Suspense>
						</div>
					</div>
				</div>

				{/* Sticky Create Booking Button */}
				<div className="flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={handleClose}
							disabled={createCustomBookingMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!quote || createCustomBookingMutation.isPending}
							onClick={() => {
								// Trigger form submission
								const form = document.querySelector('form[data-enhanced-booking-form]') as HTMLFormElement;
								if (form) {
									form.requestSubmit();
								}
							}}
						>
							{createCustomBookingMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating Booking...
								</>
							) : (
								'Create Booking'
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}



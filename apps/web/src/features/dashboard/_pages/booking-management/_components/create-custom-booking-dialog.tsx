import { useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { BookingForm } from "./custom-booking/custom-booking-form"
import { QuoteDisplay } from "./custom-booking/quote-display"
import type { CreateCustomBookingForm, QuoteResult } from "../_types/booking"
import { useGetCarsQuery } from "../../car-management/_hooks/query/car/use-get-cars-query"
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider"

const useCalculateInstantQuoteMutation = () => ({
	mutate: (data: any, options: any) => {
		setTimeout(() => {
			options.onSuccess({
				baseFare: 500,
				distanceFare: 1200,
				timeFare: 300,
				extraCharges: 0,
				totalAmount: 2000,
				estimatedDistance: 12000,
				estimatedDuration: 1800,
				breakdown: {
					baseRate: 500,
					perKmRate: 100,
					perMinuteRate: 10,
					minimumFare: 800,
				},
			})
		}, 1000)
	},
})

const useCreateCustomBookingMutation = (onSuccess: () => void) => ({
	mutate: (data: any) => {
		setTimeout(() => {
			toast.success("Booking created successfully!")
			onSuccess()
		}, 1000)
	},
	isPending: false,
})

export function CreateCustomBookingDialog() {
	const { isCreateCustomBookingDialogOpen, closeCreateCustomBookingDialog } = useBookingManagementModalProvider()
	const [quote, setQuote] = useState<QuoteResult | null>(null)
	const [isCalculatingQuote, setIsCalculatingQuote] = useState(false)

	// Fetch data for dropdowns
	const { data: cars, isLoading: carsLoading } = useGetCarsQuery({})

	const calculateQuoteMutation = useCalculateInstantQuoteMutation()
	const createCustomBookingMutation = useCreateCustomBookingMutation(() => {
		closeCreateCustomBookingDialog()
		setQuote(null)
	})

	const handleCalculateQuote = () => {
		// Mock coordinates for demo - in real app, you'd use geocoding
		const mockOriginLat = -33.8688
		const mockOriginLng = 151.2093
		const mockDestLat = -33.8731
		const mockDestLng = 151.2067

		setIsCalculatingQuote(true)
		calculateQuoteMutation.mutate(
			{
				originLatitude: mockOriginLat,
				originLongitude: mockOriginLng,
				destinationLatitude: mockDestLat,
				destinationLongitude: mockDestLng,
				carId: "1",
				scheduledPickupTime: new Date(),
			},
			{
				onSuccess: (data: QuoteResult) => {
					setQuote(data)
					setIsCalculatingQuote(false)
					toast.success("Quote calculated successfully!")
				},
				onError: () => {
					setIsCalculatingQuote(false)
					toast.error("Failed to calculate quote")
				},
			},
		)
	}

	const handleSubmit = (data: CreateCustomBookingForm) => {
		if (!quote) {
			toast.error("Please calculate a quote first")
			return
		}

		createCustomBookingMutation.mutate({
			...data,
			quotedAmount: quote.totalAmount,
			baseFare: quote.baseFare,
			distanceFare: quote.distanceFare,
			timeFare: quote.timeFare,
			estimatedDistance: quote.estimatedDistance,
			estimatedDuration: quote.estimatedDuration,
		})
	}

	const handleClose = () => {
		if (!createCustomBookingMutation.isPending) {
			closeCreateCustomBookingDialog()
			setQuote(null)
		}
	}

	return (
		<Dialog open={isCreateCustomBookingDialogOpen} onOpenChange={handleClose}>
			<DialogContent className="w-full min-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle>Create Custom Booking</DialogTitle>
							<DialogDescription>
								Create a custom booking with instant quote calculation based on route and time.
							</DialogDescription>
						</div>
						<Button variant="ghost" size="icon" onClick={handleClose} disabled={createCustomBookingMutation.isPending}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</DialogHeader>

				<div className="flex-1">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
						<div className="lg:col-span-2 overflow-y-auto pr-2">
							<BookingForm
								cars={cars?.data}
								carsLoading={carsLoading}
								onSubmit={handleSubmit}
								onCalculateQuote={handleCalculateQuote}
								isSubmitting={createCustomBookingMutation.isPending}
								isCalculatingQuote={isCalculatingQuote}
								quote={quote}
							/>
						</div>

						<div className="lg:col-span-1">
							<QuoteDisplay quote={quote} isCalculating={isCalculatingQuote} />
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}



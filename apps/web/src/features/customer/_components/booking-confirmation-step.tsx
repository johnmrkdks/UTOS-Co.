import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
	ArrowLeft,
	Calculator,
	Calendar,
	Car,
	CheckCircle,
	Mail,
	MapPin,
	MessageSquare,
	Phone,
	Route,
	User,
	Users,
} from "lucide-react";
import type { BookingDetailsFormData } from "../_schemas/instant-quote";
import type { QuoteResult, RouteData } from "../_types/instant-quote";

interface BookingConfirmationStepProps {
	bookingDetails: BookingDetailsFormData;
	quote: QuoteResult;
	routeData: RouteData;
	selectedCar?: any; // Car data from the API
	onConfirm: () => void;
	onBack: () => void;
	isProcessing?: boolean;
}

export function BookingConfirmationStep({
	bookingDetails,
	quote,
	routeData,
	selectedCar,
	onConfirm,
	onBack,
	isProcessing = false,
}: BookingConfirmationStepProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CheckCircle className="h-5 w-5" />
					Confirm Your Booking
				</CardTitle>
				<CardDescription>
					Please review all details before confirming
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Journey Summary */}
				<div>
					<h3 className="mb-3 flex items-center gap-2 font-medium">
						<Route className="h-4 w-4" />
						Journey Details
					</h3>
					<div className="space-y-2 text-sm">
						<div className="flex items-start gap-3">
							<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-green-500" />
							<div>
								<div className="font-medium">From</div>
								<div className="text-muted-foreground">
									{routeData.originAddress}
								</div>
							</div>
						</div>

						{routeData.stops?.map((stop, index) => (
							<div key={stop.id} className="ml-1 flex items-start gap-3">
								<div className="ml-1 h-8 w-1 bg-gray-300" />
								<div className="-mt-2">
									<div className="mb-1 h-2 w-2 rounded-full bg-blue-500" />
									<div className="text-xs">Stop {index + 1}</div>
									<div className="text-muted-foreground text-xs">
										{stop.address}
									</div>
								</div>
							</div>
						))}

						<div className="flex items-start gap-3">
							<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-red-500" />
							<div>
								<div className="font-medium">To</div>
								<div className="text-muted-foreground">
									{routeData.destinationAddress}
								</div>
							</div>
						</div>
					</div>
					<div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 p-2 text-muted-foreground text-xs">
						<MapPin className="h-3 w-3" />
						<span>
							{Number(quote.estimatedDistance ?? 0).toFixed(1)} km •{" "}
							{Math.round(quote.estimatedDuration / 60)} min journey
						</span>
					</div>
				</div>

				<Separator />

				{/* Vehicle Details */}
				{selectedCar && (
					<div>
						<h3 className="mb-3 flex items-center gap-2 font-medium">
							<Car className="h-4 w-4" />
							Selected Vehicle
						</h3>
						<div className="flex items-center gap-4 rounded-lg border p-3">
							{selectedCar.imageUrl && (
								<img
									src={selectedCar.imageUrl}
									alt={`${selectedCar.brandName} ${selectedCar.modelName}`}
									className="h-12 w-16 rounded object-cover"
								/>
							)}
							<div>
								<div className="font-medium">
									{selectedCar.brandName} {selectedCar.modelName}
								</div>
								<div className="flex items-center gap-3 text-muted-foreground text-sm">
									<span>{selectedCar.passengerCapacity} seats</span>
									<span>{selectedCar.categoryName}</span>
								</div>
							</div>
						</div>
					</div>
				)}

				<Separator />

				{/* Customer Information */}
				<div>
					<h3 className="mb-3 flex items-center gap-2 font-medium">
						<User className="h-4 w-4" />
						Booking Information
					</h3>
					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-3">
							<User className="h-4 w-4 text-muted-foreground" />
							<span>{bookingDetails.customerName}</span>
						</div>
						<div className="flex items-center gap-3">
							<Phone className="h-4 w-4 text-muted-foreground" />
							<span>{bookingDetails.customerPhone}</span>
						</div>
						{bookingDetails.customerEmail && (
							<div className="flex items-center gap-3">
								<Mail className="h-4 w-4 text-muted-foreground" />
								<span>{bookingDetails.customerEmail}</span>
							</div>
						)}
						<div className="flex items-center gap-3">
							<Users className="h-4 w-4 text-muted-foreground" />
							<span>
								{bookingDetails.passengerCount} passenger
								{bookingDetails.passengerCount > 1 ? "s" : ""}
							</span>
						</div>
						<div className="flex items-center gap-3">
							<Calendar className="h-4 w-4 text-muted-foreground" />
							<span>{bookingDetails.scheduledPickupTime.toLocaleString()}</span>
						</div>
						{bookingDetails.specialRequests && (
							<div className="flex items-start gap-3">
								<MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
								<span>{bookingDetails.specialRequests}</span>
							</div>
						)}
					</div>
				</div>

				<Separator />

				{/* Fare Summary */}
				<div>
					<h3 className="mb-3 flex items-center gap-2 font-medium">
						<Calculator className="h-4 w-4" />
						Fare Summary
					</h3>
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span>First {quote.breakdown?.firstKmDistance || 10}km</span>
							<span>${(quote.firstKmFare / 100).toFixed(2)}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span>Additional distance</span>
							<span>${(quote.additionalKmFare / 100).toFixed(2)}</span>
						</div>
						<Separator />
						<div className="flex justify-between font-bold">
							<span>Total Amount</span>
							<span className="text-primary">
								${quote.totalAmount.toFixed(2)}
							</span>
						</div>
					</div>
				</div>

				{/* Navigation Buttons */}
				<div className="flex justify-between pt-4">
					<Button variant="outline" onClick={onBack}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Button>
					<Button onClick={onConfirm} disabled={isProcessing}>
						{isProcessing ? "Processing Booking..." : "Confirm Booking"}
					</Button>
				</div>

				<p className="text-center text-muted-foreground text-xs">
					By confirming, you agree to our terms of service and cancellation
					policy.
				</p>
			</CardContent>
		</Card>
	);
}

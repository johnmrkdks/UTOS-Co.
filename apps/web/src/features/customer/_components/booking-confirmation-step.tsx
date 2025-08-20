import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Badge } from "@workspace/ui/components/badge";
import {
	CheckCircle,
	ArrowLeft,
	User,
	Phone,
	Mail,
	Users,
	Calendar,
	Car,
	MapPin,
	Calculator,
	MessageSquare,
	Route
} from "lucide-react";
import { type BookingDetailsFormData } from "../_schemas/instant-quote";
import { type QuoteResult, type RouteData } from "../_types/instant-quote";

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
	isProcessing = false
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
					<h3 className="font-medium flex items-center gap-2 mb-3">
						<Route className="h-4 w-4" />
						Journey Details
					</h3>
					<div className="space-y-2 text-sm">
						<div className="flex items-start gap-3">
							<div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
							<div>
								<div className="font-medium">From</div>
								<div className="text-muted-foreground">{routeData.originAddress}</div>
							</div>
						</div>
						
						{routeData.stops?.map((stop, index) => (
							<div key={stop.id} className="flex items-start gap-3 ml-1">
								<div className="w-1 h-8 bg-gray-300 ml-1" />
								<div className="-mt-2">
									<div className="w-2 h-2 rounded-full bg-blue-500 mb-1" />
									<div className="text-xs">Stop {index + 1}</div>
									<div className="text-xs text-muted-foreground">{stop.address}</div>
								</div>
							</div>
						))}
						
						<div className="flex items-start gap-3">
							<div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
							<div>
								<div className="font-medium">To</div>
								<div className="text-muted-foreground">{routeData.destinationAddress}</div>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg mt-3">
						<MapPin className="h-3 w-3" />
						<span>
							{(quote.estimatedDistance / 1000).toFixed(1)} km • {Math.round(quote.estimatedDuration / 60)} min journey
						</span>
					</div>
				</div>

				<Separator />

				{/* Vehicle Details */}
				{selectedCar && (
					<div>
						<h3 className="font-medium flex items-center gap-2 mb-3">
							<Car className="h-4 w-4" />
							Selected Vehicle
						</h3>
						<div className="flex items-center gap-4 p-3 border rounded-lg">
							{selectedCar.imageUrl && (
								<img
									src={selectedCar.imageUrl}
									alt={`${selectedCar.brandName} ${selectedCar.modelName}`}
									className="w-16 h-12 object-cover rounded"
								/>
							)}
							<div>
								<div className="font-medium">
									{selectedCar.brandName} {selectedCar.modelName}
								</div>
								<div className="flex items-center gap-3 text-sm text-muted-foreground">
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
					<h3 className="font-medium flex items-center gap-2 mb-3">
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
							<span>{bookingDetails.passengerCount} passenger{bookingDetails.passengerCount > 1 ? 's' : ''}</span>
						</div>
						<div className="flex items-center gap-3">
							<Calendar className="h-4 w-4 text-muted-foreground" />
							<span>{bookingDetails.scheduledPickupTime.toLocaleString()}</span>
						</div>
						{bookingDetails.specialRequests && (
							<div className="flex items-start gap-3">
								<MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
								<span>{bookingDetails.specialRequests}</span>
							</div>
						)}
					</div>
				</div>

				<Separator />

				{/* Fare Summary */}
				<div>
					<h3 className="font-medium flex items-center gap-2 mb-3">
						<Calculator className="h-4 w-4" />
						Fare Summary
					</h3>
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span>Base fare</span>
							<span>${(quote.baseFare / 100).toFixed(2)}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span>Distance fare</span>
							<span>${(quote.distanceFare / 100).toFixed(2)}</span>
						</div>
						{quote.extraCharges > 0 && (
							<div className="flex justify-between text-sm">
								<span>Extra charges</span>
								<span>${(quote.extraCharges / 100).toFixed(2)}</span>
							</div>
						)}
						<Separator />
						<div className="flex justify-between font-bold">
							<span>Total Amount</span>
							<span className="text-primary">${(quote.totalAmount / 100).toFixed(2)}</span>
						</div>
					</div>
				</div>

				{/* Navigation Buttons */}
				<div className="flex justify-between pt-4">
					<Button variant="outline" onClick={onBack}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<Button onClick={onConfirm} disabled={isProcessing}>
						{isProcessing ? "Processing Booking..." : "Confirm Booking"}
					</Button>
				</div>

				<p className="text-xs text-muted-foreground text-center">
					By confirming, you agree to our terms of service and cancellation policy.
				</p>
			</CardContent>
		</Card>
	);
}
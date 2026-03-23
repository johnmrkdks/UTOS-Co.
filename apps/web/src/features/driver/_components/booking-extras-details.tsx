import { Badge } from "@workspace/ui/components/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";

interface BookingExtrasDetailsProps {
	booking: {
		finalAmount?: number;
		quotedAmount: number;
		extraCharges?: number;
		extras?: {
			additionalWaitTime: number;
			unscheduledStops: number;
			parkingCharges: number;
			tollCharges: number;
			tollLocation?: string;
			otherChargesDescription?: string;
			otherChargesAmount: number;
			extraType: string;
			notes?: string;
			totalExtraAmount: number;
		} | null;
	};
}

export function BookingExtrasDetails({ booking }: BookingExtrasDetailsProps) {
	const { extras, finalAmount, quotedAmount, extraCharges } = booking;

	// Don't render if no extras
	if (!extras || !extraCharges || extraCharges === 0) {
		return null;
	}

	const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
	const formatTime = (minutes: number) => `${minutes} minutes`;

	return (
		<Card className="mt-4">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="font-medium text-sm">
						Trip Extras Added
					</CardTitle>
					<Badge variant="secondary" className="text-xs">
						{extras.extraType === "general"
							? "General Extra"
							: extras.extraType === "driver"
								? "Driver Extra"
								: "Operator Extra"}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{/* Fare Breakdown */}
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Original Fare:</span>
						<span>{formatCurrency(quotedAmount)}</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Extra Charges:</span>
						<span>{formatCurrency(extraCharges)}</span>
					</div>
					<Separator />
					<div className="flex justify-between font-medium text-sm">
						<span>Final Amount:</span>
						<span>{formatCurrency(finalAmount || quotedAmount)}</span>
					</div>
				</div>

				{/* Extras Breakdown */}
				<div className="space-y-2">
					<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
						Extras Details
					</h4>

					{extras.additionalWaitTime > 0 && (
						<div className="flex justify-between text-sm">
							<span>Additional Wait Time:</span>
							<span>{formatTime(extras.additionalWaitTime)}</span>
						</div>
					)}

					{extras.unscheduledStops > 0 && (
						<div className="flex justify-between text-sm">
							<span>Unscheduled Stops:</span>
							<span>{extras.unscheduledStops}</span>
						</div>
					)}

					{extras.parkingCharges > 0 && (
						<div className="flex justify-between text-sm">
							<span>Parking Charges:</span>
							<span>{formatCurrency(extras.parkingCharges)}</span>
						</div>
					)}

					{extras.tollCharges > 0 && (
						<div className="space-y-1">
							<div className="flex justify-between text-sm">
								<span>Toll Charges:</span>
								<span>{formatCurrency(extras.tollCharges)}</span>
							</div>
							{extras.tollLocation && (
								<div className="pl-4 text-muted-foreground text-xs">
									Location: {extras.tollLocation}
								</div>
							)}
						</div>
					)}

					{extras.otherChargesAmount > 0 && (
						<div className="space-y-1">
							<div className="flex justify-between text-sm">
								<span>Other Charges:</span>
								<span>{formatCurrency(extras.otherChargesAmount)}</span>
							</div>
							{extras.otherChargesDescription && (
								<div className="pl-4 text-muted-foreground text-xs">
									{extras.otherChargesDescription}
								</div>
							)}
						</div>
					)}

					{extras.notes && (
						<div className="space-y-1">
							<span className="font-medium text-sm">Driver Notes:</span>
							<div className="rounded-md bg-muted p-2 text-muted-foreground text-sm">
								{extras.notes}
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

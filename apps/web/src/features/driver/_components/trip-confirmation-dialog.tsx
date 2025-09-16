import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import type { ExtrasFormData } from "./close-trip-extras-form";

interface TripConfirmationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	booking: any;
	extrasData?: ExtrasFormData;
	totalCharges: number;
	onConfirm: () => void;
	onGoBack: () => void;
	isSubmitting?: boolean;
}

export function TripConfirmationDialog({
	open,
	onOpenChange,
	booking,
	extrasData,
	totalCharges,
	onConfirm,
	onGoBack,
	isSubmitting = false
}: TripConfirmationDialogProps) {
	const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

	const hasExtras = extrasData && (
		extrasData.additionalWaitTime > 0 ||
		extrasData.unscheduledStops > 0 ||
		extrasData.parkingCharges > 0 ||
		extrasData.tollCharges > 0 ||
		(extrasData.otherCharges?.amount || 0) > 0
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md mx-auto sm:max-h-[90vh] flex flex-col p-0 max-sm:w-full max-sm:h-full max-sm:m-0 max-sm:rounded-none max-sm:max-w-none">
				{/* Header */}
				<DialogHeader className="flex-shrink-0 p-4 border-b bg-white">
					<div className="flex items-center gap-3">
						<Button 
							variant="ghost" 
							size="sm" 
							onClick={onGoBack}
							className="h-8 w-8 p-0"
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<DialogTitle className="text-sm">Confirm job closure</DialogTitle>
					</div>
				</DialogHeader>

				{/* Scrollable Content */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{/* Confirmation Statement */}
					<div>
						<h3 className="text-sm font-medium mb-3">I confirm the following:</h3>
						
						{/* Fare Breakdown Card */}
						<Card className="border-primary/20 bg-primary/5 mb-3">
							<CardContent className="p-3">
								<div className="space-y-2">
									{/* Original Trip Fare */}
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium">Trip Fare</span>
										<span className="text-sm font-semibold">
											{formatCurrency((booking?.finalAmount || booking?.quotedAmount || 0) / 100)}
										</span>
									</div>

									{/* Extras (if any) */}
									{hasExtras && totalCharges > 0 ? (
										<div className="flex justify-between items-center">
											<span className="text-sm font-medium">Extras</span>
											<span className="text-sm font-semibold text-primary">
												+ {formatCurrency(totalCharges)}
											</span>
										</div>
									) : null}

									{/* Divider */}
									<div className="border-t border-primary/20"></div>

									{/* Total Fare */}
									<div className="flex justify-between items-center">
										<span className="text-sm font-bold">Total Trip Fare</span>
										<span className="text-sm font-bold text-primary">
											{formatCurrency(((booking?.finalAmount || booking?.quotedAmount || 0) / 100) + totalCharges)}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Booking Summary */}
						<Card className="border-0 bg-muted/30 mb-3">
							<CardContent className="p-3 space-y-1">
								<div className="flex items-center justify-between text-xs">
									<span className="font-medium">Trip ID: {booking?.id?.slice(-6).toUpperCase()}</span>
								</div>
								<div className="text-xs text-muted-foreground">
									<div className="flex items-start gap-2">
										<span className="font-medium">From:</span>
										<span className="flex-1">{booking?.originAddress}</span>
									</div>
									<div className="flex items-start gap-2 mt-1">
										<span className="font-medium">To:</span>
										<span className="flex-1">{booking?.destinationAddress}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Extras Summary */}
						{hasExtras && extrasData && (
							<div className="space-y-2 mb-3">
								<h4 className="font-medium text-xs">Extras included:</h4>
								<div className="space-y-1 text-xs">
									{extrasData.additionalWaitTime > 0 && (
										<div className="flex justify-between">
											<span>Additional wait time ({extrasData.additionalWaitTime} min)</span>
											<span className="font-medium">Calculated</span>
										</div>
									)}

									{extrasData.unscheduledStops > 0 && (
										<div className="flex justify-between">
											<span>Unscheduled stops ({extrasData.unscheduledStops})</span>
											<span className="font-medium">Calculated</span>
										</div>
									)}

									{extrasData.parkingCharges > 0 && (
										<div className="flex justify-between">
											<span>Parking charges</span>
											<span className="font-medium">{formatCurrency(extrasData.parkingCharges)}</span>
										</div>
									)}

									{extrasData.tollCharges > 0 && (
										<div className="flex justify-between">
											<span>Toll charges</span>
											<span className="font-medium">{formatCurrency(extrasData.tollCharges)}</span>
										</div>
									)}

									{(extrasData.otherCharges?.amount || 0) > 0 && (
										<div className="flex justify-between">
											<span>Other charges</span>
											<span className="font-medium">{formatCurrency(extrasData.otherCharges?.amount || 0)}</span>
										</div>
									)}

									{extrasData.location && (
										<div className="pt-2 border-t">
											<div className="flex justify-between">
												<span>Location:</span>
												<span className="font-medium">{extrasData.location}</span>
											</div>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Important Note */}
						<Card className="border-primary/20 bg-primary/5">
							<CardContent className="p-3">
								<div className="flex items-start gap-2">
									<AlertTriangle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
									<div className="text-xs text-primary/80">
										<p className="font-medium mb-1">Important Notice</p>
										<p className="text-xs leading-relaxed">
											Extra charges shown are estimates and are not final until they have been 
											reviewed and approved by the operator. Final amounts may differ based on 
											company policies and verification.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Sticky Footer */}
				<div className="flex-shrink-0 p-4 border-t bg-white">
					<div className="space-y-2">
						<Button
							onClick={onConfirm}
							disabled={isSubmitting}
							className="w-full h-10 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
						>
							{isSubmitting ? (
								<>
									<div className="w-3 h-3 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
									Closing trip...
								</>
							) : (
								'Confirm & close trip'
							)}
						</Button>

						{hasExtras && (
							<Button
								onClick={onGoBack}
								variant="outline"
								disabled={isSubmitting}
								className="w-full h-9 text-sm font-medium"
							>
								Go back and edit extras
							</Button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
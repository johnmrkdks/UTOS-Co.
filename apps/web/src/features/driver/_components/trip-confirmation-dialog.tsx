import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { AlertTriangle, ArrowLeft, X } from "lucide-react";
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
	isSubmitting = false,
}: TripConfirmationDialogProps) {
	const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

	const hasExtras =
		extrasData &&
		(extrasData.additionalWaitTime > 0 ||
			extrasData.unscheduledStops > 0 ||
			extrasData.parkingCharges > 0 ||
			extrasData.tollCharges > 0 ||
			(extrasData.otherCharges?.amount || 0) > 0);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="mx-auto flex flex-col p-0 max-sm:m-0 max-sm:h-full max-sm:w-full max-sm:max-w-none max-sm:rounded-none sm:max-h-[90vh] sm:max-w-md"
				showCloseButton={false}
			>
				{/* Header */}
				<DialogHeader className="flex-shrink-0 border-b bg-white p-4">
					<div className="flex items-center justify-between gap-3">
						<Button
							variant="ghost"
							size="sm"
							onClick={onGoBack}
							className="-ml-2 h-10 w-10 shrink-0 p-0"
						>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<DialogTitle className="flex-1 text-center text-sm">
							Confirm job closure
						</DialogTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onOpenChange(false)}
							className="-mr-2 h-10 w-10 shrink-0 p-0"
							aria-label="Close"
						>
							<X className="h-5 w-5" />
						</Button>
					</div>
				</DialogHeader>

				{/* Scrollable Content */}
				<div className="flex-1 space-y-4 overflow-y-auto p-4">
					{/* Confirmation Statement */}
					<div>
						<h3 className="mb-3 font-medium text-sm">
							I confirm the following:
						</h3>

						{/* Fare Breakdown Card */}
						<Card className="mb-3 border-primary/20 bg-primary/5">
							<CardContent className="p-3">
								<div className="space-y-2">
									{/* Original Trip Fare */}
									<div className="flex items-center justify-between">
										<span className="font-medium text-sm">Trip Fare</span>
										<span className="font-semibold text-sm">
											{formatCurrency(
												booking?.finalAmount || booking?.quotedAmount || 0,
											)}
										</span>
									</div>

									{/* Extras (if any) */}
									{hasExtras && totalCharges > 0 ? (
										<div className="flex items-center justify-between">
											<span className="font-medium text-sm">Extras</span>
											<span className="font-semibold text-primary text-sm">
												+ {formatCurrency(totalCharges)}
											</span>
										</div>
									) : null}

									{/* Divider */}
									<div className="border-primary/20 border-t" />

									{/* Total Fare */}
									<div className="flex items-center justify-between">
										<span className="font-bold text-sm">Total Trip Fare</span>
										<span className="font-bold text-primary text-sm">
											{formatCurrency(
												(booking?.finalAmount || booking?.quotedAmount || 0) +
													totalCharges,
											)}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Booking Summary */}
						<Card className="mb-3 border-0 bg-muted/30">
							<CardContent className="space-y-1 p-3">
								<div className="flex items-center justify-between text-xs">
									<span className="font-medium">
										Trip ID: {booking?.id?.slice(-6).toUpperCase()}
									</span>
								</div>
								<div className="text-muted-foreground text-xs">
									<div className="flex items-start gap-2">
										<span className="font-medium">From:</span>
										<span className="flex-1">{booking?.originAddress}</span>
									</div>
									<div className="mt-1 flex items-start gap-2">
										<span className="font-medium">To:</span>
										<span className="flex-1">
											{booking?.destinationAddress}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Extras Summary */}
						{hasExtras && extrasData && (
							<div className="mb-3 space-y-2">
								<h4 className="font-medium text-xs">Extras included:</h4>
								<div className="space-y-1 text-xs">
									{extrasData.additionalWaitTime > 0 && (
										<div className="flex justify-between">
											<span>
												Additional wait time ({extrasData.additionalWaitTime}{" "}
												min)
											</span>
											<span className="font-medium">Calculated</span>
										</div>
									)}

									{extrasData.unscheduledStops > 0 && (
										<div className="flex justify-between">
											<span>
												Unscheduled stops ({extrasData.unscheduledStops})
											</span>
											<span className="font-medium">Calculated</span>
										</div>
									)}

									{extrasData.parkingCharges > 0 && (
										<div className="flex justify-between">
											<span>Parking charges</span>
											<span className="font-medium">
												{formatCurrency(extrasData.parkingCharges)}
											</span>
										</div>
									)}

									{extrasData.tollCharges > 0 && (
										<div className="flex justify-between">
											<span>Toll charges</span>
											<span className="font-medium">
												{formatCurrency(extrasData.tollCharges)}
											</span>
										</div>
									)}

									{(extrasData.otherCharges?.amount || 0) > 0 && (
										<div className="flex justify-between">
											<span>Other charges</span>
											<span className="font-medium">
												{formatCurrency(extrasData.otherCharges?.amount || 0)}
											</span>
										</div>
									)}

									{extrasData.location && (
										<div className="border-t pt-2">
											<div className="flex justify-between">
												<span>Location:</span>
												<span className="font-medium">
													{extrasData.location}
												</span>
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
									<AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
									<div className="text-primary/80 text-xs">
										<p className="mb-1 font-medium">Important Notice</p>
										<p className="text-xs leading-relaxed">
											Extra charges shown are estimates and are not final until
											they have been reviewed and approved by the operator.
											Final amounts may differ based on company policies and
											verification.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Sticky Footer */}
				<div className="flex-shrink-0 border-t bg-white p-4">
					<div className="space-y-2">
						<Button
							onClick={onConfirm}
							disabled={isSubmitting}
							className="h-10 w-full bg-primary font-medium text-primary-foreground text-sm hover:bg-primary/90"
						>
							{isSubmitting ? (
								<>
									<div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
									Closing trip...
								</>
							) : (
								"Confirm & close trip"
							)}
						</Button>

						{hasExtras && (
							<Button
								onClick={onGoBack}
								variant="outline"
								disabled={isSubmitting}
								className="h-9 w-full font-medium text-sm"
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

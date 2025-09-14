import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";

interface CloseTripOptionsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	booking: any;
	onSelectOption: (option: 'close' | 'close-with-extras' | 'no-show' | 'no-show-with-extras' | 'close-later') => void;
}

export function CloseTripOptionsDialog({
	open,
	onOpenChange,
	booking,
	onSelectOption
}: CloseTripOptionsDialogProps) {
	const handleBack = () => {
		onOpenChange(false);
	};

	const pickupTime = booking?.scheduledPickupTime ? new Date(booking.scheduledPickupTime) : new Date();
	const dropoffTime = booking?.scheduledDropoffTime || booking?.estimatedDropoffTime ? 
		new Date(booking.scheduledDropoffTime || booking.estimatedDropoffTime) : 
		new Date();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md mx-auto p-0 gap-0 sm:rounded-lg max-sm:w-full max-sm:h-full max-sm:m-0 max-sm:rounded-none max-sm:max-w-none">
				{/* Header */}
				<DialogHeader className="px-4 py-3 border-b bg-background">
					<div className="flex items-center gap-3">
						<Button 
							variant="ghost" 
							size="sm" 
							onClick={handleBack}
							className="h-8 w-8 p-0"
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<DialogTitle className="text-lg font-semibold">Close trip</DialogTitle>
					</div>
				</DialogHeader>

				{/* Content */}
				<div className="p-4 space-y-4">
					{/* Trip Details */}
					<Card className="border-0 bg-muted/30">
						<CardContent className="p-3 space-y-2">
							<div className="flex items-center justify-between text-xs">
								<span className="font-medium">Today {format(pickupTime, "HH:mm")}</span>
								<span className="text-muted-foreground">Trip ID {booking?.id?.slice(-6).toUpperCase()}</span>
							</div>
							
							<div className="space-y-1 text-xs text-muted-foreground">
								<div className="flex items-start gap-2">
									<span className="font-medium">Pick up time:</span>
									<span>{format(pickupTime, "do MMM yyyy, HH:mm")}</span>
								</div>
								<div className="flex items-start gap-2">
									<span className="font-medium">Drop off time:</span>
									<span>{format(dropoffTime, "do MMM yyyy, HH:mm")}</span>
								</div>
							</div>

						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="space-y-2">
						<Button
							onClick={() => onSelectOption('close')}
							className="w-full h-10 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
						>
							Close trip, no extras
						</Button>

						<Button
							onClick={() => onSelectOption('close-with-extras')}
							className="w-full h-10 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
						>
							Close trip with extras
						</Button>

						<Button
							onClick={() => onSelectOption('no-show')}
							className="w-full h-10 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
						>
							No show
						</Button>

						<Button
							onClick={() => onSelectOption('no-show-with-extras')}
							className="w-full h-10 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
						>
							No show with extras
						</Button>

						<Button
							onClick={() => onSelectOption('close-later')}
							variant="link"
							className="w-full h-8 text-sm font-medium text-primary"
						>
							Close trip later
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
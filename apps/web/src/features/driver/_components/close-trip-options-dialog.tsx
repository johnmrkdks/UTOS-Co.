import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { format } from "date-fns";
import { ArrowLeft, X } from "lucide-react";

interface CloseTripOptionsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	booking: any;
	onSelectOption: (
		option:
			| "close"
			| "close-with-extras"
			| "no-show"
			| "no-show-with-extras"
			| "close-later",
	) => void;
}

export function CloseTripOptionsDialog({
	open,
	onOpenChange,
	booking,
	onSelectOption,
}: CloseTripOptionsDialogProps) {
	const handleBack = () => {
		onOpenChange(false);
	};

	const pickupTime = booking?.scheduledPickupTime
		? new Date(booking.scheduledPickupTime)
		: new Date();
	const dropoffTime =
		booking?.scheduledDropoffTime || booking?.estimatedDropoffTime
			? new Date(booking.scheduledDropoffTime || booking.estimatedDropoffTime)
			: new Date();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="mx-auto gap-0 p-0 max-sm:m-0 max-sm:h-full max-sm:w-full max-sm:max-w-none max-sm:rounded-none sm:max-w-md sm:rounded-lg"
				showCloseButton={false}
			>
				{/* Header */}
				<DialogHeader className="border-b bg-background px-4 py-3">
					<div className="flex items-center justify-between gap-3">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleBack}
							className="-ml-2 h-10 w-10 shrink-0 p-0"
						>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<DialogTitle className="flex-1 text-center font-semibold text-lg">
							Close trip
						</DialogTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleBack}
							className="-mr-2 h-10 w-10 shrink-0 p-0"
							aria-label="Close"
						>
							<X className="h-5 w-5" />
						</Button>
					</div>
				</DialogHeader>

				{/* Content */}
				<div className="space-y-4 p-4">
					{/* Trip Details */}
					<Card className="border-0 bg-muted/30">
						<CardContent className="space-y-2 p-3">
							<div className="flex items-center justify-between text-xs">
								<span className="font-medium">
									Today {format(pickupTime, "HH:mm")}
								</span>
								<span className="text-muted-foreground">
									Trip ID {booking?.id?.slice(-6).toUpperCase()}
								</span>
							</div>

							<div className="space-y-1 text-muted-foreground text-xs">
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
							onClick={() => onSelectOption("close")}
							className="h-10 w-full bg-primary font-medium text-primary-foreground text-sm hover:bg-primary/90"
						>
							Close trip, no extras
						</Button>

						<Button
							onClick={() => onSelectOption("close-with-extras")}
							className="h-10 w-full bg-primary font-medium text-primary-foreground text-sm hover:bg-primary/90"
						>
							Close trip with extras
						</Button>

						<Button
							onClick={() => onSelectOption("no-show")}
							className="h-10 w-full bg-primary font-medium text-primary-foreground text-sm hover:bg-primary/90"
						>
							No show
						</Button>

						<Button
							onClick={() => onSelectOption("no-show-with-extras")}
							className="h-10 w-full bg-primary font-medium text-primary-foreground text-sm hover:bg-primary/90"
						>
							No show with extras
						</Button>

						<Button
							onClick={() => onSelectOption("close-later")}
							variant="link"
							className="h-8 w-full font-medium text-primary text-sm"
						>
							Close trip later
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

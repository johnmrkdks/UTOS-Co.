import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { PricingConfigForm } from "./pricing-config-form";

type EditPricingConfigDialogProps = {
	config: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function EditPricingConfigDialog({ config, open, onOpenChange }: EditPricingConfigDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="!max-w-6xl h-[95vh] flex flex-col p-0">
				<DialogHeader className="flex-shrink-0 p-6 pb-4">
					<DialogTitle>Edit Pricing Configuration</DialogTitle>
					<DialogDescription>
						Update the pricing configuration. Changes will apply to future bookings.
					</DialogDescription>
				</DialogHeader>
				<div className="flex-1 min-h-0">
					<PricingConfigForm 
						initialData={config} 
						mode="edit"
						onSuccess={() => onOpenChange(false)} 
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
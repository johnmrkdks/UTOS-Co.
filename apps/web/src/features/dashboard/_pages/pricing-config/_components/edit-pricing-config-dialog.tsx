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
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Pricing Configuration</DialogTitle>
					<DialogDescription>
						Update the pricing configuration. Changes will apply to future bookings.
					</DialogDescription>
				</DialogHeader>
				<PricingConfigForm 
					initialData={config} 
					mode="edit"
					onSuccess={() => onOpenChange(false)} 
				/>
			</DialogContent>
		</Dialog>
	);
}
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { AlertTriangle } from "lucide-react";
import { useDeletePricingConfigMutation } from "../_hooks/query/use-delete-pricing-config-mutation";

interface PricingConfig {
	id: string;
	name: string;
	carId?: string;
	firstKmRate: number;
	firstKmLimit: number;
	pricePerKm: number;
	car?: {
		name: string;
		licensePlate?: string;
	};
}

type DeletePricingConfigDialogProps = {
	config: PricingConfig | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function DeletePricingConfigDialog({
	config,
	open,
	onOpenChange,
}: DeletePricingConfigDialogProps) {
	const deleteConfigMutation = useDeletePricingConfigMutation();

	const handleDelete = async () => {
		if (!config) return;

		try {
			await deleteConfigMutation.mutateAsync({ id: config.id });
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to delete pricing configuration:", error);
		}
	};

	if (!config) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md" showCloseButton={false}>
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
							<AlertTriangle className="h-6 w-6 text-red-600" />
						</div>
						<div>
							<DialogTitle>Delete Pricing Configuration</DialogTitle>
							<DialogDescription className="mt-1">
								This action cannot be undone.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="py-4">
					<p className="text-muted-foreground text-sm">
						Are you sure you want to delete <strong>"{config.name}"</strong>?
					</p>

					{config.car && (
						<div className="mt-3 rounded-md bg-muted/50 p-3">
							<p className="font-medium text-sm">Associated Car:</p>
							<p className="text-muted-foreground text-sm">
								{config.car.name}{" "}
								{config.car.licensePlate && `(${config.car.licensePlate})`}
							</p>
						</div>
					)}

					<div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
						<p className="mb-1 font-medium text-amber-800 text-sm">
							⚠️ Impact of deletion:
						</p>
						<ul className="space-y-1 text-amber-700 text-sm">
							<li>
								• Future bookings won't be able to use this pricing structure
							</li>
							<li>
								• The associated car may become unpublishable if this is its
								only pricing config
							</li>
							<li>
								• Existing bookings with this pricing will not be affected
							</li>
						</ul>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={deleteConfigMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={deleteConfigMutation.isPending}
					>
						{deleteConfigMutation.isPending
							? "Deleting..."
							: "Delete Configuration"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

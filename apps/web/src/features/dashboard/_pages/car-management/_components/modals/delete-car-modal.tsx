import { useModal } from "@/hooks/use-modal";
import { useDeleteCarMutation } from "../../_hooks/query/car/use-delete-car-mutation";
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
import type { Car } from "server/types";

export function DeleteCarModal() {
	const { isModalOpen, closeModal, modalState } = useModal();
	const deleteCarMutation = useDeleteCarMutation();
	
	const car = modalState.data as Car;

	const handleDelete = async () => {
		try {
			await deleteCarMutation.mutateAsync({ id: car.id });
			closeModal();
		} catch (error) {
			console.error("Failed to delete car:", error);
		}
	};

	return (
		<Dialog open={isModalOpen("delete-car")} onOpenChange={closeModal}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
							<AlertTriangle className="h-6 w-6 text-red-600" />
						</div>
						<div>
							<DialogTitle>Delete Car</DialogTitle>
							<DialogDescription className="mt-1">
								This action cannot be undone.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				
				<div className="py-4">
					<p className="text-sm text-muted-foreground">
						Are you sure you want to delete <strong>{car?.name}</strong>? 
						This will permanently remove the car from the system and all related data including:
					</p>
					<ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
						<li>Car images and documentation</li>
						<li>Pricing configurations</li>
						<li>Associated bookings (if any)</li>
					</ul>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={closeModal}>
						Cancel
					</Button>
					<Button 
						type="button" 
						variant="destructive"
						onClick={handleDelete}
						disabled={deleteCarMutation.isPending}
					>
						{deleteCarMutation.isPending ? "Deleting..." : "Delete Car"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
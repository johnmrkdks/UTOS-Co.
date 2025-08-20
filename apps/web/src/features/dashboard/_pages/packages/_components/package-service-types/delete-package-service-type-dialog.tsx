import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { useModal } from "@/hooks/use-modal";
import { useDeletePackageServiceTypeMutation } from "../../_hooks/query/use-delete-package-service-type-mutation";

export function DeletePackageServiceTypeDialog() {
	const { isOpen, closeModal, data } = useModal("delete-package-service-type");
	const deleteMutation = useDeletePackageServiceTypeMutation();

	const handleDelete = () => {
		if (!data?.id) return;

		deleteMutation.mutate(
			{ id: data.id },
			{
				onSuccess: () => {
					closeModal();
				},
			}
		);
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={closeModal}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Service Type</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete "{data?.name}"? This action cannot be undone.
						Any packages using this service type may be affected.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deleteMutation.isPending}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={deleteMutation.isPending}
						className="bg-red-600 hover:bg-red-700"
					>
						{deleteMutation.isPending ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
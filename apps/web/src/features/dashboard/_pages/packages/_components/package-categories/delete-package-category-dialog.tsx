import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@workspace/ui/components/dialog";
import { useModal } from "@/hooks/use-modal";
import { useDeletePackageCategoryMutation } from "../../_hooks/query/use-delete-package-category-mutation";

export function DeletePackageCategoryDialog() {
	const { isModalOpen, closeModal, modalData } = useModal();
	const deleteMutation = useDeletePackageCategoryMutation();

	const handleDelete = async () => {
		if (!modalData?.id) return;

		await deleteMutation.mutateAsync({ id: modalData.id });
		closeModal();
	};

	return (
		<Dialog open={isModalOpen("delete-package-category")} onOpenChange={closeModal}>
			<DialogContent className="max-w-md" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Delete Package Category</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "{modalData?.name}"? This action cannot be
						undone.
					</DialogDescription>
				</DialogHeader>

				<div className="flex gap-2 justify-end">
					<Button variant="outline" onClick={closeModal}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={deleteMutation.isPending}
					>
						{deleteMutation.isPending ? "Deleting..." : "Delete"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useModal } from "@/hooks/use-modal";
import { useUpdatePackageCategoryMutation } from "../../_hooks/query/use-update-package-category-mutation";

const schema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	displayOrder: z.number().default(0),
});

type FormData = z.infer<typeof schema>;

export function EditPackageCategoryDialog() {
	const { isModalOpen, closeModal, modalData } = useModal();
	const updateMutation = useUpdatePackageCategoryMutation();

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
	});

	// Load data when modal opens
	useEffect(() => {
		if (modalData && isModalOpen("edit-package-category")) {
			setValue("name", modalData.name || "");
			setValue("description", modalData.description || "");
			setValue("displayOrder", modalData.displayOrder ?? 0);
		}
	}, [modalData, isModalOpen, setValue]);

	const onSubmit = async (data: FormData) => {
		if (!modalData?.id) return;

		await updateMutation.mutateAsync({
			id: modalData.id,
			...data,
		});
		reset();
		closeModal();
	};

	const handleClose = () => {
		reset();
		closeModal();
	};

	return (
		<Dialog
			open={isModalOpen("edit-package-category")}
			onOpenChange={handleClose}
		>
			<DialogContent className="max-w-md" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Edit Package Category</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<Label htmlFor="name">Name *</Label>
						<Input
							id="name"
							{...register("name")}
							placeholder="e.g., Tours, Transfers, Events"
						/>
						{errors.name && (
							<p className="mt-1 text-red-500 text-sm">{errors.name.message}</p>
						)}
					</div>

					<div>
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							{...register("description")}
							placeholder="Brief description of this category"
							rows={3}
						/>
					</div>

					<div>
						<Label htmlFor="displayOrder">Display Order</Label>
						<Input
							id="displayOrder"
							type="number"
							{...register("displayOrder", { valueAsNumber: true })}
							placeholder="0"
						/>
					</div>

					<div className="flex justify-end gap-2">
						<Button type="button" variant="outline" onClick={handleClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={updateMutation.isPending}>
							{updateMutation.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

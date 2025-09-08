import { useModal } from "@/hooks/use-modal";
import { useUpdateCarMutation } from "../../_hooks/query/car/use-update-car-mutation";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import type { Car } from "server/types";

const EditCarSchema = z.object({
	name: z.string().min(1, "Car name is required"),
	description: z.string().optional(),
	year: z.number().min(1900).max(new Date().getFullYear() + 1),
	pricePerDay: z.number().min(0, "Price must be positive"),
	mileage: z.number().min(0).optional(),
	licensePlate: z.string().optional(),
	color: z.string().optional(),
	isAvailable: z.boolean(),
	isActive: z.boolean(),
});

type EditCarFormData = z.infer<typeof EditCarSchema>;

export function EditCarModal() {
	const { isModalOpen, closeModal, modalState } = useModal();
	const updateCarMutation = useUpdateCarMutation();
	
	const car = modalState.data as Car;
	
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
		setValue,
	} = useForm<EditCarFormData>({
		resolver: zodResolver(EditCarSchema),
	});

	// Populate form with existing car data when modal opens
	useEffect(() => {
		if (car) {
			setValue("name", car.name || "");
			setValue("description", car.description || "");
			setValue("year", car.year || new Date().getFullYear());
			setValue("pricePerDay", car.pricePerDay || 0);
			setValue("mileage", car.mileage || 0);
			setValue("licensePlate", car.licensePlate || "");
			setValue("color", car.color || "");
			setValue("isAvailable", car.isAvailable || true);
			setValue("isActive", car.isActive || true);
		}
	}, [car, setValue]);

	const onSubmit = async (data: EditCarFormData) => {
		try {
			await updateCarMutation.mutateAsync({
				id: car.id,
				data: {
					...data,
					// Keep existing non-editable fields
					modelId: car.modelId,
					categoryId: car.categoryId,
					bodyTypeId: car.bodyTypeId,
					driveTypeId: car.driveTypeId,
					fuelTypeId: car.fuelTypeId,
					transmissionTypeId: car.transmissionTypeId,
					conditionTypeId: car.conditionTypeId,
				},
			});
			
			reset();
			closeModal();
		} catch (error) {
			console.error("Failed to update car:", error);
		}
	};

	const handleClose = () => {
		reset();
		closeModal();
	};

	return (
		<Dialog open={isModalOpen("edit-car")} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Car</DialogTitle>
					<DialogDescription>
						Update the car information. Changes will be saved immediately.
					</DialogDescription>
				</DialogHeader>
				
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">Car Name</Label>
							<Input
								id="name"
								{...register("name")}
								placeholder="Enter car name"
							/>
							{errors.name && (
								<p className="text-sm text-red-600">{errors.name.message}</p>
							)}
						</div>
						
						<div className="space-y-2">
							<Label htmlFor="year">Year</Label>
							<Input
								id="year"
								type="number"
								{...register("year", { valueAsNumber: true })}
								placeholder="2023"
							/>
							{errors.year && (
								<p className="text-sm text-red-600">{errors.year.message}</p>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							{...register("description")}
							placeholder="Enter car description"
							rows={3}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="pricePerDay">Price per Day</Label>
							<Input
								id="pricePerDay"
								type="number"
								{...register("pricePerDay", { valueAsNumber: true })}
								placeholder="100"
							/>
							{errors.pricePerDay && (
								<p className="text-sm text-red-600">{errors.pricePerDay.message}</p>
							)}
						</div>
						
						<div className="space-y-2">
							<Label htmlFor="mileage">Mileage</Label>
							<Input
								id="mileage"
								type="number"
								{...register("mileage", { valueAsNumber: true })}
								placeholder="50000"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="licensePlate">License Plate</Label>
							<Input
								id="licensePlate"
								{...register("licensePlate")}
								placeholder="ABC-123"
							/>
						</div>
						
						<div className="space-y-2">
							<Label htmlFor="color">Color</Label>
							<Input
								id="color"
								{...register("color")}
								placeholder="Black"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center space-x-2">
							<input
								id="isAvailable"
								type="checkbox"
								{...register("isAvailable")}
								className="h-4 w-4 rounded border-gray-300"
							/>
							<Label htmlFor="isAvailable">Available for booking</Label>
						</div>
						
						<div className="flex items-center space-x-2">
							<input
								id="isActive"
								type="checkbox"
								{...register("isActive")}
								className="h-4 w-4 rounded border-gray-300"
							/>
							<Label htmlFor="isActive">Active in system</Label>
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Updating..." : "Update Car"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
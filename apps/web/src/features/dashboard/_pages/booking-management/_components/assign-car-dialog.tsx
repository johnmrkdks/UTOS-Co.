import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Car, Loader } from "lucide-react";
import { useState } from "react";
import { useGetCarsQuery } from "../../car-management/_hooks/query/car/use-get-cars-query";
import { useAssignCarMutation } from "../_hooks/query/use-assign-car-mutation";

interface AssignCarDialogProps {
	booking: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AssignCarDialog({
	booking,
	open,
	onOpenChange,
}: AssignCarDialogProps) {
	const [selectedCarId, setSelectedCarId] = useState<string>("");
	
	const carsQuery = useGetCarsQuery({ 
		page: 1, 
		limit: 100, // Get all available cars
		search: "",
		sortBy: "name",
		sortOrder: "asc"
	});
	
	const assignCarMutation = useAssignCarMutation();

	const handleAssignCar = () => {
		if (!selectedCarId || !booking?.id) return;

		assignCarMutation.mutate({
			id: booking.id,
			carId: selectedCarId,
		}, {
			onSuccess: () => {
				onOpenChange(false);
				setSelectedCarId("");
			}
		});
	};

	const availableCars = carsQuery.data?.items?.filter(car => 
		car.isActive && car.isAvailable && car.status === 'available'
	) || [];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Car className="h-5 w-5 text-primary" />
						Assign Car
					</DialogTitle>
					<DialogDescription>
						Choose a car for booking {booking?.id}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{carsQuery.isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader className="h-6 w-6 animate-spin text-primary" />
						</div>
					) : (
						<>
							<div className="space-y-2">
								<label className="text-sm font-medium">Available Cars</label>
								<Select value={selectedCarId} onValueChange={setSelectedCarId}>
									<SelectTrigger>
										<SelectValue placeholder="Select a car" />
									</SelectTrigger>
									<SelectContent>
										{availableCars.map((car) => (
											<SelectItem key={car.id} value={car.id}>
												<div className="flex items-center gap-2">
													<Car className="h-4 w-4" />
													<span>{car.name}</span>
													{car.brand && <span className="text-gray-500">({car.brand.name})</span>}
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{availableCars.length === 0 && (
									<p className="text-sm text-gray-500">No available cars found</p>
								)}
							</div>

							<div className="flex gap-3 pt-4">
								<Button
									variant="outline"
									onClick={() => onOpenChange(false)}
									className="flex-1"
								>
									Cancel
								</Button>
								<Button
									onClick={handleAssignCar}
									disabled={!selectedCarId || assignCarMutation.isPending}
									className="flex-1 bg-primary hover:bg-primary/90"
								>
									{assignCarMutation.isPending ? (
										<>
											<Loader className="h-4 w-4 mr-2 animate-spin" />
											Assigning...
										</>
									) : (
										"Assign Car"
									)}
								</Button>
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
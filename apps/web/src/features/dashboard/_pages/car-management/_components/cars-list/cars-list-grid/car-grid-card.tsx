import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
	EditIcon,
	GlobeIcon,
	MoreHorizontalIcon,
	ToggleLeftIcon,
	ToggleRightIcon,
	TrashIcon,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { Car } from "server/types";
import { toast } from "sonner";
import { useCarPricingStatusSafe } from "@/features/dashboard/_pages/publication-management/_hooks/use-car-pricing-status-safe";
import { useModal } from "@/hooks/use-modal";
import { useUpdateCarMutation } from "../../../_hooks/query/car/use-update-car-mutation";
import { useTogglePublishCarMutation } from "../../../_hooks/query/use-toggle-publish-car-mutation";
import { CarDetailsDialog } from "./car-details-dialog";

interface CarGridCardProps {
	car: Car;
}

const CarGridCard: React.FC<CarGridCardProps> = ({ car }) => {
	const [showDetails, setShowDetails] = useState(false);
	const { openModal } = useModal();
	const updateCarMutation = useUpdateCarMutation();
	const togglePublishMutation = useTogglePublishCarMutation();
	const { hasCarPricingConfig } = useCarPricingStatusSafe();
	const mainImage = car.images?.find((image) => image.isMain);

	const isInFleet =
		car.isPublished &&
		car.isActive &&
		car.isAvailable &&
		car.status === "available";
	const canPublish =
		car.isActive &&
		car.isAvailable &&
		car.status === "available" &&
		hasCarPricingConfig(car.id);

	const handleEdit = () => {
		openModal("edit-car", car);
	};

	const handleTogglePublish = async () => {
		if (!canPublish && !car.isPublished) {
			toast.error("Pricing required", {
				description:
					"Add a pricing configuration for this car first, then publish.",
				action: {
					label: "Pricing Config",
					onClick: () =>
						(window.location.href = "/admin/dashboard/pricing-config"),
				},
			});
			return;
		}
		try {
			await togglePublishMutation.mutateAsync({
				id: car.id,
				isPublished: !car.isPublished,
			});
			toast.success(car.isPublished ? "Removed from fleet" : "Added to fleet");
		} catch (err: any) {
			toast.error(err?.message || "Failed to update publication");
		}
	};

	const handleToggleAvailability = async () => {
		try {
			await updateCarMutation.mutateAsync({
				id: car.id,
				data: {
					isAvailable: !car.isAvailable,
				},
			});
		} catch (error) {
			console.error("Failed to toggle availability:", error);
		}
	};

	const handleDelete = () => {
		openModal("delete-car", car);
	};

	return (
		<>
			<Card className="flex h-full max-w-sm flex-col gap-0 overflow-hidden py-0 transition-shadow duration-200 hover:shadow-lg">
				<div className="relative aspect-[4/3]">
					<img
						src={mainImage?.url || "/placeholder.svg"}
						alt={car.name}
						className="h-full w-full object-cover"
					/>
					{/* Status badges */}
					<div className="absolute top-3 left-3 flex flex-wrap gap-2">
						<Badge
							variant={car.isAvailable ? "default" : "secondary"}
							className="border-0 bg-black/70 text-white text-xs"
						>
							{car.isAvailable ? "available" : "unavailable"}
						</Badge>
						{!isInFleet && (
							<Badge
								variant="outline"
								className="border-0 bg-amber-500/90 text-white text-xs"
							>
								Not in fleet
							</Badge>
						)}
						{car.category && (
							<Badge
								variant="secondary"
								className="bg-white/90 text-black text-xs"
							>
								{car.category.name}
							</Badge>
						)}
					</div>
				</div>
				<CardHeader className="gap-0 p-2">
					<CardTitle className="font-semibold text-lg">{car.name}</CardTitle>
					<p className="text-muted-foreground text-xs">
						{car.model?.name} • {car.model?.brand?.name} • {car.model?.year}
					</p>
				</CardHeader>
				<CardContent className="flex flex-1 flex-col gap-4 p-2">
					{/* Description */}
					{car.description && (
						<div>
							<h3 className="mb-2 font-semibold text-sm">Description</h3>
							<p className="line-clamp-3 text-muted-foreground text-xs">
								{car.description}
							</p>
						</div>
					)}
				</CardContent>
				<CardFooter className="mt-auto flex items-center justify-between gap-2 p-2">
					{/* View Details Button */}
					<Button
						variant="outline"
						className="flex-1 bg-transparent"
						onClick={() => setShowDetails(true)}
					>
						View Details
					</Button>
					{/* Actions menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-9 w-9 p-0">
								<MoreHorizontalIcon className="h-4 w-4" />
								<span className="sr-only">Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-[200px]">
							<DropdownMenuItem onClick={handleEdit}>
								<EditIcon className="mr-2 h-4 w-4" />
								Edit Car
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={handleTogglePublish}
								disabled={
									togglePublishMutation.isPending ||
									(!car.isPublished && !canPublish)
								}
							>
								<GlobeIcon className="mr-2 h-4 w-4" />
								{car.isPublished ? "Remove from fleet" : "Add to fleet"}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleToggleAvailability}>
								{car.isAvailable ? (
									<>
										<ToggleLeftIcon className="mr-2 h-4 w-4" />
										Disable Car
									</>
								) : (
									<>
										<ToggleRightIcon className="mr-2 h-4 w-4" />
										Enable Car
									</>
								)}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={handleDelete}
								className="text-red-600 focus:text-red-600"
							>
								<TrashIcon className="mr-2 h-4 w-4" />
								Delete Car
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</CardFooter>
			</Card>
			<CarDetailsDialog
				car={car}
				open={showDetails}
				onOpenChange={setShowDetails}
			/>
		</>
	);
};

export default CarGridCard;

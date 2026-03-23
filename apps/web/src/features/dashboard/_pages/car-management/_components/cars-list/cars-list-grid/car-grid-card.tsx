import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { EditIcon, MoreHorizontalIcon, TrashIcon, ToggleLeftIcon, ToggleRightIcon, GlobeIcon } from "lucide-react";
import type { Car } from "server/types";
import { CarDetailsDialog } from "./car-details-dialog";
import { useModal } from "@/hooks/use-modal";
import { useUpdateCarMutation } from "../../../_hooks/query/car/use-update-car-mutation";
import { useTogglePublishCarMutation } from "../../../_hooks/query/use-toggle-publish-car-mutation";
import { useCarPricingStatusSafe } from "@/features/dashboard/_pages/publication-management/_hooks/use-car-pricing-status-safe";
import { toast } from "sonner";

interface CarGridCardProps {
	car: Car;
}

const CarGridCard: React.FC<CarGridCardProps> = ({ car }) => {
	const [showDetails, setShowDetails] = useState(false)
	const { openModal } = useModal()
	const updateCarMutation = useUpdateCarMutation()
	const togglePublishMutation = useTogglePublishCarMutation()
	const { hasCarPricingConfig } = useCarPricingStatusSafe()
	const mainImage = car.images?.find((image) => image.isMain)

	const isInFleet = car.isPublished && car.isActive && car.isAvailable && car.status === "available"
	const canPublish = car.isActive && car.isAvailable && car.status === "available" && hasCarPricingConfig(car.id)

	const handleEdit = () => {
		openModal("edit-car", car)
	}

	const handleTogglePublish = async () => {
		if (!canPublish && !car.isPublished) {
			toast.error("Pricing required", {
				description: "Add a pricing configuration for this car first, then publish.",
				action: {
					label: "Pricing Config",
					onClick: () => window.location.href = "/admin/dashboard/pricing-config",
				},
			})
			return
		}
		try {
			await togglePublishMutation.mutateAsync({
				id: car.id,
				isPublished: !car.isPublished,
			})
			toast.success(car.isPublished ? "Removed from fleet" : "Added to fleet")
		} catch (err: any) {
			toast.error(err?.message || "Failed to update publication")
		}
	}

	const handleToggleAvailability = async () => {
		try {
			await updateCarMutation.mutateAsync({
				id: car.id,
				data: {
					isAvailable: !car.isAvailable,
				},
			})
		} catch (error) {
			console.error("Failed to toggle availability:", error)
		}
	}

	const handleDelete = () => {
		openModal("delete-car", car)
	}

	return (
		<>
			<Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 max-w-sm py-0 gap-0 flex flex-col h-full">
				<div className="aspect-[4/3] relative">
					<img
						src={mainImage?.url || "/placeholder.svg"}
						alt={car.name}
						className="object-cover w-full h-full"
					/>
					{/* Status badges */}
					<div className="absolute top-3 left-3 flex flex-wrap gap-2">
						<Badge
							variant={car.isAvailable ? "default" : "secondary"}
							className="text-xs bg-black/70 text-white border-0"
						>
							{car.isAvailable ? "available" : "unavailable"}
						</Badge>
						{!isInFleet && (
							<Badge variant="outline" className="text-xs bg-amber-500/90 text-white border-0">
								Not in fleet
							</Badge>
						)}
						{car.category && (
							<Badge variant="secondary" className="text-xs bg-white/90 text-black">
								{car.category.name}
							</Badge>
						)}
					</div>
				</div>
				<CardHeader className="p-2 gap-0">
					<CardTitle className="text-lg font-semibold">{car.name}</CardTitle>
					<p className="text-xs text-muted-foreground">
						{car.model?.name} • {car.model?.brand?.name} • {car.model?.year}
					</p>
				</CardHeader>
				<CardContent className="flex flex-col p-2 gap-4 flex-1">
					{/* Description */}
					{car.description && (
						<div>
							<h3 className="text-sm font-semibold mb-2">Description</h3>
							<p className="text-xs text-muted-foreground line-clamp-3">{car.description}</p>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex justify-between items-center p-2 mt-auto gap-2">
					{/* View Details Button */}
					<Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowDetails(true)}>
						View Details
					</Button>
					{/* Actions menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="h-9 w-9 p-0"
							>
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
								disabled={togglePublishMutation.isPending || (!car.isPublished && !canPublish)}
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
			<CarDetailsDialog car={car} open={showDetails} onOpenChange={setShowDetails} />
		</>
	);
};

export default CarGridCard;

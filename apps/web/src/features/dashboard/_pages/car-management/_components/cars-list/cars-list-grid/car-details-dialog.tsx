import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import type { Car as CarType } from "server/types";
import { CarImageViewer } from "@/components/car-image-viewer";
import { DetailedSpecifications } from "./_components/detailed-specifications";
import { FeaturesSection } from "./_components/features-section";
import { LocationInfo } from "./_components/location-info";
import { ServiceAvailability } from "./_components/service-availability";
import { ServiceInfo } from "./_components/service-info";
import { StatusAndCategory } from "./_components/status-and-category";
import { VehicleIdentification } from "./_components/vehicle-identification";

type CarDetailsDialogProps = {
	car: CarType;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CarDetailsDialog({
	car,
	open,
	onOpenChange,
}: CarDetailsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="max-h-[90vh] sm:max-w-[600px]"
				showCloseButton={false}
			>
				<DialogHeader>
					<DialogTitle className="text-2xl">{car.name}</DialogTitle>
					<DialogDescription>
						{car.model?.brand?.name} • {car.model?.name} • {car.model?.year}
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[70vh] pr-4">
					<div className="space-y-6">
						<CarImageViewer images={car.images || []} carName={car.name} />

						<StatusAndCategory car={car} />

						{car.description && (
							<div>
								<h3 className="mb-2 font-semibold">Description</h3>
								<p className="text-muted-foreground text-sm">
									{car.description}
								</p>
							</div>
						)}

						<DetailedSpecifications car={car} />

						<Separator />
						<VehicleIdentification car={car} />

						<Separator />
						<FeaturesSection car={car} />

						<Separator />
						<ServiceInfo car={car} />

						<Separator />
						<LocationInfo car={car} />

						<Separator />
						<ServiceAvailability car={car} />
					</div>
				</ScrollArea>

				<div className="flex items-center justify-between">
					<div className="text-muted-foreground text-xs">
						Last updated: {new Date(car.updatedAt).toLocaleDateString()}
					</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Close
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

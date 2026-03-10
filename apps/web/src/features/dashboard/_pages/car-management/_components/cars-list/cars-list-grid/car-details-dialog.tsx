import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import type { Car as CarType } from "server/types";
import { CarImageViewer } from "@/components/car-image-viewer";
import { StatusAndCategory } from "./_components/status-and-category";
import { DetailedSpecifications } from "./_components/detailed-specifications";
import { VehicleIdentification } from "./_components/vehicle-identification";
import { FeaturesSection } from "./_components/features-section";
import { ServiceInfo } from "./_components/service-info";
import { LocationInfo } from "./_components/location-info";
import { ServiceAvailability } from "./_components/service-availability";

type CarDetailsDialogProps = {
	car: CarType;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CarDetailsDialog({ car, open, onOpenChange }: CarDetailsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh]" showCloseButton={false}>
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
								<h3 className="font-semibold mb-2">Description</h3>
								<p className="text-sm text-muted-foreground">{car.description}</p>
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

				<div className="flex justify-between items-center">
					<div className="text-xs text-muted-foreground">
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


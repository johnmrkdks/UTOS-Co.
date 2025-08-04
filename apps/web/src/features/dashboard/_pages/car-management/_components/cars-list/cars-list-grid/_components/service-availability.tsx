import { memo } from "react";
import { Badge } from "@workspace/ui/components/badge";
import type { Car as CarType } from "server/types";

interface ServiceAvailabilityProps {
	car: CarType;
}

export const ServiceAvailability = memo<ServiceAvailabilityProps>(({ car }) => {
	return (
		<div>
			<h3 className="font-semibold mb-3">Service Availability</h3>
			<div className="flex gap-2 flex-wrap">
				{car.availableForPackages && (
					<Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
						✓ Available for Package Tours
					</Badge>
				)}
				{car.availableForCustom && (
					<Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
						✓ Available for Custom Bookings
					</Badge>
				)}
				{!car.availableForPackages && !car.availableForCustom && (
					<Badge variant="outline" className="text-gray-500">
						Currently Unavailable for Booking
					</Badge>
				)}
			</div>
		</div>
	);
});

ServiceAvailability.displayName = "ServiceAvailability";

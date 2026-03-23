import { Badge } from "@workspace/ui/components/badge";
import { memo } from "react";
import type { Car as CarType } from "server/types";

interface ServiceAvailabilityProps {
	car: CarType;
}

export const ServiceAvailability = memo<ServiceAvailabilityProps>(({ car }) => {
	return (
		<div>
			<h3 className="mb-3 font-semibold">Service Availability</h3>
			<div className="flex flex-wrap gap-2">
				{car.availableForPackages && (
					<Badge
						variant="outline"
						className="border-green-200 bg-green-50 text-green-700"
					>
						✓ Available for Package Tours
					</Badge>
				)}
				{car.availableForCustom && (
					<Badge
						variant="outline"
						className="border-blue-200 bg-blue-50 text-blue-700"
					>
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

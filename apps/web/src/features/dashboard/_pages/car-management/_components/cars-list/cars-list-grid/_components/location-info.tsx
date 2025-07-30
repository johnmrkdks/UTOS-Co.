import { memo } from "react";
import { MapPin } from "lucide-react";
import type { Car as CarType } from "server/types";

interface LocationInfoProps {
	car: CarType;
}

export const LocationInfo = memo<LocationInfoProps>(({ car }) => {
	if (!car.currentLatitude || !car.currentLongitude) {
		return null;
	}

	return (
		<div>
			<h3 className="font-semibold mb-3 flex items-center gap-2">
				<MapPin className="h-5 w-5" />
				Current Location
			</h3>
			<div className="text-sm space-y-2">
				<div className="flex justify-between">
					<span className="text-muted-foreground">Coordinates:</span>
					<span className="font-medium font-mono">
						{car.currentLatitude.toFixed(6)}, {car.currentLongitude.toFixed(6)}
					</span>
				</div>
				{car.lastLocationUpdate && (
					<div className="flex justify-between">
						<span className="text-muted-foreground">Last Updated:</span>
						<span className="font-medium">{new Date(car.lastLocationUpdate).toLocaleString()}</span>
					</div>
				)}
			</div>
		</div>
	);
});

LocationInfo.displayName = "LocationInfo";

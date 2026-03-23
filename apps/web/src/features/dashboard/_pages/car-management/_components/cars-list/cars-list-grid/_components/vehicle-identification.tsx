import { memo } from "react";
import type { Car as CarType } from "server/types";

interface VehicleIdentificationProps {
	car: CarType;
}

export const VehicleIdentification = memo<VehicleIdentificationProps>(
	({ car }) => {
		return (
			<div>
				<h3 className="mb-3 font-semibold">Vehicle Identification</h3>
				<div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
					<div className="flex justify-between">
						<span className="text-muted-foreground">License Plate:</span>
						<span className="font-medium font-mono">{car.licensePlate}</span>
					</div>
					{car.vinNumber && (
						<div className="flex justify-between">
							<span className="text-muted-foreground">VIN Number:</span>
							<span className="font-medium font-mono text-xs">
								{car.vinNumber}
							</span>
						</div>
					)}
				</div>
			</div>
		);
	},
);

VehicleIdentification.displayName = "VehicleIdentification";

import { memo } from "react";
import { Users, Car, Palette, Luggage, Gauge, Hash, Fuel, Settings, Navigation } from "lucide-react";
import type { Car as CarType } from "server/types";

interface DetailedSpecificationsProps {
	car: CarType;
}

const SpecItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) => (
	<div className="flex items-center justify-between">
		<span className="flex items-center gap-2 text-muted-foreground">
			<Icon className="h-4 w-4" />
			{label}:
		</span>
		<span className="font-medium">{value}</span>
	</div>
);

const SpecSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
	<div className="space-y-3">
		<h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">{title}</h4>
		<div className="space-y-2 text-sm">{children}</div>
	</div>
);

export const DetailedSpecifications = memo<DetailedSpecificationsProps>(({ car }) => {
	return (
		<div>
			<h3 className="font-semibold mb-4 flex items-center gap-2">
				<Settings className="h-5 w-5" />
				Detailed Specifications
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<SpecSection title="Basic Info">
					<SpecItem icon={Users} label="Seating Capacity" value={`${car.seatingCapacity} passengers`} />
					<SpecItem icon={Car} label="Doors" value={car.doors} />
					<SpecItem icon={Palette} label="Color" value={car.color} />
					{car.luggageCapacity && <SpecItem icon={Luggage} label="Luggage Capacity" value={car.luggageCapacity} />}
				</SpecSection>

				<SpecSection title="Engine & Performance">
					<SpecItem icon={Gauge} label="Engine Size" value={`${car.engineSize}cc`} />
					<SpecItem icon={Hash} label="Cylinders" value={car.cylinders} />
					<SpecItem icon={Fuel} label="Fuel Type" value={car.fuelType?.name || "N/A"} />
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Mileage:</span>
						<span className="font-medium">{car.mileage ? car.mileage.toLocaleString() : 'N/A'} miles</span>
					</div>
				</SpecSection>

				<SpecSection title="Drivetrain">
					<SpecItem icon={Settings} label="Transmission" value={car.transmissionType?.name || "N/A"} />
					<SpecItem icon={Navigation} label="Drive Type" value={car.driveType?.name || "N/A"} />
				</SpecSection>

				<SpecSection title="Classification">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Body Type:</span>
						<span className="font-medium">{car.bodyType?.name || "N/A"}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Category:</span>
						<span className="font-medium">{car.category?.name || "N/A"}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Condition:</span>
						<span className="font-medium">{car.conditionType?.name || "N/A"}</span>
					</div>
				</SpecSection>
			</div>
		</div>
	);
});

DetailedSpecifications.displayName = "DetailedSpecifications";

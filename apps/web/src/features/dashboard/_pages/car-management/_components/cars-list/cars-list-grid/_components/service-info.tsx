import { cn } from "@workspace/ui/lib/utils";
import { Wrench } from "lucide-react";
import { memo } from "react";
import type { Car as CarType } from "server/types";

interface ServiceInfoProps {
	car: CarType;
}

export const ServiceInfo = memo<ServiceInfoProps>(({ car }) => {
	const isServiceDueSoon =
		car.nextServiceDue &&
		new Date(car.nextServiceDue).getTime() - Date.now() <
			30 * 24 * 60 * 60 * 1000;

	return (
		<div>
			<h3 className="mb-3 flex items-center gap-2 font-semibold">
				<Wrench className="h-5 w-5" />
				Service & Maintenance
			</h3>
			<div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
				<div className="flex justify-between">
					<span className="text-muted-foreground">Last Service:</span>
					<span className="font-medium text-xs">
						{new Date(car.lastServiceDate!).toLocaleDateString() || "N/A"}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Next Service Due:</span>
					<span
						className={cn(
							"font-medium text-xs",
							isServiceDueSoon && "text-red-600",
						)}
					>
						{new Date(car.nextServiceDue!).toLocaleDateString() || "N/A"}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Insurance Expiry:</span>
					<span className="font-medium text-xs">
						{new Date(car.insuranceExpiry!).toLocaleDateString() || "N/A"}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Registration Expiry:</span>
					<span className="font-medium text-xs">
						{new Date(car.registrationExpiry!).toLocaleDateString() || "N/A"}
					</span>
				</div>
			</div>
		</div>
	);
});

ServiceInfo.displayName = "ServiceInfo";

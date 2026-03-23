import { Badge } from "@workspace/ui/components/badge";
import {
	AlertTriangle,
	Calendar,
	CheckCircle,
	Settings,
	XCircle,
} from "lucide-react";
import { memo } from "react";
import type { Car } from "server/types";

interface StatusAndCategoryProps {
	car: Car;
}

const getStatusIcon = (
	status: string,
	isAvailable: boolean,
	isActive: boolean,
) => {
	if (!isActive) return <XCircle className="h-4 w-4" />;
	if (!isAvailable) return <AlertTriangle className="h-4 w-4" />;
	if (status === "Available") return <CheckCircle className="h-4 w-4" />;
	return <Settings className="h-4 w-4" />;
};

export const StatusAndCategory = memo<StatusAndCategoryProps>(({ car }) => {
	const isServiceDueSoon =
		car.nextServiceDue &&
		new Date(car.nextServiceDue).getTime() - Date.now() <
			30 * 24 * 60 * 60 * 1000;

	return (
		<div className="flex flex-wrap gap-2">
			<Badge
				variant={car.isAvailable ? "default" : "secondary"}
				className="flex items-center gap-1"
			>
				{getStatusIcon(car.status, car.isAvailable, car.isActive)}
				{car.status}
			</Badge>
			{car.category && <Badge variant="outline">{car.category.name}</Badge>}
			{car.conditionType && (
				<Badge variant="secondary">{car.conditionType.name}</Badge>
			)}
			{isServiceDueSoon && (
				<Badge variant="destructive" className="flex items-center gap-1">
					<Calendar className="h-3 w-3" />
					Service Due Soon
				</Badge>
			)}
		</div>
	);
});

StatusAndCategory.displayName = "StatusAndCategory";

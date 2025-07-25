import { cn } from "@/lib/utils";
import { ReportCard } from "./report-card";
import {
	CheckCheckIcon,
	CircleDashedIcon,
	Clock3Icon,
	ListIcon,
} from "lucide-react";

export function ReportCards({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn("flex flex-col gap-4", className)} {...props}>
			<div className="grid grid-cols-4 gap-4">
				<ReportCard
					title="Completed Booking"
					value={400}
					description="Total bookings completed"
					icon={CheckCheckIcon}
				/>
				<ReportCard
					title="Pending Booking"
					value={80}
					description="Total bookings pending"
					icon={CircleDashedIcon}
				/>
				<ReportCard
					title="Active Trips"
					description="Total trips booked"
					value={76}
					icon={Clock3Icon}
				/>
				<ReportCard
					title="Total Booking"
					description="Total bookings"
					value={556}
					icon={ListIcon}
				/>
			</div>
		</div>
	);
}

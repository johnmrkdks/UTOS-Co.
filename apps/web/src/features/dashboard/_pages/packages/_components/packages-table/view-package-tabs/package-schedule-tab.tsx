import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Activity,
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	Package,
	Settings,
} from "lucide-react";

interface PackageScheduleTabProps {
	pkg: any;
}

export function PackageScheduleTab({ pkg }: PackageScheduleTabProps) {
	// Parse available days from JSON string
	const availableDays = pkg?.availableDays ? JSON.parse(pkg.availableDays) : [];
	const dayLabels = {
		monday: "Mon",
		tuesday: "Tue",
		wednesday: "Wed",
		thursday: "Thu",
		friday: "Fri",
		saturday: "Sat",
		sunday: "Sun",
	};

	return (
		<div className="space-y-6">
			{/* Schedule Overview Card */}
			<Card className="overflow-hidden border-l-4 border-l-blue-500">
				<div className="bg-blue-50 p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="rounded-full bg-blue-100 p-3">
								<Calendar className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900 text-xl">
									Package Schedule
								</h3>
								<p className="text-muted-foreground text-sm">
									{pkg?.isAvailable
										? "Currently available for booking"
										: "Currently unavailable"}
								</p>
							</div>
						</div>
						<div className="text-right">
							<Badge
								variant={pkg?.isAvailable ? "default" : "secondary"}
								className={`text-sm ${pkg?.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
							>
								{pkg?.isAvailable ? (
									<>
										<CheckCircle className="mr-1 h-3 w-3" />
										Available
									</>
								) : (
									<>
										<AlertCircle className="mr-1 h-3 w-3" />
										Unavailable
									</>
								)}
							</Badge>
						</div>
					</div>
				</div>
			</Card>

			{/* Weekly Schedule Visualization */}
			<Card>
				<CardHeader className="pb-4">
					<CardTitle className="flex items-center gap-2 text-xl">
						<Calendar className="h-5 w-5 text-blue-500" />
						Weekly Availability
					</CardTitle>
					<CardDescription>
						Visual representation of available days and operating hours
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{/* Days of week with visual indicators */}
						<div className="grid grid-cols-7 gap-2">
							{Object.entries(dayLabels).map(([dayId, dayShort]) => {
								const isAvailable = availableDays.includes(dayId);
								return (
									<div key={dayId} className="text-center">
										<div
											className={`flex h-16 w-full flex-col items-center justify-center rounded-lg border-2 transition-all ${
												isAvailable
													? "border-green-300 bg-green-100 text-green-700"
													: "border-gray-300 bg-gray-100 text-gray-400"
											}`}
										>
											<div className="font-semibold text-sm">{dayShort}</div>
											<div className="text-xs">
												{isAvailable ? (
													<CheckCircle className="h-3 w-3" />
												) : (
													<AlertCircle className="h-3 w-3" />
												)}
											</div>
										</div>
										<p className="mt-1 font-medium text-xs">
											{dayId.charAt(0).toUpperCase() + dayId.slice(1, 3)}
										</p>
									</div>
								);
							})}
						</div>

						{/* Operating hours timeline */}
						<div className="mt-6">
							<h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
								<Clock className="h-4 w-4 text-blue-500" />
								Operating Hours Timeline
							</h4>
							<div className="relative">
								{/* Hour scale */}
								<div className="mb-2 flex justify-between text-muted-foreground text-xs">
									{Array.from({ length: 13 }, (_, i) => (
										<span key={i}>{String(i + 6).padStart(2, "0")}:00</span>
									))}
								</div>

								{/* Timeline bar */}
								<div className="relative h-8 overflow-hidden rounded-full bg-gray-200">
									{/* Available hours highlight */}
									{pkg?.availableTimeStart && pkg?.availableTimeEnd && (
										<div
											className="absolute top-0 h-full rounded-full bg-green-500"
											style={{
												left: `${((Number.parseInt(pkg.availableTimeStart.split(":")[0]) - 6) / 12) * 100}%`,
												width: `${((Number.parseInt(pkg.availableTimeEnd.split(":")[0]) - Number.parseInt(pkg.availableTimeStart.split(":")[0])) / 12) * 100}%`,
											}}
										/>
									)}

									{/* Start and end markers */}
									<div className="absolute inset-y-0 flex w-full items-center justify-between px-2">
										<div className="flex items-center gap-1 font-medium text-white text-xs">
											<Clock className="h-3 w-3" />
											{pkg?.availableTimeStart || "09:00"}
										</div>
										<div className="flex items-center gap-1 font-medium text-white text-xs">
											{pkg?.availableTimeEnd || "17:00"}
											<Clock className="h-3 w-3" />
										</div>
									</div>
								</div>

								{/* Hour labels below */}
								<div className="mt-2 flex justify-between text-muted-foreground text-xs">
									<span>6 AM</span>
									<span>12 PM</span>
									<span>6 PM</span>
								</div>
							</div>
						</div>

						{/* Quick stats */}
						<div className="mt-6 grid grid-cols-3 gap-4">
							<div className="rounded-lg bg-blue-50 p-4 text-center">
								<div className="font-bold text-2xl text-blue-600">
									{availableDays.length}
								</div>
								<div className="text-blue-700 text-sm">Available Days</div>
							</div>
							<div className="rounded-lg bg-green-50 p-4 text-center">
								<div className="font-bold text-2xl text-green-600">
									{pkg?.availableTimeStart && pkg?.availableTimeEnd
										? `${Number.parseInt(pkg.availableTimeEnd.split(":")[0]) - Number.parseInt(pkg.availableTimeStart.split(":")[0])}h`
										: "8h"}
								</div>
								<div className="text-green-700 text-sm">Daily Hours</div>
							</div>
							<div className="rounded-lg bg-purple-50 p-4 text-center">
								<div className="font-bold text-2xl text-purple-600">
									{availableDays.length *
										(pkg?.availableTimeStart && pkg?.availableTimeEnd
											? Number.parseInt(pkg.availableTimeEnd.split(":")[0]) -
												Number.parseInt(pkg.availableTimeStart.split(":")[0])
											: 8)}
									h
								</div>
								<div className="text-purple-700 text-sm">Weekly Hours</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Booking Policies */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Card className="border-l-4 border-l-orange-500">
					<CardHeader className="pb-4">
						<div className="flex items-center gap-2">
							<div className="rounded-lg bg-orange-100 p-2">
								<Settings className="h-5 w-5 text-orange-600" />
							</div>
							<div>
								<CardTitle className="text-lg">Booking Policies</CardTitle>
								<CardDescription>
									Rules and constraints for booking this package
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between rounded-lg bg-orange-50 p-3">
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-orange-600" />
									<span className="font-medium text-sm">Advance Booking</span>
								</div>
								<Badge variant="outline" className="bg-white">
									{pkg?.advanceBookingHours || 24} hours
								</Badge>
							</div>

							<div className="flex items-center justify-between rounded-lg bg-orange-50 p-3">
								<div className="flex items-center gap-2">
									<AlertCircle className="h-4 w-4 text-orange-600" />
									<span className="font-medium text-sm">
										Cancellation Notice
									</span>
								</div>
								<Badge variant="outline" className="bg-white">
									{pkg?.cancellationHours || 24} hours
								</Badge>
							</div>
						</div>

						<div className="border-orange-200 border-t pt-3">
							<p className="text-muted-foreground text-xs">
								Customers must book at least {pkg?.advanceBookingHours || 24}{" "}
								hours in advance and can cancel up to{" "}
								{pkg?.cancellationHours || 24} hours before the service.
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-purple-500">
					<CardHeader className="pb-4">
						<div className="flex items-center gap-2">
							<div className="rounded-lg bg-purple-100 p-2">
								<Package className="h-5 w-5 text-purple-600" />
							</div>
							<div>
								<CardTitle className="text-lg">Service Information</CardTitle>
								<CardDescription>
									Package type and service details
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
								<div className="flex items-center gap-2">
									<Package className="h-4 w-4 text-purple-600" />
									<span className="font-medium text-sm">Service Type</span>
								</div>
								<Badge variant="outline" className="bg-white">
									{pkg?.serviceType || "Standard Package"}
								</Badge>
							</div>

							<div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
								<div className="flex items-center gap-2">
									<Activity className="h-4 w-4 text-purple-600" />
									<span className="font-medium text-sm">Package Status</span>
								</div>
								<Badge
									variant={pkg?.isAvailable ? "default" : "secondary"}
									className={
										pkg?.isAvailable
											? "bg-green-100 text-green-700"
											: "bg-red-100 text-red-700"
									}
								>
									{pkg?.isAvailable ? "Active" : "Inactive"}
								</Badge>
							</div>
						</div>

						<div className="border-purple-200 border-t pt-3">
							<div className="space-y-1 text-muted-foreground text-xs">
								<p>
									<strong>Created:</strong>{" "}
									{pkg?.createdAt
										? new Date(pkg.createdAt).toLocaleDateString()
										: "Unknown"}
								</p>
								<p>
									<strong>Updated:</strong>{" "}
									{pkg?.updatedAt
										? new Date(pkg.updatedAt).toLocaleDateString()
										: "Unknown"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Schedule Management Actions */}
			{/* <Card className="border-dashed border-2"> */}
			{/* 	<CardContent className="py-6"> */}
			{/* 		<div className="text-center"> */}
			{/* 			<h4 className="font-semibold text-lg mb-2">Schedule Management</h4> */}
			{/* 			<p className="text-muted-foreground mb-4"> */}
			{/* 				Need to update availability, operating hours, or booking policies? */}
			{/* 			</p> */}
			{/* 			<div className="flex justify-center gap-3"> */}
			{/* 				<Button variant="outline" size="sm"> */}
			{/* 					<Calendar className="mr-2 h-4 w-4" /> */}
			{/* 					Manage Schedule */}
			{/* 				</Button> */}
			{/* 				<Button variant="outline" size="sm"> */}
			{/* 					<Settings className="mr-2 h-4 w-4" /> */}
			{/* 					Edit Policies */}
			{/* 				</Button> */}
			{/* 			</div> */}
			{/* 		</div> */}
			{/* 	</CardContent> */}
			{/* </Card> */}
		</div>
	);
}

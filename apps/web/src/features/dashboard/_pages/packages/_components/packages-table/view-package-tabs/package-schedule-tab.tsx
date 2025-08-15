import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
	Calendar,
	Settings,
	Package,
	Clock,
	AlertCircle,
	CheckCircle,
	Activity
} from "lucide-react";

interface PackageScheduleTabProps {
	pkg: any;
}

export function PackageScheduleTab({ pkg }: PackageScheduleTabProps) {
	// Parse available days from JSON string
	const availableDays = pkg?.availableDays ? JSON.parse(pkg.availableDays) : [];
	const dayLabels = {
		monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
		friday: "Fri", saturday: "Sat", sunday: "Sun"
	};

	return (
		<div className="space-y-6">
			{/* Schedule Overview Card */}
			<Card className="overflow-hidden border-l-4 border-l-blue-500">
				<div className="bg-blue-50 p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-100 rounded-full">
								<Calendar className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-900">Package Schedule</h3>
								<p className="text-sm text-muted-foreground">
									{pkg?.isAvailable ? "Currently available for booking" : "Currently unavailable"}
								</p>
							</div>
						</div>
						<div className="text-right">
							<Badge
								variant={pkg?.isAvailable ? "default" : "secondary"}
								className={`text-sm ${pkg?.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
							>
								{pkg?.isAvailable ? (
									<><CheckCircle className="mr-1 h-3 w-3" />Available</>
								) : (
									<><AlertCircle className="mr-1 h-3 w-3" />Unavailable</>
								)}
							</Badge>
						</div>
					</div>
				</div>
			</Card>

			{/* Weekly Schedule Visualization */}
			<Card>
				<CardHeader className="pb-4">
					<CardTitle className="text-xl flex items-center gap-2">
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
										<div className={`w-full h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${isAvailable
											? 'bg-green-100 border-green-300 text-green-700'
											: 'bg-gray-100 border-gray-300 text-gray-400'
											}`}>
											<div className="font-semibold text-sm">{dayShort}</div>
											<div className="text-xs">
												{isAvailable ? (
													<CheckCircle className="h-3 w-3" />
												) : (
													<AlertCircle className="h-3 w-3" />
												)}
											</div>
										</div>
										<p className="text-xs mt-1 font-medium">
											{dayId.charAt(0).toUpperCase() + dayId.slice(1, 3)}
										</p>
									</div>
								);
							})}
						</div>

						{/* Operating hours timeline */}
						<div className="mt-6">
							<h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
								<Clock className="h-4 w-4 text-blue-500" />
								Operating Hours Timeline
							</h4>
							<div className="relative">
								{/* Hour scale */}
								<div className="flex justify-between text-xs text-muted-foreground mb-2">
									{Array.from({ length: 13 }, (_, i) => (
										<span key={i}>{String(i + 6).padStart(2, '0')}:00</span>
									))}
								</div>

								{/* Timeline bar */}
								<div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
									{/* Available hours highlight */}
									{pkg?.availableTimeStart && pkg?.availableTimeEnd && (
										<div
											className="absolute top-0 h-full bg-green-500 rounded-full"
											style={{
												left: `${((parseInt(pkg.availableTimeStart.split(':')[0]) - 6) / 12) * 100}%`,
												width: `${((parseInt(pkg.availableTimeEnd.split(':')[0]) - parseInt(pkg.availableTimeStart.split(':')[0])) / 12) * 100}%`
											}}
										/>
									)}

									{/* Start and end markers */}
									<div className="absolute inset-y-0 flex items-center justify-between px-2 w-full">
										<div className="flex items-center gap-1 text-xs font-medium text-white">
											<Clock className="h-3 w-3" />
											{pkg?.availableTimeStart || "09:00"}
										</div>
										<div className="flex items-center gap-1 text-xs font-medium text-white">
											{pkg?.availableTimeEnd || "17:00"}
											<Clock className="h-3 w-3" />
										</div>
									</div>
								</div>

								{/* Hour labels below */}
								<div className="flex justify-between text-xs text-muted-foreground mt-2">
									<span>6 AM</span>
									<span>12 PM</span>
									<span>6 PM</span>
								</div>
							</div>
						</div>

						{/* Quick stats */}
						<div className="grid grid-cols-3 gap-4 mt-6">
							<div className="text-center p-4 bg-blue-50 rounded-lg">
								<div className="text-2xl font-bold text-blue-600">{availableDays.length}</div>
								<div className="text-sm text-blue-700">Available Days</div>
							</div>
							<div className="text-center p-4 bg-green-50 rounded-lg">
								<div className="text-2xl font-bold text-green-600">
									{pkg?.availableTimeStart && pkg?.availableTimeEnd
										? `${parseInt(pkg.availableTimeEnd.split(':')[0]) - parseInt(pkg.availableTimeStart.split(':')[0])}h`
										: "8h"
									}
								</div>
								<div className="text-sm text-green-700">Daily Hours</div>
							</div>
							<div className="text-center p-4 bg-purple-50 rounded-lg">
								<div className="text-2xl font-bold text-purple-600">
									{availableDays.length * (pkg?.availableTimeStart && pkg?.availableTimeEnd
										? parseInt(pkg.availableTimeEnd.split(':')[0]) - parseInt(pkg.availableTimeStart.split(':')[0])
										: 8
									)}h
								</div>
								<div className="text-sm text-purple-700">Weekly Hours</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Booking Policies */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="border-l-4 border-l-orange-500">
					<CardHeader className="pb-4">
						<div className="flex items-center gap-2">
							<div className="p-2 bg-orange-100 rounded-lg">
								<Settings className="h-5 w-5 text-orange-600" />
							</div>
							<div>
								<CardTitle className="text-lg">Booking Policies</CardTitle>
								<CardDescription>Rules and constraints for booking this package</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-orange-600" />
									<span className="font-medium text-sm">Advance Booking</span>
								</div>
								<Badge variant="outline" className="bg-white">
									{pkg?.advanceBookingHours || 24} hours
								</Badge>
							</div>

							<div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
								<div className="flex items-center gap-2">
									<AlertCircle className="h-4 w-4 text-orange-600" />
									<span className="font-medium text-sm">Cancellation Notice</span>
								</div>
								<Badge variant="outline" className="bg-white">
									{pkg?.cancellationHours || 24} hours
								</Badge>
							</div>
						</div>

						<div className="pt-3 border-t border-orange-200">
							<p className="text-xs text-muted-foreground">
								Customers must book at least {pkg?.advanceBookingHours || 24} hours in advance
								and can cancel up to {pkg?.cancellationHours || 24} hours before the service.
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-purple-500">
					<CardHeader className="pb-4">
						<div className="flex items-center gap-2">
							<div className="p-2 bg-purple-100 rounded-lg">
								<Package className="h-5 w-5 text-purple-600" />
							</div>
							<div>
								<CardTitle className="text-lg">Service Information</CardTitle>
								<CardDescription>Package type and service details</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
								<div className="flex items-center gap-2">
									<Package className="h-4 w-4 text-purple-600" />
									<span className="font-medium text-sm">Service Type</span>
								</div>
								<Badge variant="outline" className="bg-white">
									{pkg?.serviceType || "Standard Package"}
								</Badge>
							</div>

							<div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
								<div className="flex items-center gap-2">
									<Activity className="h-4 w-4 text-purple-600" />
									<span className="font-medium text-sm">Package Status</span>
								</div>
								<Badge
									variant={pkg?.isAvailable ? "default" : "secondary"}
									className={pkg?.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
								>
									{pkg?.isAvailable ? "Active" : "Inactive"}
								</Badge>
							</div>
						</div>

						<div className="pt-3 border-t border-purple-200">
							<div className="text-xs text-muted-foreground space-y-1">
								<p><strong>Created:</strong> {pkg?.createdAt ? new Date(pkg.createdAt).toLocaleDateString() : "Unknown"}</p>
								<p><strong>Updated:</strong> {pkg?.updatedAt ? new Date(pkg.updatedAt).toLocaleDateString() : "Unknown"}</p>
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

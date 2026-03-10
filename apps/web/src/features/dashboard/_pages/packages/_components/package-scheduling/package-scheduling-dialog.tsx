import React, { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { 
	Clock, 
	Calendar, 
	Save,
	AlertCircle,
	CheckCircle,
	Loader2,
	Settings
} from "lucide-react";
import { useGetPackagesQuery } from "../../_hooks/query/use-get-packages-query";
import { useUpdatePackageSchedulingMutation } from "../../_hooks/query/use-update-package-scheduling-mutation";

interface PackageSchedulingDialogProps {
	packageId: string;
	packageName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface PackageSchedule {
	isAvailable: boolean;
	availableDays: string[];
	availableTimeStart: string;
	availableTimeEnd: string;
	advanceBookingHours: number;
	cancellationHours: number;
	maxBookingsPerDay: number;
	blackoutDates: string[];
}

const DAYS_OF_WEEK = [
	{ id: "monday", label: "Monday", short: "Mon" },
	{ id: "tuesday", label: "Tuesday", short: "Tue" },
	{ id: "wednesday", label: "Wednesday", short: "Wed" },
	{ id: "thursday", label: "Thursday", short: "Thu" },
	{ id: "friday", label: "Friday", short: "Fri" },
	{ id: "saturday", label: "Saturday", short: "Sat" },
	{ id: "sunday", label: "Sunday", short: "Sun" },
];

export function PackageSchedulingDialog({ 
	packageId, 
	packageName, 
	open, 
	onOpenChange 
}: PackageSchedulingDialogProps) {
	const packagesQuery = useGetPackagesQuery({});
	const updateSchedulingMutation = useUpdatePackageSchedulingMutation();
	
	const currentPackage = packagesQuery.data?.data?.find((pkg: any) => pkg.id === packageId);
	
	const [schedule, setSchedule] = useState<PackageSchedule>({
		isAvailable: true,
		availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
		availableTimeStart: "09:00",
		availableTimeEnd: "17:00", 
		advanceBookingHours: 24,
		cancellationHours: 24,
		maxBookingsPerDay: 10,
		blackoutDates: [],
	});

	const [newBlackoutDate, setNewBlackoutDate] = useState("");

	// Load current package scheduling data
	useEffect(() => {
		if (currentPackage && open) {
			setSchedule({
				isAvailable: currentPackage.isAvailable ?? true,
				availableDays: currentPackage.availableDays ? JSON.parse(currentPackage.availableDays) : ["monday", "tuesday", "wednesday", "thursday", "friday"],
				availableTimeStart: currentPackage.availableTimeStart || "09:00",
				availableTimeEnd: currentPackage.availableTimeEnd || "17:00",
				advanceBookingHours: currentPackage.advanceBookingHours || 24,
				cancellationHours: currentPackage.cancellationHours || 24,
				maxBookingsPerDay: 10, // Default, not in schema yet
				blackoutDates: [], // Default, not in schema yet
			});
		}
	}, [currentPackage, open]);

	const handleDayToggle = (dayId: string, checked: boolean) => {
		setSchedule(prev => ({
			...prev,
			availableDays: checked 
				? [...prev.availableDays, dayId]
				: prev.availableDays.filter(d => d !== dayId)
		}));
	};

	const handleAddBlackoutDate = () => {
		if (newBlackoutDate && !schedule.blackoutDates.includes(newBlackoutDate)) {
			setSchedule(prev => ({
				...prev,
				blackoutDates: [...prev.blackoutDates, newBlackoutDate]
			}));
			setNewBlackoutDate("");
		}
	};

	const handleRemoveBlackoutDate = (date: string) => {
		setSchedule(prev => ({
			...prev,
			blackoutDates: prev.blackoutDates.filter(d => d !== date)
		}));
	};

	const handleSave = async () => {
		if (!currentPackage) return;
		
		try {
			await updateSchedulingMutation.mutateAsync({
				id: currentPackage.id,
				data: {
					...currentPackage,
					isAvailable: schedule.isAvailable,
					availableDays: JSON.stringify(schedule.availableDays),
					availableTimeStart: schedule.availableTimeStart,
					availableTimeEnd: schedule.availableTimeEnd,
					advanceBookingHours: schedule.advanceBookingHours,
					cancellationHours: schedule.cancellationHours,
					// Convert fixedPrice from cents for the API
					fixedPrice: currentPackage.fixedPrice / 100,
				}
			});
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to save package scheduling:", error);
		}
	};

	const isValidTimeRange = schedule.availableTimeStart < schedule.availableTimeEnd;
	const hasAvailableDays = schedule.availableDays.length > 0;
	const canSave = isValidTimeRange && hasAvailableDays;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Manage Schedule for "{packageName}"
					</DialogTitle>
					<DialogDescription>
						Configure when this package is available for booking and set booking constraints.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					<div className="grid gap-6 lg:grid-cols-2">
						{/* Basic Availability */}
						<Card className="h-fit">
							<CardHeader className="pb-4">
								<div className="flex items-center gap-2">
									<div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
										<Clock className="h-4 w-4" />
									</div>
									<div>
										<CardTitle className="text-lg">Basic Availability</CardTitle>
										<CardDescription>
											Enable/disable package and set general availability
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between rounded-lg border p-4">
									<div>
										<Label className="font-medium">Package Available</Label>
										<p className="text-sm text-muted-foreground">
											Master switch for package availability
										</p>
									</div>
									<Switch
										checked={schedule.isAvailable}
										onCheckedChange={(checked) => setSchedule(prev => ({ ...prev, isAvailable: checked }))}
									/>
								</div>

								{schedule.isAvailable && (
									<>
										<div className="space-y-3">
											<Label>Available Days</Label>
											<div className="grid grid-cols-2 gap-3">
												{DAYS_OF_WEEK.map((day) => (
													<div key={day.id} className="flex items-center space-x-2">
														<Checkbox
															id={day.id}
															checked={schedule.availableDays.includes(day.id)}
															onCheckedChange={(checked) => handleDayToggle(day.id, checked as boolean)}
														/>
														<Label htmlFor={day.id} className="text-sm">
															{day.label}
														</Label>
													</div>
												))}
											</div>
											{!hasAvailableDays && (
												<div className="flex items-center gap-2 text-sm text-destructive">
													<AlertCircle className="h-4 w-4" />
													Select at least one available day
												</div>
											)}
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div>
												<Label htmlFor="startTime">Start Time</Label>
												<Input
													id="startTime"
													type="time"
													value={schedule.availableTimeStart}
													onChange={(e) => setSchedule(prev => ({ ...prev, availableTimeStart: e.target.value }))}
												/>
											</div>
											<div>
												<Label htmlFor="endTime">End Time</Label>
												<Input
													id="endTime"
													type="time"
													value={schedule.availableTimeEnd}
													onChange={(e) => setSchedule(prev => ({ ...prev, availableTimeEnd: e.target.value }))}
												/>
											</div>
										</div>
										{!isValidTimeRange && (
											<div className="flex items-center gap-2 text-sm text-destructive">
												<AlertCircle className="h-4 w-4" />
												End time must be after start time
											</div>
										)}
									</>
								)}
							</CardContent>
						</Card>

						{/* Booking Constraints */}
						<Card className="h-fit">
							<CardHeader className="pb-4">
								<div className="flex items-center gap-2">
									<div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
										<Settings className="h-4 w-4" />
									</div>
									<div>
										<CardTitle className="text-lg">Booking Constraints</CardTitle>
										<CardDescription>
											Set booking rules and limitations
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="advanceHours">Advance Booking (Hours)</Label>
									<Input
										id="advanceHours"
										type="number"
										min="0"
										max="720"
										value={schedule.advanceBookingHours}
										onChange={(e) => setSchedule(prev => ({ 
											...prev, 
											advanceBookingHours: parseInt(e.target.value) || 0 
										}))}
									/>
									<p className="text-xs text-muted-foreground mt-1">
										Minimum hours in advance required to book
									</p>
								</div>

								<div>
									<Label htmlFor="cancellationHours">Cancellation Notice (Hours)</Label>
									<Input
										id="cancellationHours"
										type="number"
										min="0"
										max="168"
										value={schedule.cancellationHours}
										onChange={(e) => setSchedule(prev => ({ 
											...prev, 
											cancellationHours: parseInt(e.target.value) || 0 
										}))}
									/>
									<p className="text-xs text-muted-foreground mt-1">
										Hours before service to allow cancellation
									</p>
								</div>

								<div>
									<Label htmlFor="maxBookings">Max Bookings per Day</Label>
									<Input
										id="maxBookings"
										type="number"
										min="1"
										max="100"
										value={schedule.maxBookingsPerDay}
										onChange={(e) => setSchedule(prev => ({ 
											...prev, 
											maxBookingsPerDay: parseInt(e.target.value) || 1 
										}))}
									/>
									<p className="text-xs text-muted-foreground mt-1">
										Maximum bookings allowed per day
									</p>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Blackout Dates */}
					<Card>
						<CardHeader className="pb-4">
							<div className="flex items-center gap-2">
								<div className="p-1.5 bg-red-100 text-red-700 rounded-lg">
									<Calendar className="h-4 w-4" />
								</div>
								<div>
									<CardTitle className="text-lg">Blackout Dates</CardTitle>
									<CardDescription>
										Specific dates when this package is unavailable
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-2">
								<Input
									type="date"
									value={newBlackoutDate}
									onChange={(e) => setNewBlackoutDate(e.target.value)}
									placeholder="Select date"
									className="flex-1"
								/>
								<Button 
									onClick={handleAddBlackoutDate}
									disabled={!newBlackoutDate}
									variant="outline"
								>
									Add Date
								</Button>
							</div>

							{schedule.blackoutDates.length > 0 ? (
								<div className="space-y-2">
									<Label>Blackout Dates</Label>
									<div className="flex flex-wrap gap-2">
										{schedule.blackoutDates.map((date) => (
											<Badge 
												key={date} 
												variant="secondary" 
												className="flex items-center gap-2"
											>
												{new Date(date).toLocaleDateString()}
												<Button
													variant="ghost"
													size="sm"
													className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
													onClick={() => handleRemoveBlackoutDate(date)}
												>
													×
												</Button>
											</Badge>
										))}
									</div>
								</div>
							) : (
								<div className="text-center py-4 text-muted-foreground">
									<Calendar className="mx-auto h-8 w-8 mb-2" />
									<p>No blackout dates configured</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Schedule Summary */}
					<Card className="border-green-200 bg-green-50/50">
						<CardHeader className="pb-4">
							<div className="flex items-center gap-2">
								<div className="p-1.5 bg-green-100 text-green-700 rounded-lg">
									<CheckCircle className="h-4 w-4" />
								</div>
								<div>
									<CardTitle className="text-lg">Schedule Summary</CardTitle>
									<CardDescription>
										Preview of your availability configuration
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										{schedule.isAvailable ? (
											<CheckCircle className="h-4 w-4 text-green-600" />
										) : (
											<AlertCircle className="h-4 w-4 text-red-600" />
										)}
										<span className="font-medium">
											{schedule.isAvailable ? "Available" : "Unavailable"}
										</span>
									</div>
									
									{schedule.isAvailable && (
										<>
											<div className="text-sm">
												<span className="font-medium">Days:</span>{" "}
												{schedule.availableDays.length === 7 
													? "Every day"
													: schedule.availableDays.map(day => 
															DAYS_OF_WEEK.find(d => d.id === day)?.short
														).join(", ")
												}
											</div>
											<div className="text-sm">
												<span className="font-medium">Hours:</span>{" "}
												{schedule.availableTimeStart} - {schedule.availableTimeEnd}
											</div>
										</>
									)}
								</div>

								<div className="space-y-2 text-sm">
									<div>
										<span className="font-medium">Advance booking:</span> {schedule.advanceBookingHours}h
									</div>
									<div>
										<span className="font-medium">Cancellation notice:</span> {schedule.cancellationHours}h
									</div>
									<div>
										<span className="font-medium">Max bookings/day:</span> {schedule.maxBookingsPerDay}
									</div>
									<div>
										<span className="font-medium">Blackout dates:</span> {schedule.blackoutDates.length}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button 
							onClick={handleSave} 
							disabled={!canSave || updateSchedulingMutation.isPending || !currentPackage}
						>
							{updateSchedulingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							<Save className="mr-2 h-4 w-4" />
							Save Schedule
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
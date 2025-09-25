import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import { ImprovedTimePicker } from "./improved-time-picker";

interface DateTimePickerProps {
	selectedDate?: Date;
	selectedTime?: string;
	onDateChange?: (date: Date | undefined) => void;
	onTimeChange?: (time: string) => void;
	dateError?: string;
	timeError?: string;
	dateLabel?: string;
	timeLabel?: string;
	className?: string;
	allowPastDates?: boolean; // Deprecated - no longer used, kept for compatibility
}


export function DateTimePicker({
	selectedDate,
	selectedTime,
	onDateChange,
	onTimeChange,
	dateError,
	timeError,
	dateLabel = "Pickup Date *",
	timeLabel = "Pickup Time *",
	className = "",
	allowPastDates = false
}: DateTimePickerProps) {
	return (
		<div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-5", className)}>
			{/* Date Picker */}
			<div>
				<label className="block text-sm font-semibold text-gray-800 mb-3">
					{dateLabel}
				</label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								"w-full h-12 justify-start text-left text-base",
								!selectedDate && "text-muted-foreground",
								dateError && "border-red-500"
							)}
						>
							<CalendarIcon className="mr-3 h-5 w-5" />
							{selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							selected={selectedDate}
							onSelect={onDateChange}
							disabled={(date) => {
								// Always disable dates before 1900
								if (date < new Date("1900-01-01")) return true;

								// For both admin and customer flows, disable past dates but allow today
								const today = new Date();
								today.setHours(0, 0, 0, 0); // Reset to start of day
								return date < today;
							}}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
				{dateError && (
					<p className="text-red-500 text-sm mt-1 font-medium">{dateError}</p>
				)}
			</div>

			{/* Time Picker */}
			<div>
				<label className="block text-sm font-semibold text-gray-800 mb-3">
					{timeLabel}
				</label>
				<ImprovedTimePicker
					value={selectedTime || ""}
					onChange={(time) => onTimeChange?.(time)}
					placeholder="Select pickup time"
					className={cn(
						"w-full h-12 text-base",
						timeError && "border-red-500"
					)}
				/>
				{timeError && (
					<p className="text-red-500 text-sm mt-1 font-medium">{timeError}</p>
				)}
			</div>
		</div>
	);
}
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";

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
}

const timeSlots = [
	"08:00", "09:00", "10:00", "11:00",
	"12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
	"18:00", "19:00", "20:00", "21:00", "22:00"
];

export function DateTimePicker({
	selectedDate,
	selectedTime,
	onDateChange,
	onTimeChange,
	dateError,
	timeError,
	dateLabel = "Pickup Date *",
	timeLabel = "Pickup Time *",
	className = ""
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
							disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
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
				<select
					value={selectedTime || ""}
					onChange={(e) => onTimeChange?.(e.target.value)}
					className={cn(
						"w-full h-12 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-base",
						timeError && "border-red-500"
					)}
				>
					<option value="">Select time</option>
					{timeSlots.map((time) => (
						<option key={time} value={time}>
							{time}
						</option>
					))}
				</select>
				{timeError && (
					<p className="text-red-500 text-sm mt-1 font-medium">{timeError}</p>
				)}
			</div>
		</div>
	);
}
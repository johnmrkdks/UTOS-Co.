import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"
import { CalendarIcon } from "lucide-react"
import { ImprovedTimePicker } from "./improved-time-picker"

interface ImprovedDateTimePickerProps {
	value?: Date
	onChange: (date: Date | undefined) => void
	placeholder?: string
	disabled?: boolean
	className?: string
	minDate?: Date
}

export function ImprovedDateTimePicker({
	value,
	onChange,
	placeholder = "Select date and time",
	disabled = false,
	className,
	minDate
}: ImprovedDateTimePickerProps) {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(value)
	const [selectedTime, setSelectedTime] = useState<string>(
		value ? format(value, "HH:mm") : ""
	)

	const handleDateSelect = (date: Date | undefined) => {
		setSelectedDate(date)
		if (date && selectedTime) {
			const [hours, minutes] = selectedTime.split(":").map(Number)
			const newDateTime = new Date(date)
			newDateTime.setHours(hours, minutes, 0, 0)
			onChange(newDateTime)
		} else {
			onChange(date)
		}
	}

	const handleTimeSelect = (time: string) => {
		setSelectedTime(time)
		if (selectedDate && time) {
			const [hours, minutes] = time.split(":").map(Number)
			const newDateTime = new Date(selectedDate)
			newDateTime.setHours(hours, minutes, 0, 0)
			onChange(newDateTime)
		}
	}

	const getDisplayValue = () => {
		if (!selectedDate) return placeholder
		
		const dateStr = format(selectedDate, "PPP")
		if (selectedTime) {
			// Convert time to 12-hour format for display
			const [hours, minutes] = selectedTime.split(":").map(Number)
			let displayHour = hours
			const ampm = hours >= 12 ? 'PM' : 'AM'
			
			if (hours === 0) displayHour = 12
			else if (hours > 12) displayHour = hours - 12
			
			const time12 = `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`
			return `${dateStr} at ${time12}`
		}
		
		return dateStr
	}

	return (
		<div className="space-y-3">
			{/* Date Picker */}
			<div>
				<label className="block text-sm font-medium mb-1">Date</label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								"w-full justify-start text-left font-normal h-10 sm:h-12",
								!selectedDate && "text-muted-foreground",
								className
							)}
							disabled={disabled}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{selectedDate ? format(selectedDate, "PPP") : "Select date"}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							selected={selectedDate}
							onSelect={handleDateSelect}
							disabled={(date) => {
								if (minDate) {
									const today = new Date()
									today.setHours(0, 0, 0, 0)
									const compareDate = new Date(date)
									compareDate.setHours(0, 0, 0, 0)
									return compareDate < today
								}
								return false
							}}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</div>

			{/* Time Picker */}
			<div>
				<label className="block text-sm font-medium mb-1">Time</label>
				<ImprovedTimePicker
					value={selectedTime}
					onChange={handleTimeSelect}
					placeholder="Select time"
					disabled={disabled || !selectedDate}
					className="w-full"
				/>
			</div>

			{/* Selected DateTime Display */}
			{selectedDate && selectedTime && (
				<div className="p-3 bg-muted rounded-lg">
					<p className="text-sm font-medium text-muted-foreground">Selected:</p>
					<p className="text-sm">{getDisplayValue()}</p>
				</div>
			)}
		</div>
	)
}
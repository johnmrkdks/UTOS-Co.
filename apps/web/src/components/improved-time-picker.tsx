import { useState, useEffect } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Clock, Search } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface ImprovedTimePickerProps {
	value?: string
	onChange: (time: string) => void
	placeholder?: string
	disabled?: boolean
	className?: string
}

export function ImprovedTimePicker({
	value,
	onChange,
	placeholder = "Select time",
	disabled = false,
	className
}: ImprovedTimePickerProps) {
	const [open, setOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState("")

	// Generate time slots from 12:00 AM to 11:30 PM in 30-minute intervals
	const generateTimeSlots = () => {
		const slots = []
		for (let hour = 0; hour < 24; hour++) {
			for (let minute = 0; minute < 60; minute += 30) {
				const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
				
				// Convert to 12-hour format for display
				let displayHour = hour
				const ampm = hour >= 12 ? 'PM' : 'AM'
				
				if (hour === 0) displayHour = 12
				else if (hour > 12) displayHour = hour - 12
				
				const time12 = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`
				
				slots.push({
					value: time24,
					display: time12,
					searchText: `${time12} ${time24}`.toLowerCase()
				})
			}
		}
		return slots
	}

	const timeSlots = generateTimeSlots()

	// Filter time slots based on search query
	const filteredTimeSlots = searchQuery
		? timeSlots.filter(slot => 
			slot.searchText.includes(searchQuery.toLowerCase())
		)
		: timeSlots

	// Get display value for selected time
	const getDisplayValue = (timeValue?: string) => {
		if (!timeValue) return placeholder
		const slot = timeSlots.find(s => s.value === timeValue)
		return slot ? slot.display : timeValue
	}


	const handleTimeSelect = (timeValue: string) => {
		onChange(timeValue)
		setOpen(false)
		setSearchQuery("")
	}

	// Clear search when popover closes
	useEffect(() => {
		if (!open) {
			setSearchQuery("")
		}
	}, [open])

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn(
						"justify-between font-normal h-10 sm:h-12",
						!value && "text-muted-foreground",
						className
					)}
					disabled={disabled}
				>
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4" />
						{getDisplayValue(value)}
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-0" align="start">
				<div className="p-3 border-b">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search time (e.g., 2pm, 14:30, morning)..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
				</div>


				<ScrollArea className="h-80">
					<div className="p-1">
						{filteredTimeSlots.length === 0 ? (
							<div className="p-3 text-center text-sm text-muted-foreground">
								No times found matching "{searchQuery}"
							</div>
						) : (
							<div className="grid grid-cols-1 gap-1">
								{filteredTimeSlots.map((slot) => (
									<Button
										key={slot.value}
										variant={value === slot.value ? "default" : "ghost"}
										size="sm"
										className="justify-start h-10 text-sm"
										onClick={() => handleTimeSelect(slot.value)}
									>
										{slot.display}
									</Button>
								))}
							</div>
						)}
					</div>
				</ScrollArea>

				{value && (
					<div className="p-3 border-t">
						<Button
							variant="outline"
							size="sm"
							className="w-full"
							onClick={() => handleTimeSelect("")}
						>
							Clear Selection
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	)
}
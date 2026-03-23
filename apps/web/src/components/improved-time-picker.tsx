import { Clock } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

interface ImprovedTimePickerProps {
	value?: string
	onChange: (time: string) => void
	placeholder?: string
	disabled?: boolean
	className?: string
	isMobile?: boolean
}

export function ImprovedTimePicker({
	value,
	onChange,
	placeholder = "Select time",
	disabled = false,
	className,
	isMobile = false
}: ImprovedTimePickerProps) {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value)
	}

	// Convert 24-hour to 12-hour for display
	const getDisplayValue = (timeValue?: string) => {
		if (!timeValue) return placeholder
		const [hourStr, minute] = timeValue.split(':')
		const hour = parseInt(hourStr)
		const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
		const ampm = hour >= 12 ? 'PM' : 'AM'
		return `${displayHour}:${minute} ${ampm}`
	}

	if (isMobile) {
		return (
			<div className="relative">
				<input
					type="time"
					value={value || ""}
					onChange={handleChange}
					disabled={disabled}
					className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
				/>
				<Button
					variant="outline"
					className={cn(
						"w-full h-12 justify-start text-left text-base pointer-events-none",
						!value && "text-muted-foreground",
						className
					)}
					disabled={disabled}
				>
					<Clock className="mr-3 h-5 w-5" />
					{getDisplayValue(value)}
				</Button>
			</div>
		)
	}

	return (
		<Input
			type="time"
			value={value || ""}
			onChange={handleChange}
			disabled={disabled}
			className={cn("bg-background", className)}
		/>
	)
}
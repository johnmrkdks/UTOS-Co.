import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { Clock } from "lucide-react";

interface ImprovedTimePickerProps {
	value?: string;
	onChange: (time: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	isMobile?: boolean;
}

export function ImprovedTimePicker({
	value,
	onChange,
	placeholder = "Select time",
	disabled = false,
	className,
	isMobile = false,
}: ImprovedTimePickerProps) {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
	};

	// Convert 24-hour to 12-hour for display
	const getDisplayValue = (timeValue?: string) => {
		if (!timeValue) return placeholder;
		const [hourStr, minute] = timeValue.split(":");
		const hour = Number.parseInt(hourStr);
		const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
		const ampm = hour >= 12 ? "PM" : "AM";
		return `${displayHour}:${minute} ${ampm}`;
	};

	if (isMobile) {
		return (
			<div className="relative">
				<input
					type="time"
					value={value || ""}
					onChange={handleChange}
					disabled={disabled}
					className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
				/>
				<Button
					variant="outline"
					className={cn(
						"pointer-events-none h-12 w-full justify-start text-left text-base",
						!value && "text-muted-foreground",
						className,
					)}
					disabled={disabled}
				>
					<Clock className="mr-3 h-5 w-5" />
					{getDisplayValue(value)}
				</Button>
			</div>
		);
	}

	return (
		<Input
			type="time"
			value={value || ""}
			onChange={handleChange}
			disabled={disabled}
			className={cn("bg-background", className)}
		/>
	);
}

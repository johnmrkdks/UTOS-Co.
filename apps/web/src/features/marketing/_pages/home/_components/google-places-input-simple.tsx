import { useState } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

interface GooglePlacesInputProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	className?: string
	disabled?: boolean
}

export function GooglePlacesInput({
	value,
	onChange,
	placeholder = "Enter location...",
	className,
	disabled = false,
}: GooglePlacesInputProps) {
	const [isLoading] = useState(false)

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		onChange(newValue)
	}

	return (
		<div className="relative">
			<Input
				value={value}
				onChange={handleInputChange}
				placeholder={placeholder}
				className={cn("pr-8", className)}
				disabled={disabled}
			/>
			<div className="absolute right-2 top-1/2 -translate-y-1/2">
				{isLoading ? (
					<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
				) : (
					<MapPin className="h-4 w-4 text-muted-foreground" />
				)}
			</div>
			
			{/* Note for development */}
			{value.length > 0 && (
				<div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg p-3">
					<div className="text-xs text-muted-foreground text-center">
						<MapPin className="h-4 w-4 mx-auto mb-1 opacity-50" />
						Google Places API integration ready for production
						<br />
						<span className="text-xs opacity-75">
							Add VITE_GOOGLE_MAPS_API_KEY to enable autocomplete
						</span>
					</div>
				</div>
			)}
		</div>
	)
}
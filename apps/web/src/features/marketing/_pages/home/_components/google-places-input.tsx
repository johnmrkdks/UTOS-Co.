import { useState, useRef, useEffect } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useGooglePlacesAutocomplete } from "../_hooks/use-google-places-autocomplete"

interface PlaceResult {
	placeId: string
	description: string
	mainText: string
	secondaryText: string
}

interface GooglePlacesInputProps {
	value: string
	onChange: (value: string) => void
	onPlaceSelect?: (place: PlaceResult) => void
	placeholder?: string
	className?: string
	disabled?: boolean
}

export function GooglePlacesInput({
	value,
	onChange,
	onPlaceSelect,
	placeholder = "Enter location...",
	className,
	disabled = false,
}: GooglePlacesInputProps) {
	const [showPredictions, setShowPredictions] = useState(false)
	const [inputValue, setInputValue] = useState(value)
	const containerRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	const { isLoaded, predictions, isLoading, getPlacePredictions } = useGooglePlacesAutocomplete({
		componentRestrictions: { country: "au" },
		types: ["geocode"],
		onPlaceSelect: (place) => {
			setInputValue(place.description)
			onChange(place.description)
			onPlaceSelect?.(place)
			setShowPredictions(false)
		},
	})

	// Handle input changes
	const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		setInputValue(newValue)
		onChange(newValue)

		if (newValue.trim().length > 2) {
			await getPlacePredictions(newValue)
			setShowPredictions(true)
		} else {
			setShowPredictions(false)
		}
	}

	// Handle prediction selection
	const handlePredictionSelect = (prediction: PlaceResult) => {
		setInputValue(prediction.description)
		onChange(prediction.description)
		onPlaceSelect?.(prediction)
		setShowPredictions(false)
	}

	// Handle input focus
	const handleInputFocus = () => {
		if (predictions.length > 0) {
			setShowPredictions(true)
		}
	}

	// Handle click outside to close predictions
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setShowPredictions(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])

	// Sync external value changes
	useEffect(() => {
		if (value !== inputValue) {
			setInputValue(value)
		}
	}, [value])

	return (
		<div ref={containerRef} className="relative">
			<div className="relative">
				<Input
					ref={inputRef}
					value={inputValue}
					onChange={handleInputChange}
					onFocus={handleInputFocus}
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
			</div>

			{/* API Not Loaded Warning */}
			{!isLoaded && inputValue.length > 0 && (
				<div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg p-3">
					<div className="text-sm text-muted-foreground text-center">
						<MapPin className="h-4 w-4 mx-auto mb-1 opacity-50" />
						Google Places API loading...
					</div>
				</div>
			)}

			{/* Predictions Dropdown */}
			{showPredictions && predictions.length > 0 && isLoaded && (
				<div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
					{predictions.map((prediction) => (
						<Button
							key={prediction.placeId}
							variant="ghost"
							className="w-full justify-start h-auto p-3 text-left hover:bg-muted/50"
							onClick={() => handlePredictionSelect(prediction)}
						>
							<div className="flex items-start gap-2 w-full">
								<MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
								<div className="flex-1 min-w-0">
									<div className="font-medium text-sm truncate">
										{prediction.mainText}
									</div>
									{prediction.secondaryText && (
										<div className="text-xs text-muted-foreground truncate">
											{prediction.secondaryText}
										</div>
									)}
								</div>
							</div>
						</Button>
					))}
					<div className="px-3 py-2 border-t bg-muted/20">
						<div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
							<img 
								src="https://developers.google.com/maps/documentation/places/web-service/images/powered_by_google_on_white.png" 
								alt="Powered by Google" 
								className="h-3"
							/>
						</div>
					</div>
				</div>
			)}

			{/* No Results */}
			{showPredictions && predictions.length === 0 && !isLoading && inputValue.length > 2 && isLoaded && (
				<div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg p-3">
					<div className="text-sm text-muted-foreground text-center">
						<MapPin className="h-4 w-4 mx-auto mb-1 opacity-50" />
						No locations found. Try a different search term.
					</div>
				</div>
			)}
		</div>
	)
}
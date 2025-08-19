import { useState, useEffect, useRef, useCallback } from "react"
import { MapPin, Loader2, X } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { useGooglePlacesAutocomplete } from "../_hooks/use-google-places-autocomplete"

interface GooglePlacesInputProps {
	value: string
	onChange: (value: string) => void
	onPlaceSelect?: (place: { placeId: string; description: string; geometry?: any }) => void
	placeholder?: string
	className?: string
	disabled?: boolean
}

interface PlaceResult {
	placeId: string
	description: string
	mainText: string
	secondaryText: string
}

export function GooglePlacesInput({
	value,
	onChange,
	onPlaceSelect,
	placeholder = "Enter location in Australia...",
	className,
	disabled = false,
}: GooglePlacesInputProps) {
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(-1)
	const suggestionsRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	
	const {
		isLoaded,
		predictions,
		isLoading,
		getPlacePredictions,
	} = useGooglePlacesAutocomplete({
		componentRestrictions: { country: "au" },
		types: ["geocode", "establishment"],
	})

	const handleInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		onChange(newValue)
		setSelectedIndex(-1)
		
		if (newValue.trim() && isLoaded) {
			await getPlacePredictions(newValue)
			setShowSuggestions(true)
		} else {
			setShowSuggestions(false)
		}
	}, [onChange, isLoaded, getPlacePredictions])

	const handlePlaceSelect = useCallback(async (placeId: string, description: string) => {
		onChange(description)
		setShowSuggestions(false)
		setSelectedIndex(-1)

		// Get place details including geometry if onPlaceSelect is provided
		if (onPlaceSelect && isLoaded && (window as any).google?.maps?.places) {
			const service = new (window as any).google.maps.places.PlacesService(
				document.createElement('div')
			)
			
			service.getDetails(
				{
					placeId,
					fields: ['place_id', 'formatted_address', 'geometry'],
				},
				(place: any, status: any) => {
					if (status === (window as any).google.maps.places.PlacesServiceStatus.OK) {
						onPlaceSelect({
							placeId,
							description,
							geometry: place.geometry,
						})
					}
				}
			)
		}
	}, [onChange, onPlaceSelect, isLoaded])

	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (!showSuggestions || predictions.length === 0) return

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault()
				setSelectedIndex(prev => (prev < predictions.length - 1 ? prev + 1 : prev))
				break
			case 'ArrowUp':
				e.preventDefault()
				setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
				break
			case 'Enter':
				e.preventDefault()
				if (selectedIndex >= 0 && predictions[selectedIndex]) {
					const prediction = predictions[selectedIndex]
					handlePlaceSelect(prediction.placeId, prediction.description)
				}
				break
			case 'Escape':
				setShowSuggestions(false)
				setSelectedIndex(-1)
				break
		}
	}, [showSuggestions, predictions, selectedIndex, handlePlaceSelect])

	const clearInput = useCallback(() => {
		onChange("")
		setShowSuggestions(false)
		setSelectedIndex(-1)
		inputRef.current?.focus()
	}, [onChange])

	// Close suggestions when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
				setShowSuggestions(false)
				setSelectedIndex(-1)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<div className="relative" ref={suggestionsRef}>
			<Input
				ref={inputRef}
				value={value}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				className={cn("pr-16", className)}
				disabled={disabled}
			/>
			
			<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
				{value && (
					<button
						type="button"
						onClick={clearInput}
						className="p-0.5 hover:bg-muted rounded-full transition-colors"
						tabIndex={-1}
					>
						<X className="h-3 w-3 text-muted-foreground" />
					</button>
				)}
				{isLoading ? (
					<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
				) : (
					<MapPin className="h-4 w-4 text-muted-foreground" />
				)}
			</div>
			
			{/* Suggestions dropdown */}
			{showSuggestions && predictions.length > 0 && (
				<div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
					{predictions.map((prediction, index) => (
						<button
							key={prediction.placeId}
							type="button"
							className={cn(
								"w-full px-3 py-2 text-left text-sm hover:bg-muted/50 focus:bg-muted/50 transition-colors border-none bg-transparent",
								index === selectedIndex && "bg-muted/50"
							)}
							onClick={() => handlePlaceSelect(prediction.placeId, prediction.description)}
						>
							<div className="flex items-start gap-2">
								<MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
								<div className="flex-1 min-w-0">
									<div className="font-medium text-foreground truncate">
										{prediction.mainText}
									</div>
									{prediction.secondaryText && (
										<div className="text-xs text-muted-foreground truncate">
											{prediction.secondaryText}
										</div>
									)}
								</div>
							</div>
						</button>
					))}
				</div>
			)}

			{/* Loading state when no API key */}
			{!isLoaded && value.length > 0 && (
				<div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg p-3">
					<div className="text-xs text-muted-foreground text-center">
						<Loader2 className="h-4 w-4 mx-auto mb-1 animate-spin" />
						Loading Google Places API...
					</div>
				</div>
			)}
		</div>
	)
}
import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"

const DEBOUNCE_MS = 300
const MIN_CHARS = 2
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
	onRemove?: () => void
	showRemoveButton?: boolean
}

export function GooglePlacesInput({
	value,
	onChange,
	onPlaceSelect,
	placeholder = "Enter address in Australia...",
	className,
	disabled = false,
	onRemove,
	showRemoveButton = false,
}: GooglePlacesInputProps) {
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(-1)
	const suggestionsRef = useRef<HTMLDivElement>(null)
	const inputWrapperRef = useRef<HTMLDivElement>(null)
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
	const {
		isLoaded,
		predictions,
		isLoading,
		getPlacePredictions,
		fetchPlaceDetails,
	} = useGooglePlacesAutocomplete({
		componentRestrictions: { country: "au" },
		types: ["geocode", "establishment"],
	})

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value
			onChange(newValue)
			setSelectedIndex(-1)

			if (debounceRef.current) clearTimeout(debounceRef.current)

			if (newValue.trim().length < MIN_CHARS) {
				setShowSuggestions(false)
				return
			}

			debounceRef.current = setTimeout(async () => {
				debounceRef.current = null
				await getPlacePredictions(newValue)
				setShowSuggestions(true)
			}, DEBOUNCE_MS)
		},
		[onChange, getPlacePredictions]
	)

	const handlePlaceSelect = useCallback(
		async (predictionIndex: number) => {
			const p = predictions[predictionIndex]
			if (!p) return
			onChange(p.description)
			setShowSuggestions(false)
			setSelectedIndex(-1)
			if (onPlaceSelect && isLoaded && fetchPlaceDetails) {
				const details = await fetchPlaceDetails(predictionIndex)
				if (details) {
					onPlaceSelect({
						placeId: details.placeId,
						description: details.description,
						geometry: details.geometry,
					})
				}
			}
		},
		[onChange, onPlaceSelect, isLoaded, predictions, fetchPlaceDetails]
	)

	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (!showSuggestions || !predictions || predictions.length === 0) return

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
					handlePlaceSelect(selectedIndex)
				}
				break
			case 'Escape':
				setShowSuggestions(false)
				setSelectedIndex(-1)
				break
		}
	}, [showSuggestions, predictions, selectedIndex, handlePlaceSelect])


	useEffect(() => {
		if (showSuggestions && predictions.length > 0 && inputWrapperRef.current) {
			const rect = inputWrapperRef.current.getBoundingClientRect()
			setDropdownPosition({
				top: rect.bottom + 4,
				left: rect.left,
				width: Math.max(rect.width, 200),
			})
		}
	}, [showSuggestions, predictions.length])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node
			const isInInput = suggestionsRef.current?.contains(target)
			const dropdown = document.querySelector('[data-address-dropdown]')
			const isInDropdown = dropdown?.contains(target)
			if (!isInInput && !isInDropdown) {
				setShowSuggestions(false)
				setSelectedIndex(-1)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			if (debounceRef.current) clearTimeout(debounceRef.current)
		}
	}, [])

	return (
		<div className="relative" ref={suggestionsRef}>
			<div className="relative" ref={inputWrapperRef}>
				<div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
					) : (
						<MapPin className="h-4 w-4 text-muted-foreground" />
					)}
				</div>

				<Input
					value={value}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className={cn("pl-8", showRemoveButton ? "pr-8" : "pr-4", className)}
					disabled={disabled}
				/>

				{showRemoveButton && onRemove && (
					<div className="absolute right-2 top-1/2 -translate-y-1/2">
						<button
							type="button"
							onClick={onRemove}
							className="p-0.5 hover:bg-muted rounded-full transition-colors"
							tabIndex={-1}
						>
							<X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
						</button>
					</div>
				)}
			</div>

			{/* Suggestions dropdown - portal to escape overflow */}
			{showSuggestions && predictions && predictions.length > 0 && dropdownPosition.width > 0 && typeof document !== "undefined" &&
				createPortal(
					<div
						data-address-dropdown
						className="fixed z-[9999] bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto"
						style={{
							top: dropdownPosition.top,
							left: dropdownPosition.left,
							width: dropdownPosition.width,
							minWidth: 200,
						}}
					>
						{predictions.map((prediction, index) => (
							<button
								key={prediction.placeId}
								type="button"
								className={cn(
									"w-full px-3 py-2 text-left text-sm hover:bg-muted/50 focus:bg-muted/50 transition-colors border-none bg-transparent",
									index === selectedIndex && "bg-muted/50"
								)}
								onClick={() => handlePlaceSelect(index)}
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
						<div className="px-3 py-2 border-t bg-muted/20">
							<img
								src="https://developers.google.com/static/maps/documentation/places/web-service/images/powered_by_google_on_white.png"
								alt="Powered by Google"
								className="h-3 mx-auto"
							/>
						</div>
					</div>,
					document.body
				)}
		</div>
	)
}

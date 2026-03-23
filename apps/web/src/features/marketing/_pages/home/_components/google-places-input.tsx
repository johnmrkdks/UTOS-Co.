import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { Loader2, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGooglePlacesAutocomplete } from "../_hooks/use-google-places-autocomplete";

interface PlaceResult {
	placeId: string;
	description: string;
	mainText: string;
	secondaryText: string;
}

interface GooglePlacesInputProps {
	value: string;
	onChange: (value: string) => void;
	onPlaceSelect?: (place: PlaceResult) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export function GooglePlacesInput({
	value,
	onChange,
	onPlaceSelect,
	placeholder = "Enter location...",
	className,
	disabled = false,
}: GooglePlacesInputProps) {
	const [showPredictions, setShowPredictions] = useState(false);
	const [inputValue, setInputValue] = useState(value);
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const { isLoaded, predictions, isLoading, getPlacePredictions } =
		useGooglePlacesAutocomplete({
			componentRestrictions: { country: "au" },
			types: ["geocode"],
			onPlaceSelect: (place) => {
				setInputValue(place.description);
				onChange(place.description);
				onPlaceSelect?.(place);
				setShowPredictions(false);
			},
		});

	// Handle input changes
	const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setInputValue(newValue);
		onChange(newValue);

		if (newValue.trim().length > 2) {
			await getPlacePredictions(newValue);
			setShowPredictions(true);
		} else {
			setShowPredictions(false);
		}
	};

	// Handle prediction selection
	const handlePredictionSelect = (prediction: PlaceResult) => {
		setInputValue(prediction.description);
		onChange(prediction.description);
		onPlaceSelect?.(prediction);
		setShowPredictions(false);
	};

	// Handle input focus
	const handleInputFocus = () => {
		if (predictions.length > 0) {
			setShowPredictions(true);
		}
	};

	// Handle click outside to close predictions
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setShowPredictions(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Sync external value changes
	useEffect(() => {
		if (value !== inputValue) {
			setInputValue(value);
		}
	}, [value]);

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
				<div className="-translate-y-1/2 absolute top-1/2 right-2">
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
					) : (
						<MapPin className="h-4 w-4 text-muted-foreground" />
					)}
				</div>
			</div>

			{/* API Not Loaded Warning */}
			{!isLoaded && inputValue.length > 0 && (
				<div className="absolute z-50 mt-1 w-full rounded-md border bg-background p-3 shadow-lg">
					<div className="text-center text-muted-foreground text-sm">
						<MapPin className="mx-auto mb-1 h-4 w-4 opacity-50" />
						Google Places API loading...
					</div>
				</div>
			)}

			{/* Predictions Dropdown */}
			{showPredictions && predictions.length > 0 && isLoaded && (
				<div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
					{predictions.map((prediction) => (
						<Button
							key={prediction.placeId}
							variant="ghost"
							className="h-auto w-full justify-start p-3 text-left hover:bg-muted/50"
							onClick={() => handlePredictionSelect(prediction)}
						>
							<div className="flex w-full items-start gap-2">
								<MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
								<div className="min-w-0 flex-1">
									<div className="truncate font-medium text-sm">
										{prediction.mainText}
									</div>
									{prediction.secondaryText && (
										<div className="truncate text-muted-foreground text-xs">
											{prediction.secondaryText}
										</div>
									)}
								</div>
							</div>
						</Button>
					))}
					<div className="border-t bg-muted/20 px-3 py-2">
						<div className="flex items-center justify-center gap-1 text-center text-muted-foreground text-xs">
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
			{showPredictions &&
				predictions.length === 0 &&
				!isLoading &&
				inputValue.length > 2 &&
				isLoaded && (
					<div className="absolute z-50 mt-1 w-full rounded-md border bg-background p-3 shadow-lg">
						<div className="text-center text-muted-foreground text-sm">
							<MapPin className="mx-auto mb-1 h-4 w-4 opacity-50" />
							No locations found. Try a different search term.
						</div>
					</div>
				)}
		</div>
	);
}

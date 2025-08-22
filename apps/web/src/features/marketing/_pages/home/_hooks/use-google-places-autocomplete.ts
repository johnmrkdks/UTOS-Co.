import { useEffect, useRef, useState } from "react"

interface PlaceResult {
	placeId: string
	description: string
	mainText: string
	secondaryText: string
}

interface UseGooglePlacesAutocompleteOptions {
	onPlaceSelect?: (place: PlaceResult) => void
	componentRestrictions?: {
		country: string
		administrative_area?: string
	}
	types?: string[]
}

// Google Maps types
declare const google: any;

export function useGooglePlacesAutocomplete(options: UseGooglePlacesAutocompleteOptions = {}) {
	const inputRef = useRef<HTMLInputElement>(null)
	const autocompleteRef = useRef<any>(null)
	const [isLoaded, setIsLoaded] = useState(false)
	const [predictions, setPredictions] = useState<PlaceResult[]>([])
	const [isLoading, setIsLoading] = useState(false)

	// Load Google Maps JavaScript API
	useEffect(() => {
		if (typeof window === "undefined") return

		// Check if Google Maps is already loaded
		if (typeof window !== 'undefined' && (window as any).google?.maps?.places) {
			setIsLoaded(true)
			return
		}

		// Create script tag to load Google Maps API
		const script = document.createElement("script")
		script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE"}&libraries=places`
		script.async = true
		script.defer = true

		script.onload = () => {
			setIsLoaded(true)
		}

		script.onerror = () => {
			console.error("Failed to load Google Maps JavaScript API")
		}

		document.head.appendChild(script)

		return () => {
			// Clean up script if component unmounts
			const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
			if (existingScript) {
				document.head.removeChild(existingScript)
			}
		}
	}, [])

	// Initialize autocomplete when Google Maps is loaded and input ref is available
	useEffect(() => {
		if (!isLoaded || !inputRef.current) return

		try {
			// Configure autocomplete options
			const autocompleteOptions = {
				componentRestrictions: options.componentRestrictions || { country: "au" },
				types: options.types || ["geocode", "establishment"],
				fields: ["place_id", "formatted_address", "name", "address_components", "geometry"],
			}

			// Initialize autocomplete
			autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(
				inputRef.current,
				autocompleteOptions
			)

			// Add place selection listener
			const listener = autocompleteRef.current.addListener("place_changed", () => {
				const place = autocompleteRef.current?.getPlace()

				if (place && place.place_id && options.onPlaceSelect) {
					const placeResult: PlaceResult = {
						placeId: place.place_id,
						description: place.formatted_address || place.name || "",
						mainText: place.name || "",
						secondaryText: place.formatted_address || "",
					}
					options.onPlaceSelect(placeResult)
				}
			})

			return () => {
				if (listener) {
					(window as any).google.maps.event.removeListener(listener)
				}
			}
		} catch (error) {
			console.error("Error initializing Google Places Autocomplete:", error)
		}
	}, [isLoaded, options.onPlaceSelect, options.componentRestrictions, options.types])

	// Manual prediction fetching (alternative to widget approach)
	const getPlacePredictions = async (input: string): Promise<PlaceResult[]> => {
		if (!isLoaded || !input.trim()) {
			setPredictions([])
			return []
		}

		setIsLoading(true)

		return new Promise((resolve) => {
			const service = new (window as any).google.maps.places.AutocompleteService()

			service.getPlacePredictions(
				{
					input: input.trim(),
					componentRestrictions: options.componentRestrictions || { country: "au" },
					types: options.types || ["geocode", "establishment"],
				},
				(predictions: any[] | null, status: any) => {
					setIsLoading(false)

					if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
						// Filter results to only include NSW locations
						const filteredPredictions = predictions.filter((prediction) => {
							const description = prediction.description || ""
							// Check if the description contains NSW, New South Wales, or common NSW abbreviations
							return description.includes("NSW") || 
								description.includes("New South Wales") ||
								description.includes("Sydney") ||
								description.includes("Newcastle") ||
								description.includes("Wollongong") ||
								description.includes("Blue Mountains") ||
								description.includes("Central Coast")
						})

						const results: PlaceResult[] = filteredPredictions.map((prediction) => ({
							placeId: prediction.place_id,
							description: prediction.description,
							mainText: prediction.structured_formatting.main_text,
							secondaryText: prediction.structured_formatting.secondary_text || "",
						}))

						setPredictions(results)
						resolve(results)
					} else {
						setPredictions([])
						resolve([])
					}
				}
			)
		})
	}

	return {
		inputRef,
		isLoaded,
		predictions,
		isLoading,
		getPlacePredictions,
	}
}

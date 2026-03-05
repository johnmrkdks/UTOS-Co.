import { useEffect, useRef, useState } from "react"
import { setOptions, importLibrary } from "@googlemaps/js-api-loader"

interface PlaceResult {
	placeId: string
	description: string
	mainText: string
	secondaryText: string
}

interface UseGooglePlacesAutocompleteOptions {
	onPlaceSelect?: (
		place: PlaceResult & { geometry?: { location: { lat: () => number; lng: () => number } } }
	) => void
	componentRestrictions?: {
		country: string
		administrative_area?: string
	}
	types?: string[]
}

// Types for new Places API
interface AutocompleteSuggestionType {
	fetchAutocompleteSuggestions: (
		req: AutocompleteRequest
	) => Promise<{ suggestions: Array<{ placePrediction: PlacePrediction }> }>
}

interface AutocompleteRequest {
	input: string
	sessionToken?: unknown
	includedRegionCodes?: string[]
}

interface PlacePrediction {
	placeId: string
	text: { text: string }
	mainText?: { text: string }
	secondaryText?: { text: string }
	toPlace: () => PlaceObject
}

interface PlaceObject {
	fetchFields: (opts: { fields: string[] }) => Promise<void>
	formattedAddress?: string
	location?: { lat: () => number; lng: () => number }
}

let loadPromise: Promise<void> | null = null

function ensureGoogleMapsLoaded(): Promise<void> {
	if (loadPromise) return loadPromise

	const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
	if (!apiKey) {
		loadPromise = Promise.reject(new Error("VITE_GOOGLE_MAPS_API_KEY is not set"))
		return loadPromise
	}

	loadPromise = (async () => {
		setOptions({
			key: apiKey,
			v: "weekly",
		})
		// Load places library - this triggers the actual API load
		await importLibrary("places")
	})()

	return loadPromise
}

export function useGooglePlacesAutocomplete(options: UseGooglePlacesAutocompleteOptions = {}) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [isLoaded, setIsLoaded] = useState(false)
	const [predictions, setPredictions] = useState<PlaceResult[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const suggestionsRef = useRef<Array<{ placePrediction: PlacePrediction }>>([])
	const sessionTokenRef = useRef<unknown>(null)

	// Load Google Maps API on mount
	useEffect(() => {
		ensureGoogleMapsLoaded()
			.then(() => setIsLoaded(true))
			.catch((err) => console.error("Failed to load Google Maps:", err))
	}, [])

	// Fetch suggestions using new AutocompleteSuggestion API
	const getPlacePredictions = async (input: string): Promise<PlaceResult[]> => {
		if (!input.trim()) {
			setPredictions([])
			suggestionsRef.current = []
			return []
		}

		setIsLoading(true)

		try {
			if (!isLoaded) {
				await ensureGoogleMapsLoaded()
				setIsLoaded(true)
			}

			const { AutocompleteSuggestion, AutocompleteSessionToken } =
				await importLibrary("places") as { AutocompleteSuggestion: AutocompleteSuggestionType; AutocompleteSessionToken: new () => unknown }

			// New session token for each typing session (billing best practice)
			sessionTokenRef.current = new AutocompleteSessionToken()

			const request: AutocompleteRequest = {
				input: input.trim(),
				sessionToken: sessionTokenRef.current,
				includedRegionCodes: [options.componentRestrictions?.country || "au"],
			}

			const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
			suggestionsRef.current = suggestions ?? []

			const results: PlaceResult[] = (suggestions ?? [])
				.filter((s) => s?.placePrediction)
				.map((s) => {
					const p = s.placePrediction
					return {
						placeId: p.placeId,
						description: p.text?.text ?? "",
						mainText: p.mainText?.text ?? p.text?.text ?? "",
						secondaryText: p.secondaryText?.text ?? "",
					}
				})

			setPredictions(results)
			return results
		} catch (err) {
			console.error("Places Autocomplete error:", err)
			setPredictions([])
			suggestionsRef.current = []
			return []
		} finally {
			setIsLoading(false)
		}
	}

	// Fetch place details using Place.fetchFields (new API)
	const fetchPlaceDetails = async (
		predictionIndex: number
	): Promise<{ placeId: string; description: string; geometry?: { location: { lat: () => number; lng: () => number } } } | null> => {
		const suggestion = suggestionsRef.current[predictionIndex]
		if (!suggestion?.placePrediction) return null

		try {
			const place = suggestion.placePrediction.toPlace()
			await place.fetchFields({ fields: ["formattedAddress", "location"] })

			const geometry = place.location
				? { location: place.location }
				: undefined

			return {
				placeId: suggestion.placePrediction.placeId,
				description: place.formattedAddress ?? predictions[predictionIndex]?.description ?? "",
				geometry,
			}
		} catch (err) {
			console.error("Fetch place details error:", err)
			return null
		}
	}

	return {
		inputRef,
		isLoaded,
		predictions,
		isLoading,
		getPlacePredictions,
		fetchPlaceDetails,
	}
}

import { useEffect, useRef, useState } from "react"

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

// Extend Window for Maps bootstrap - avoid conflict with other google types
interface GoogleMapsWindow extends Window {
	__googleMapsBootstrapped?: Promise<void>
}

interface AutocompleteRequest {
	input: string
	sessionToken?: AutocompleteSessionToken
	includedRegionCodes?: string[]
	includedPrimaryTypes?: string[]
}

interface AutocompleteSessionToken {}

interface AutocompleteSuggestion {
	placePrediction: {
		placeId: string
		text: { text: string }
		mainText?: { text: string }
		secondaryText?: { text: string }
		toPlace: () => PlaceObject
	}
}

interface PlaceObject {
	fetchFields: (opts: { fields: string[] }) => Promise<void>
	formattedAddress?: string
	location?: { lat: () => number; lng: () => number }
}

// Bootstrap loader for Maps API - enables importLibrary() for new Places API
// See: https://developers.google.com/maps/documentation/javascript/load-maps-js-api
const BOOTSTRAP_LOADER =
	"(g=>{var h,a,k,p='The Google Maps JavaScript API',c='google',l='importLibrary',q='__ib__',m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement('script'));e.set('libraries',[...r]+'');for(k in g)e.set(k.replace(/[A-Z]/g,t=>'_'+t[0].toLowerCase()),g[k]);e.set('callback',c+'.maps.'+q);a.src='https://maps.'+c+'apis.com/maps/api/js?'+e;d[q]=f;a.onerror=()=>h=n(Error(p+' could not load.'));a.nonce=m.querySelector('script[nonce]')?.nonce||'';m.head.append(a)}));d[l]?console.warn(p+' only loads once. Ignoring:',g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})"

function loadGoogleMapsApi(): Promise<void> {
	if (typeof window === "undefined") return Promise.reject(new Error("window undefined"))
	const win = window as GoogleMapsWindow
	if (win.__googleMapsBootstrapped) return win.__googleMapsBootstrapped

	const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE"
	const existingBootstrap = document.querySelector('script[data-google-maps-bootstrap]')
	if (existingBootstrap) {
		win.__googleMapsBootstrapped = new Promise((resolve) => {
			const check = () => {
				if ((window as any).google?.maps?.importLibrary) resolve()
				else setTimeout(check, 50)
			}
			check()
		})
		return win.__googleMapsBootstrapped
	}

	win.__googleMapsBootstrapped = new Promise((resolve, reject) => {
		const script = document.createElement("script")
		script.setAttribute("data-google-maps-bootstrap", "true")
		script.textContent = `${BOOTSTRAP_LOADER}({key:${JSON.stringify(apiKey)},v:"weekly"});`
		script.onload = () => {
			const check = () => {
				if ((window as any).google?.maps?.importLibrary) resolve()
				else setTimeout(check, 50)
			}
			check()
		}
		script.onerror = () => reject(new Error("Failed to load Google Maps JavaScript API"))
		document.head.appendChild(script)
	})

	return win.__googleMapsBootstrapped
}

export function useGooglePlacesAutocomplete(options: UseGooglePlacesAutocompleteOptions = {}) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [isLoaded, setIsLoaded] = useState(false)
	const [predictions, setPredictions] = useState<PlaceResult[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const suggestionsRef = useRef<AutocompleteSuggestion[]>([])
	const sessionTokenRef = useRef<AutocompleteSessionToken | undefined>(undefined)

	// Load Google Maps API with bootstrap loader (supports importLibrary for new Places API)
	useEffect(() => {
		if (typeof window === "undefined") return

		loadGoogleMapsApi()
			.then(() => setIsLoaded(true))
			.catch((err) => console.error("Failed to load Google Maps:", err))
	}, [])

	// Fetch suggestions using new AutocompleteSuggestion API
	const getPlacePredictions = async (input: string): Promise<PlaceResult[]> => {
		if (!isLoaded || !input.trim()) {
			setPredictions([])
			suggestionsRef.current = []
			return []
		}

		setIsLoading(true)

		try {
			const { AutocompleteSuggestion, AutocompleteSessionToken } =
				await (window as any).google.maps.importLibrary("places")

			// New session token for each typing session (billing best practice)
			sessionTokenRef.current = new AutocompleteSessionToken()

			const request: AutocompleteRequest = {
				input: input.trim(),
				sessionToken: sessionTokenRef.current,
				includedRegionCodes: [options.componentRestrictions?.country || "au"],
			}
			// Omitting includedPrimaryTypes returns all types (addresses, establishments, etc.)

			const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
			suggestionsRef.current = suggestions

			const results: PlaceResult[] = suggestions
				.filter((s: AutocompleteSuggestion) => s.placePrediction)
				.map((s: AutocompleteSuggestion) => {
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
			console.error("Autocomplete error:", err)
			setPredictions([])
			suggestionsRef.current = []
			return []
		} finally {
			setIsLoading(false)
		}
	}

	// Fetch place details using Place.fetchFields (new API) - must use same session as predictions
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

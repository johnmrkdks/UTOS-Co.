// Configuration for Google Maps API
// To use Google Places autocomplete, you need to:
// 1. Get a Google Maps API key from Google Cloud Console
// 2. Enable the Places API (New) for your project
// 3. Add the API key to your environment variables
// 4. For development: add VITE_GOOGLE_MAPS_API_KEY to your .env file
// 5. For production: add the environment variable to your hosting provider

export const GOOGLE_MAPS_CONFIG = {
	// In a real app, this would come from environment variables
	// For now, we're using a placeholder that will need to be replaced
	apiKey:
		import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY_HERE",
	libraries: ["places"] as const,
	// Restrict autocomplete to Australia only
	// Note: NSW filtering will be handled in application logic
	componentRestrictions: {
		country: "au" as const,
	},
	// Supported place types for autocomplete
	types: ["geocode"] as const,
};

export const GOOGLE_MAPS_SCRIPT_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.apiKey}&libraries=${GOOGLE_MAPS_CONFIG.libraries.join(",")}`;

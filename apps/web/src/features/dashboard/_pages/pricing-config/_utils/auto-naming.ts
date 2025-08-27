/**
 * Generates a meaningful pricing configuration name based on car details
 */
export function generatePricingConfigName(carName: string, carBrand?: string, carModel?: string): string {
	// Clean and format the car name
	const cleanCarName = carName.trim();
	
	// If car name already includes brand/model info, use it as-is
	if (cleanCarName.toLowerCase().includes('pricing') || 
		cleanCarName.toLowerCase().includes('config')) {
		return cleanCarName;
	}
	
	// Generate a descriptive name
	let configName = '';
	
	// Use brand and model if available and not already in car name
	if (carBrand && carModel) {
		const brandModel = `${carBrand} ${carModel}`;
		if (!cleanCarName.toLowerCase().includes(carBrand.toLowerCase()) ||
			!cleanCarName.toLowerCase().includes(carModel.toLowerCase())) {
			configName = `${brandModel} Pricing`;
		} else {
			configName = `${cleanCarName} Pricing`;
		}
	} else {
		configName = `${cleanCarName} Pricing`;
	}
	
	return configName;
}

/**
 * Generates alternative naming suggestions
 */
export function generateNamingSuggestions(carName: string, carBrand?: string, carModel?: string): string[] {
	const cleanCarName = carName.trim();
	const suggestions: string[] = [];
	
	// Primary suggestion
	suggestions.push(generatePricingConfigName(carName, carBrand, carModel));
	
	// Alternative suggestions
	suggestions.push(`${cleanCarName} Rates`);
	suggestions.push(`${cleanCarName} Fare Config`);
	
	if (carBrand && carModel) {
		suggestions.push(`${carBrand} ${carModel} Standard`);
	}
	
	// Remove duplicates and return
	return [...new Set(suggestions)];
}
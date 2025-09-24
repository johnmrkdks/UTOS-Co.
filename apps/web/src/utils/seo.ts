export interface SEOConfig {
	title?: string;
	description?: string;
	keywords?: string[];
	ogTitle?: string;
	ogDescription?: string;
	ogImage?: string;
	twitterTitle?: string;
	twitterDescription?: string;
	twitterImage?: string;
	canonical?: string;
	noIndex?: boolean;
}

export const DEFAULT_SEO = {
	title: "Down Under Chauffeurs - Premium Luxury Transportation Services Australia",
	description: "Premium luxury chauffeur services in Australia. Book luxury cars, airport transfers, and corporate transportation. Professional drivers, premium vehicles, 24/7 service.",
	keywords: ["chauffeur service", "luxury car hire", "airport transfer", "corporate transport", "luxury transportation", "premium cars", "professional drivers", "Australia"],
	ogTitle: "Down Under Chauffeurs - Premium Luxury Transportation",
	ogDescription: "Premium luxury chauffeur services in Australia. Professional drivers, luxury vehicles, and exceptional service for all your transportation needs.",
	ogImage: "https://downunderchauffeurs.com/logo.png",
	twitterTitle: "Down Under Chauffeurs - Premium Luxury Transportation",
	twitterDescription: "Premium luxury chauffeur services in Australia. Professional drivers, luxury vehicles, and exceptional service.",
	twitterImage: "https://downunderchauffeurs.com/logo.png",
	canonical: "https://downunderchauffeurs.com",
};

export const PAGE_SEO_CONFIG: Record<string, SEOConfig> = {
	home: {
		title: "Down Under Chauffeurs - Premium Luxury Chauffeur Services Australia",
		description: "Book premium luxury chauffeur services in Australia. Professional drivers, luxury vehicles, airport transfers, and corporate transportation. Get instant quotes online.",
		keywords: ["luxury chauffeur", "premium car service", "airport transfer", "corporate transport", "luxury transportation Australia", "chauffeur booking"],
		canonical: "https://downunderchauffeurs.com",
	},
	services: {
		title: "Our Services - Premium Chauffeur & Luxury Car Services | Down Under Chauffeurs",
		description: "Explore our premium chauffeur services including luxury car hire, airport transfers, corporate transport, and special events. Professional service across Australia.",
		keywords: ["chauffeur services", "luxury car services", "airport transfer", "corporate transportation", "wedding transport", "event chauffeur"],
		canonical: "https://downunderchauffeurs.com/services",
	},
	fleet: {
		title: "Our Fleet - Luxury Vehicles & Premium Cars | Down Under Chauffeurs",
		description: "View our premium fleet of luxury vehicles. Mercedes, BMW, Audi and more. Professional maintained vehicles with experienced chauffeurs for your comfort.",
		keywords: ["luxury fleet", "premium cars", "Mercedes chauffeur", "BMW rental", "luxury vehicle hire", "premium car fleet Australia"],
		canonical: "https://downunderchauffeurs.com/fleet",
	},
	"calculate-quote": {
		title: "Get Instant Quote - Luxury Chauffeur Service Pricing | Down Under Chauffeurs",
		description: "Get instant pricing for your luxury chauffeur service. Calculate quotes for airport transfers, corporate transport, and premium car hire across Australia.",
		keywords: ["chauffeur quote", "luxury car pricing", "transport quote", "airport transfer cost", "chauffeur service pricing"],
		canonical: "https://downunderchauffeurs.com/calculate-quote",
	},
	"contact-us": {
		title: "Contact Us - Premium Chauffeur Services | Down Under Chauffeurs",
		description: "Contact Down Under Chauffeurs for luxury transportation services. Get quotes, make bookings, or speak with our team about premium chauffeur services.",
		keywords: ["contact chauffeur", "luxury transport contact", "chauffeur booking", "premium car service contact"],
		canonical: "https://downunderchauffeurs.com/contact-us",
	},
	about: {
		title: "About Us - Premium Luxury Chauffeur Company | Down Under Chauffeurs",
		description: "Learn about Down Under Chauffeurs, Australia's premier luxury transportation company. Professional chauffeur services with a commitment to excellence.",
		keywords: ["luxury chauffeur company", "premium transport Australia", "professional chauffeur service", "luxury transportation company"],
		canonical: "https://downunderchauffeurs.com/about",
	},
};

export function generateSEOConfig(pageKey: string, customConfig?: Partial<SEOConfig>): SEOConfig {
	const pageConfig = PAGE_SEO_CONFIG[pageKey] || {};
	const baseConfig = { ...DEFAULT_SEO, ...pageConfig };

	if (customConfig) {
		return { ...baseConfig, ...customConfig };
	}

	return baseConfig;
}

export function generateStructuredData(type: 'Organization' | 'LocalBusiness' | 'Service' = 'Organization') {
	const baseData = {
		"@context": "https://schema.org",
		"@type": type,
		"name": "Down Under Chauffeurs",
		"description": "Premium luxury chauffeur services in Australia",
		"url": "https://downunderchauffeurs.com",
		"logo": "https://downunderchauffeurs.com/logo.png",
		"image": "https://downunderchauffeurs.com/logo.png",
		"telephone": "+61-XXX-XXX-XXX", // Replace with actual phone number
		"email": "info@downunderchauffeurs.com", // Replace with actual email
		"address": {
			"@type": "PostalAddress",
			"addressCountry": "AU",
			"addressRegion": "NSW", // Update with actual region
			"addressLocality": "Sydney", // Update with actual city
			"streetAddress": "123 Example Street" // Update with actual address
		},
		"areaServed": {
			"@type": "Country",
			"name": "Australia"
		},
		"serviceType": [
			"Luxury Transportation",
			"Chauffeur Service",
			"Airport Transfer",
			"Corporate Transport"
		]
	};

	if (type === 'LocalBusiness') {
		return {
			...baseData,
			"openingHours": "Mo-Su 00:00-23:59", // 24/7 service
			"priceRange": "$$$",
			"paymentAccepted": ["Cash", "Credit Card", "PayID"],
		};
	}

	return baseData;
}
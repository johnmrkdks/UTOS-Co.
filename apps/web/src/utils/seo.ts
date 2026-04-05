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

const SITE = "https://utosandco.com";
const OG_IMAGE = `${SITE}/utos-logo.png`;

export const DEFAULT_SEO = {
	title: "Utos & Co. — Luxury Chauffeur",
	description:
		"Premium luxury chauffeur services in Australia. Book luxury cars, airport transfers, and corporate transportation. Professional drivers, premium vehicles, 24/7 service.",
	keywords: [
		"chauffeur service",
		"luxury car hire",
		"airport transfer",
		"corporate transport",
		"luxury transportation",
		"premium cars",
		"professional drivers",
		"Australia",
	],
	ogTitle: "Utos & Co. — Luxury Chauffeur",
	ogDescription:
		"Premium luxury chauffeur services in Australia. Professional drivers, luxury vehicles, and exceptional service for all your transportation needs.",
	ogImage: OG_IMAGE,
	twitterTitle: "Utos & Co. — Luxury Chauffeur",
	twitterDescription:
		"Premium luxury chauffeur services in Australia. Professional drivers, luxury vehicles, and exceptional service.",
	twitterImage: OG_IMAGE,
	canonical: SITE,
};

export const PAGE_SEO_CONFIG: Record<string, SEOConfig> = {
	home: {
		title: "Utos & Co. — Luxury Chauffeur",
		description:
			"Book premium luxury chauffeur services in Australia. Professional drivers, luxury vehicles, airport transfers, and corporate transportation. Get instant quotes online.",
		keywords: [
			"luxury chauffeur",
			"premium car service",
			"airport transfer",
			"corporate transport",
			"luxury transportation Australia",
			"chauffeur booking",
		],
		canonical: SITE,
	},
	services: {
		title:
			"Our Services - Premium Chauffeur & Luxury Car Services | Utos & Co.",
		description:
			"Explore our premium chauffeur services including luxury car hire, airport transfers, corporate transport, and special events. Professional service across Australia.",
		keywords: [
			"chauffeur services",
			"luxury car services",
			"airport transfer",
			"corporate transportation",
			"wedding transport",
			"event chauffeur",
		],
		canonical: `${SITE}/services`,
	},
	fleet: {
		title: "Our Fleet - Luxury Vehicles & Premium Cars | Utos & Co.",
		description:
			"View our premium fleet of luxury vehicles. Mercedes, BMW, Audi and more. Professional maintained vehicles with experienced chauffeurs for your comfort.",
		keywords: [
			"luxury fleet",
			"premium cars",
			"Mercedes chauffeur",
			"BMW rental",
			"luxury vehicle hire",
			"premium car fleet Australia",
		],
		canonical: `${SITE}/fleet`,
	},
	"calculate-quote": {
		title: "Get Instant Quote - Luxury Chauffeur Service Pricing | Utos & Co.",
		description:
			"Get instant pricing for your luxury chauffeur service. Calculate quotes for airport transfers, corporate transport, and premium car hire across Australia.",
		keywords: [
			"chauffeur quote",
			"luxury car pricing",
			"transport quote",
			"airport transfer cost",
			"chauffeur service pricing",
		],
		canonical: `${SITE}/calculate-quote`,
	},
	"contact-us": {
		title: "Contact Us - Premium Chauffeur Services | Utos & Co.",
		description:
			"Contact Utos & Co. for luxury transportation services. Get quotes, make bookings, or speak with our team about premium chauffeur services.",
		keywords: [
			"contact chauffeur",
			"luxury transport contact",
			"chauffeur booking",
			"premium car service contact",
		],
		canonical: `${SITE}/contact-us`,
	},
	about: {
		title: "About Us - Premium Luxury Chauffeur Company | Utos & Co.",
		description:
			"Learn about Utos & Co., Australia's premier luxury transportation company. Professional chauffeur services with a commitment to excellence.",
		keywords: [
			"luxury chauffeur company",
			"premium transport Australia",
			"professional chauffeur service",
			"luxury transportation company",
		],
		canonical: `${SITE}/about`,
	},
};

export function generateSEOConfig(
	pageKey: string,
	customConfig?: Partial<SEOConfig>,
): SEOConfig {
	const pageConfig = PAGE_SEO_CONFIG[pageKey] || {};
	const baseConfig = { ...DEFAULT_SEO, ...pageConfig };

	if (customConfig) {
		return { ...baseConfig, ...customConfig };
	}

	return baseConfig;
}

export function generateStructuredData(
	type: "Organization" | "LocalBusiness" | "Service" = "Organization",
) {
	const baseData = {
		"@context": "https://schema.org",
		"@type": type,
		name: "Utos & Co.",
		description: "Premium luxury chauffeur services in Australia",
		url: SITE,
		logo: OG_IMAGE,
		image: OG_IMAGE,
		telephone: "+61-400-000-000",
		email: "contact@utosandco.com",
		address: {
			"@type": "PostalAddress",
			addressCountry: "AU",
			addressRegion: "",
			addressLocality: "",
			streetAddress: "",
		},
		areaServed: {
			"@type": "Country",
			name: "Australia",
		},
		serviceType: [
			"Luxury Transportation",
			"Chauffeur Service",
			"Airport Transfer",
			"Corporate Transport",
		],
	};

	if (type === "LocalBusiness") {
		return {
			...baseData,
			openingHours: "Mo-Su 00:00-23:59",
			priceRange: "$$$",
			paymentAccepted: ["Cash", "Credit Card", "PayID"],
		};
	}

	return baseData;
}

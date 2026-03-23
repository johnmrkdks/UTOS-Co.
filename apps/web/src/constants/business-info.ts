export const BUSINESS_INFO = {
	phone: {
		display: "+61 422 693 233",
		link: "tel:+61422693233",
	},
	email: {
		display: "syd@downunderchauffeurs.com",
		link: "mailto:syd@downunderchauffeurs.com",
	},
	/** Invoice-specific details for formal PDF invoices */
	invoice: {
		address: "Sydney, New South Wales, Australia",
		abn: "", // Add ABN when registered, e.g. "12 345 678 901"
		paymentTerms: "Payment due within 14 days of invoice date",
		bankDetails: "", // Optional: "BSB: XXX-XXX  Account: XXXXXXXX"
	},
	social: {
		facebook: {
			url: "https://www.facebook.com/380139225188224",
			label: "Facebook",
		},
		instagram: {
			url: "https://www.instagram.com/downunderchauffeurs",
			label: "Instagram",
		},
	},
	business: {
		name: "Down Under Chauffeurs",
		slogan: "Sydney's Premier Luxury Service",
		description:
			"Down Under Chauffeurs is a luxury travel agency based in Sydney, Australia. We offer a wide range of luxury travel services, including car hire, travel packages, and personalized travel experiences.",
		websiteUrl: "https://downunderchauffeurs.com",
		foundedYear: 2020,
	},
} as const;

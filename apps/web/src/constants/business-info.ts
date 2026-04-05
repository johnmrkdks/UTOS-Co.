export const BUSINESS_INFO = {
	phone: {
		display: "+61 400 000 000",
		link: "tel:+61400000000",
	},
	email: {
		display: "contact@utosandco.com",
		link: "mailto:contact@utosandco.com",
	},
	/** Invoice-specific details for formal PDF invoices */
	invoice: {
		address: "Australia",
		abn: "",
		paymentTerms: "Payment due within 14 days of invoice date",
		bankDetails: "",
	},
	social: {
		facebook: {
			url: "https://www.facebook.com/",
			label: "Facebook",
		},
		instagram: {
			url: "https://www.instagram.com/",
			label: "Instagram",
		},
	},
	/** External booking (legacy Jotform app); main booking flow remains in-app */
	externalBooking: {
		jotformAppUrl: "https://www.jotform.com/app/212582834695870",
	},
	business: {
		name: "Utos & Co.",
		slogan: "Australia",
		description:
			"Utos & Co. delivers premium chauffeur and luxury transport services across Australia — professional drivers, refined vehicles, and a seamless booking experience.",
		websiteUrl: "https://utosandco.com",
		foundedYear: 2020,
	},
} as const;

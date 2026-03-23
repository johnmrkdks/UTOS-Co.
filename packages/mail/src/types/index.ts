export interface MailConfig {
	clientId: string;
	clientSecret: string;
	refreshToken: string;
	user: string;
}

export interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	attachments?: Array<{
		filename: string;
		content: Buffer | string;
		contentType?: string;
	}>;
}

export interface BookingDetails {
	bookingId: string;
	serviceType: string;
	pickupDate: string;
	pickupTime: string;
	pickupAddress: string;
	destinationAddress?: string;
	packageName?: string;
	driverName?: string;
	vehicleDetails?: string;
	amount: number;
	currency: string;
}

export interface InvoiceData {
	amount: number;
	currency: string;
	bookingDate: string;
	serviceType: string;
	route?: string;
	packageName?: string;
}

export interface EmailTemplate {
	subject: string;
	html: string;
}

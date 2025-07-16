export enum UserRoleEnum {
	SuperAdmin = "super_admin",
	Admin = "admin",
	Driver = "driver",
	User = "user",
}

export enum BookingStatusEnum {
	Active = "active",
	Pending = "pending",
	Confirmed = "confirmed",
	Canceled = "canceled",
}

export enum RateableTypeEnum {
	Car = "car",
	Driver = "driver",
	Ride = "ride",
	Passenger = "passenger",
	Booking = "booking",
}

export enum PaymentMethodEnum {
	CreditCard = "credit_card",
	DebitCard = "debit_card",
}

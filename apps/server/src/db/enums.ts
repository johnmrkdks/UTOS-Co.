export enum UserRoleEnum {
	SuperAdmin = "SUPER_ADMIN",
	Admin = "ADMIN",
	Driver = "DRIVER",
	Customer = "CUSTOMER",
}

export enum BookingStatusEnum {
	Active = "ACTIVE",
	Pending = "PENDING",
	Confirmed = "CONFIRMED",
	Canceled = "CANCELED",
}

export enum RateableTypeEnum {
	Car = "CAR",
	Driver = "DRIVER",
	Ride = "RIDE",
}

export enum PaymentMethodEnum {
	Cash = "CASH",
	CreditCard = "CREDIT_CARD",
	DebitCard = "DEBIT_CARD",
}

export enum UserRoleEnum {
	SuperAdmin = "super_admin",
	Admin = "admin",
	Driver = "driver",
	User = "user",
}

export enum BookingTypeEnum {
	Package = "package",     // Fixed service packages
	Custom = "custom",       // Custom route/instant quote
	Guest = "guest",        // Guest booking (no account)
	Offload = "offload"      // Manual bookings from other companies
}

export enum BookingStatusEnum {
	Pending = "pending",           // Just created
	Confirmed = "confirmed",       // Payment confirmed
	DriverAssigned = "driver_assigned", // Driver allocated
	DriverEnRoute = "driver_en_route", // Driver started job - on the way to pickup
	ArrivedPickup = "arrived_pickup",  // Driver arrived at pickup location
	PassengerOnBoard = "passenger_on_board", // Passenger picked up (POB)
	InProgress = "in_progress",    // Service started (legacy - same as PassengerOnBoard)
	DroppedOff = "dropped_off",    // Passenger dropped off at destination
	AwaitingExtras = "awaiting_extras", // Waiting for extras (tolls, parking, etc.)
	AwaitingPricingReview = "awaiting_pricing_review", // Driver closed with waiting time - admin must finalize amount
	Completed = "completed",       // Service finished
	Cancelled = "cancelled",       // Cancelled by customer/admin
	NoShow = "no_show",           // Customer didn't show up
	Failed = "failed"             // Service couldn't be completed
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

export enum CarStatusEnum {
	Available = "available",
	Booked = "booked",
	InService = "in_service",
	Maintenance = "maintenance",
	OutOfService = "out_of_service",
}

export enum RateTypeEnum {
	Fixed = "fixed",    // Fixed price packages (weddings, concerts, etc.)
	Hourly = "hourly",  // Hourly rate packages (tours, etc.)
}

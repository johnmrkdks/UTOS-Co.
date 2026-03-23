import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

interface BookingOperationValidation {
	canEdit: boolean;
	canCancel: boolean;
	editReason?: string;
	cancelReason?: string;
	cancellationFeePercentage?: number;
	hoursUntilPickup?: number;
	hasDriverAssigned?: boolean;
}

export const useValidateBookingOperationsQuery = (
	bookingId: string,
	enabled = true,
) => {
	return useQuery({
		...trpc.bookings.validateOperations.queryOptions({ bookingId }),
		enabled: enabled && !!bookingId,
		select: (data): BookingOperationValidation =>
			data || {
				canEdit: false,
				canCancel: false,
				editReason: "Unable to validate booking operations",
				cancelReason: "Unable to validate booking operations",
				cancellationFeePercentage: 0,
				hoursUntilPickup: 0,
				hasDriverAssigned: false,
			},
		refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes for time-sensitive validation
		staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
	});
};

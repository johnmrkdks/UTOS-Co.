import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

interface BookingOperationValidation {
	canEdit: boolean;
	canCancel: boolean;
	editReason?: string;
	cancelReason?: string;
	cancellationFeePercentage?: number;
}

export const useValidateBookingOperationsQuery = (bookingId: string, enabled = true) => {
	return useQuery({
		...trpc.bookings.validateOperations.queryOptions({ bookingId }),
		enabled: enabled && !!bookingId,
		select: (data): BookingOperationValidation => data || {
			canEdit: false,
			canCancel: false,
			editReason: undefined,
			cancelReason: undefined,
			cancellationFeePercentage: 0,
		}
	});
};
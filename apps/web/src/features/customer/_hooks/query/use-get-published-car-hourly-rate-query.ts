import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useGetPublishedCarHourlyRateQuery = (
	carId: string | undefined,
) => {
	return useQuery({
		...trpc.cars.getPublishedCarHourlyRate.queryOptions({
			carId: carId ?? "",
		}),
		enabled: Boolean(carId?.trim()),
	});
};

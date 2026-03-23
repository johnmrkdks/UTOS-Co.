import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useGetReviewsForCarQuery = (carId: string | undefined) => {
	return useQuery({
		...trpc.analytics.getReviewsForCar.queryOptions({
			carId: carId ?? "",
			limit: 20,
		}),
		enabled: !!carId,
	});
};

import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetReviewsForCarQuery = (carId: string | undefined) => {
	return useQuery({
		...trpc.analytics.getReviewsForCar.queryOptions({
			carId: carId ?? "",
			limit: 20,
		}),
		enabled: !!carId,
	});
};

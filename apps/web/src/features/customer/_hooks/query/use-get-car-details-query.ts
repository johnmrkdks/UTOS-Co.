import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useGetCarDetailsQuery = (carId: string) => {
	return useQuery(trpc.cars.getPublished.queryOptions({ id: carId }));
};

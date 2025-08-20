import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetCarDetailsQuery = (carId: string) => {
	return useQuery(trpc.cars.getPublished.queryOptions({ id: carId }));
};
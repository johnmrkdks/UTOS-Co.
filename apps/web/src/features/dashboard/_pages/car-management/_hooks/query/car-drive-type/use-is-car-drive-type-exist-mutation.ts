import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useIsCarDriveTypeExistMutation = () => {
	return useMutation(
		trpc.carDriveTypes.isCarDriveTypeExist.mutationOptions({}),
	);
};

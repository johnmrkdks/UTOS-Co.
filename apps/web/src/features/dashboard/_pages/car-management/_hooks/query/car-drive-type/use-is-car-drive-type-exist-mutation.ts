
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export const useIsCarDriveTypeExistMutation = () => {
	return useMutation(trpc.carDriveTypes.isCarDriveTypeExist.mutationOptions({}));
};

import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { useMemo } from "react";

type EntityNameValidationDisplayProps = {
	isChecking: boolean;
	nameAvailability: boolean | null;
	hasValue: boolean;
	hasError: boolean;
	entityName: string;
};

export function EntityNameValidationDisplay({
	isChecking,
	nameAvailability,
	hasValue,
	hasError,
	entityName,
}: EntityNameValidationDisplayProps) {
	const validationState = useMemo(() => {
		if (!hasValue) return null;

		if (isChecking) {
			return {
				icon: <Loader2Icon className="h-4 w-4 animate-spin" />,
				message: (
					<div className="flex items-center gap-2 text-sm">
						<Loader2Icon className="h-3 w-3 animate-spin" />
						Checking availability...
					</div>
				),
			};
		}

		if (nameAvailability === true && !hasError) {
			return {
				icon: <CheckIcon className="h-4 w-4 text-green-500" />,
				message: (
					<div className="flex items-center gap-2 text-green-600 text-sm">
						<CheckIcon className="h-3 w-3" />
						{entityName} is available
					</div>
				),
			};
		}

		return null;
	}, [isChecking, nameAvailability, hasValue, hasError, entityName]);

	return validationState || { icon: null, message: null };
}

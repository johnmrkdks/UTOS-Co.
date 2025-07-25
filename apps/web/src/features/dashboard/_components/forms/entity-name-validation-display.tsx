import { Loader2Icon, CheckIcon, XIcon } from "lucide-react"
import { useMemo } from "react"

type EntityNameValidationDisplayProps = {
	isChecking: boolean
	nameAvailability: boolean | null
	hasValue: boolean
	hasError: boolean
	entityName: string
}

export function EntityNameValidationDisplay({
	isChecking,
	nameAvailability,
	hasValue,
	hasError,
	entityName,
}: EntityNameValidationDisplayProps) {
	const validationState = useMemo(() => {
		if (!hasValue) return null

		if (isChecking) {
			return {
				icon: <Loader2Icon className="w-4 h-4 animate-spin" />,
				message: (
					<div className="flex items-center gap-2 text-sm">
						<Loader2Icon className="w-3 h-3 animate-spin" />
						Checking availability...
					</div>
				)
			}
		}

		if (nameAvailability === true && !hasError) {
			return {
				icon: <CheckIcon className="w-4 h-4 text-green-500" />,
				message: (
					<div className="flex items-center gap-2 text-sm text-green-600">
						<CheckIcon className="w-3 h-3" />
						{entityName} name is available
					</div>
				)
			}
		}

		return null
	}, [isChecking, nameAvailability, hasValue, hasError, entityName])

	return validationState || { icon: null, message: null }
}

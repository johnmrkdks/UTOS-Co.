import { useEffect, useState, useRef } from "react"
import { useDebounce } from "@uidotdev/usehooks"
import type { UseFormReturn, FieldValues, Path } from "react-hook-form"

type UseEntityNameValidationProps<T extends FieldValues> = {
	form: UseFormReturn<T>
	fieldName: Path<T>
	validateNameFn: (name: string) => Promise<boolean>
	originalValue?: string
	debounceMs?: number
	errorMessage?: string
}

export function useEntityNameValidation<T extends FieldValues>({
	form,
	fieldName,
	validateNameFn,
	originalValue,
	debounceMs = 300,
	errorMessage,
}: UseEntityNameValidationProps<T>) {
	const [nameAvailability, setNameAvailability] = useState<boolean | null>(null)
	const [isChecking, setIsChecking] = useState(false)

	// Use refs to capture latest values without causing re-renders
	const validateNameFnRef = useRef(validateNameFn)
	const formRef = useRef(form)
	const errorMessageRef = useRef(errorMessage)
	const fieldNameRef = useRef(fieldName)

	// Update refs on each render
	validateNameFnRef.current = validateNameFn
	formRef.current = form
	errorMessageRef.current = errorMessage
	fieldNameRef.current = fieldName

	const currentValue = form.watch(fieldName)
	const debouncedValue = useDebounce(currentValue as string, debounceMs)

	useEffect(() => {
		if (!debouncedValue || debouncedValue.length === 0) {
			setNameAvailability(null)
			setIsChecking(false)
			formRef.current.clearErrors(fieldNameRef.current)
			return
		}

		// Don't validate if it's the same as the original value
		if (debouncedValue === originalValue) {
			setNameAvailability(null)
			setIsChecking(false)
			formRef.current.clearErrors(fieldNameRef.current)
			return
		}

		setIsChecking(true)
		setNameAvailability(null)

		validateNameFnRef.current(debouncedValue)
			.then((isAvailable) => {
				setNameAvailability(isAvailable)
				if (!isAvailable) {
					formRef.current.setError(fieldNameRef.current, {
						type: "manual",
						message: errorMessageRef.current,
					})
				} else {
					formRef.current.clearErrors(fieldNameRef.current)
				}
			})
			.catch(() => {
				setNameAvailability(null)
			})
			.finally(() => {
				setIsChecking(false)
			})
	}, [debouncedValue, originalValue])

	const reset = () => {
		setNameAvailability(null)
		setIsChecking(false)
		formRef.current.clearErrors(fieldNameRef.current)
	}

	return {
		nameAvailability,
		isChecking,
		debouncedValue,
		reset,
	}
}

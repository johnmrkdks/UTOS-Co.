import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UseFormReturn, FieldValues, Path } from "react-hook-form"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TextInputFieldProps<T extends FieldValues> {
	form: UseFormReturn<T>
	name: Path<T>
	label: string
	placeholder?: string
	type?: "text" | "number" | "email" | "password"
	disabled?: boolean
	className?: string
	rightIcon?: ReactNode
	validationMessage?: ReactNode
}

export function TextInputField<T extends FieldValues>({
	form,
	name,
	label,
	placeholder,
	type = "text",
	disabled = false,
	className,
	rightIcon,
	validationMessage,
}: TextInputFieldProps<T>) {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem className={cn(className)}>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<div className="relative">
							<Input
								type={type}
								placeholder={placeholder}
								className={cn(rightIcon && "pr-8")}
								disabled={disabled}
								{...field}
							/>
							{rightIcon && (
								<div className="absolute right-2 top-1/2 -translate-y-1/2">
									{rightIcon}
								</div>
							)}
						</div>
					</FormControl>
					<FormMessage />
					{validationMessage}
				</FormItem>
			)}
		/>
	)
}

interface SelectFieldProps<T extends FieldValues> {
	form: UseFormReturn<T>
	name: Path<T>
	label: string
	placeholder?: string
	disabled?: boolean
	className?: string
	options: Array<{ value: string; label: string }>
	value?: string
}

export function SelectField<T extends FieldValues>({
	form,
	name,
	label,
	placeholder = "Select option",
	disabled = false,
	className = "w-56",
	options,
	value,
}: SelectFieldProps<T>) {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<Select
						onValueChange={field.onChange}
						defaultValue={field.value}
						value={value || field.value}
					>
						<FormControl>
							<SelectTrigger className={className} disabled={disabled}>
								<SelectValue placeholder={placeholder} />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{options.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}

interface ValidatedTextInputFieldProps<T extends FieldValues>
	extends Omit<TextInputFieldProps<T>, 'rightIcon' | 'validationMessage'> {
	validationDisplay: {
		icon: ReactNode
		message: ReactNode
	}
}

export function ValidatedTextInputField<T extends FieldValues>({
	validationDisplay,
	...props
}: ValidatedTextInputFieldProps<T>) {
	return (
		<TextInputField
			{...props}
			rightIcon={validationDisplay.icon}
			validationMessage={validationDisplay.message}
		/>
	)
}

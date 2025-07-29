import { SelectItem } from "@/components/ui/select"

import type { Control } from "react-hook-form"
import { useMemo, useState } from "react" // Import useState
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AddCarFormValues } from "../add-car-form"
import { useGetCarBodyTypesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-body-type/use-get-car-body-types-query"
import { useGetCarTransmissionTypesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-transmission-type/use-get-car-transmission-types-query"
import { useGetCarDriveTypesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-drive-type/use-get-car-drive-types-query"
import { useGetCarConditionTypesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-condition-type/use-get-car-condition-types-query"
import { useGetCarCategoriesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-category/use-get-car-categories-query"
import { useGetCarModelsWithBrandQuery } from "../../../_hooks/query/car-model/use-get-car-models-with-brand-query"

// Import cmdk components and lucide-react icon
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils" // Assuming cn utility is available
import { useGetCarFuelTypesQuery } from "../../../_hooks/query/car-fuel-type/use-get-car-fuel-types-query"

type SpecificationsFormProps = {
	control: Control<AddCarFormValues>
}

// Extend SelectFieldConfig to include the searchable-grouped variant
type SelectFieldConfig = {
	name: keyof AddCarFormValues
	label: string
	placeholder: string
	data: any[] | undefined
	isLoading: boolean
	error?: any
	renderOption: (item: any) => { key: string; value: string; label: string; brandName?: string } // Added brandName for grouping
	isSearchableGrouped?: boolean // New flag for enhanced select
}

type SelectFieldProps = {
	config: SelectFieldConfig
	control: Control<AddCarFormValues>
	className?: string
}

// Memoized select field component to prevent unnecessary re-renders
const SelectField = ({ config, control, className }: SelectFieldProps) => {
	const [open, setOpen] = useState(false) // State to control the dropdown open/close for cmdk

	// Group data by brand for searchable-grouped variant
	const groupedData = useMemo(() => {
		if (!config.isSearchableGrouped || !config.data) return {}
		return config.data.reduce(
			(acc, item) => {
				const brandName = config.renderOption(item).brandName || "Other"
				if (!acc[brandName]) {
					acc[brandName] = []
				}
				acc[brandName].push(item)
				return acc
			},
			{} as Record<string, any[]>,
		)
	}, [config.isSearchableGrouped, config.data, config.renderOption])

	return (
		<FormField
			control={control}
			name={config.name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{config.label}</FormLabel>
					<Select
						onValueChange={field.onChange}
						defaultValue={field.value as string}
						disabled={config.isLoading}
						onOpenChange={config.isSearchableGrouped ? setOpen : undefined} // Only control open state for searchable-grouped
						open={config.isSearchableGrouped ? open : undefined} // Only control open state for searchable-grouped
					>
						<FormControl>
							<SelectTrigger className={cn("w-full", className)}>
								<SelectValue placeholder={config.isLoading ? "Loading..." : config.placeholder} />
							</SelectTrigger>
						</FormControl>
						<SelectContent className={config.isSearchableGrouped ? "p-0" : ""}>
							{config.isLoading ? (
								<SelectItem value="__loading__" disabled>
									Loading...
								</SelectItem>
							) : config.error ? (
								<SelectItem value="__error__" disabled>
									Error loading options
								</SelectItem>
							) : config.data?.length === 0 ? (
								<SelectItem value="__empty__" disabled>
									No options available
								</SelectItem>
							) : config.isSearchableGrouped ? (
								// Render with Command for searchable and grouped options
								<Command>
									<CommandInput placeholder={`Search ${config.label.toLowerCase()}...`} />
									<CommandList>
										<CommandEmpty>No results found.</CommandEmpty>
										{Object.keys(groupedData).map((brandName) => (
											<CommandGroup key={brandName} heading={brandName}>
												{groupedData[brandName].map((item: any) => {
													const option = config.renderOption(item)
													return (
														<CommandItem
															key={option.key}
															value={`${option.label} ${option.brandName || ""}`} // Value for search matching
															onSelect={() => {
																field.onChange(option.value)
																setOpen(false) // Close the dropdown after selection
															}}
														>
															<CheckIcon
																className={cn(
																	"mr-2 h-4 w-4",
																	field.value === option.value ? "opacity-100" : "opacity-0",
																)}
															/>
															{option.label}
														</CommandItem>
													)
												})}
											</CommandGroup>
										))}
									</CommandList>
								</Command>
							) : (
								// Render standard SelectItems
								config.data?.map((item) => {
									const option = config.renderOption(item)
									return (
										<SelectItem key={option.key} value={option.value}>
											{option.label}
										</SelectItem>
									)
								})
							)}
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}

export function SpecificationsForm({ control }: SpecificationsFormProps) {
	// Consolidate all query hooks
	const queries = {
		models: useGetCarModelsWithBrandQuery({}),
		bodyTypes: useGetCarBodyTypesQuery({}),
		categories: useGetCarCategoriesQuery({}),
		fuelTypes: useGetCarFuelTypesQuery({}),
		transmissionTypes: useGetCarTransmissionTypesQuery({}),
		driveTypes: useGetCarDriveTypesQuery({}),
		conditionTypes: useGetCarConditionTypesQuery({}),
	}

	const fieldConfigs: SelectFieldConfig[] = useMemo(
		() => [
			{
				name: "modelId",
				label: "Model - Brand",
				placeholder: "Select a model",
				data: queries.models.data?.data,
				isLoading: queries.models.isLoading,
				error: queries.models.error,
				renderOption: (model) => ({
					key: model.id,
					value: model.id,
					label: `${model.name} - ${model.brand.name}`,
					brandName: model.brand.name, // Pass brand name for grouping
				}),
				isSearchableGrouped: true, // Enable enhanced select for models
			},
			{
				name: "categoryId",
				label: "Category",
				placeholder: "Select category",
				data: queries.categories.data?.data,
				isLoading: queries.categories.isLoading,
				error: queries.categories.error,
				renderOption: (category) => ({
					key: category.id,
					value: category.id,
					label: category.name,
				}),
			},
			{
				name: "bodyTypeId",
				label: "Body Type",
				placeholder: "Select body type",
				data: queries.bodyTypes.data?.data,
				isLoading: queries.bodyTypes.isLoading,
				error: queries.bodyTypes.error,
				renderOption: (type) => ({
					key: type.id,
					value: type.id,
					label: type.name,
				}),
			},
			{
				name: "fuelTypeId",
				label: "Fuel Type",
				placeholder: "Select fuel type",
				data: queries.fuelTypes.data?.data,
				isLoading: queries.fuelTypes.isLoading,
				error: queries.fuelTypes.error,
				renderOption: (type) => ({
					key: type.id,
					value: type.id,
					label: type.name,
				}),
			},
			{
				name: "transmissionTypeId",
				label: "Transmission",
				placeholder: "Select transmission",
				data: queries.transmissionTypes.data?.data,
				isLoading: queries.transmissionTypes.isLoading,
				error: queries.transmissionTypes.error,
				renderOption: (type) => ({
					key: type.id,
					value: type.id,
					label: type.name,
				}),
			},
			{
				name: "driveTypeId",
				label: "Drive Type",
				placeholder: "Select drive type",
				data: queries.driveTypes.data?.data,
				isLoading: queries.driveTypes.isLoading,
				error: queries.driveTypes.error,
				renderOption: (type) => ({
					key: type.id,
					value: type.id,
					label: type.name,
				}),
			},
			{
				name: "conditionTypeId",
				label: "Condition",
				placeholder: "Select condition",
				data: queries.conditionTypes.data?.data,
				isLoading: queries.conditionTypes.isLoading,
				error: queries.conditionTypes.error,
				renderOption: (type) => ({
					key: type.id,
					value: type.id,
					label: type.name,
				}),
			},
		],
		[
			queries.models.data?.data,
			queries.models.isLoading,
			queries.models.error,
			queries.categories.data?.data,
			queries.categories.isLoading,
			queries.categories.error,
			queries.bodyTypes.data?.data,
			queries.bodyTypes.isLoading,
			queries.bodyTypes.error,
			queries.fuelTypes.data?.data,
			queries.fuelTypes.isLoading,
			queries.fuelTypes.error,
			queries.transmissionTypes.data?.data,
			queries.transmissionTypes.isLoading,
			queries.transmissionTypes.error,
			queries.driveTypes.data?.data,
			queries.driveTypes.isLoading,
			queries.driveTypes.error,
			queries.conditionTypes.data?.data,
			queries.conditionTypes.isLoading,
			queries.conditionTypes.error,
		],
	)

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-medium">Car Specifications</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{fieldConfigs.map((config) => (
					<SelectField key={config.name} config={config} control={control} />
				))}
			</div>
		</div>
	)
}


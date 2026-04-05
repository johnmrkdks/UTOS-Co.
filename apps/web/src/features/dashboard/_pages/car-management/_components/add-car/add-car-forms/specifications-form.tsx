import { Button } from "@workspace/ui/components/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@workspace/ui/components/command";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { memo, useMemo, useState } from "react";
import type { Control, ControllerRenderProps } from "react-hook-form";
import { useGetCarBodyTypesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-body-type/use-get-car-body-types-query";
import { useGetCarCategoriesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-category/use-get-car-categories-query";
import { useGetCarConditionTypesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-condition-type/use-get-car-condition-types-query";
import { useGetCarDriveTypesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-drive-type/use-get-car-drive-types-query";
import { useGetCarFuelTypesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-fuel-type/use-get-car-fuel-types-query";
import { useGetCarModelsWithBrandQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-model/use-get-car-models-with-brand-query";
import { useGetCarTransmissionTypesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-transmission-type/use-get-car-transmission-types-query";
import type { AddCarFormValues } from "../add-car-form";

/** Large enough for admin dropdowns; server list endpoints paginate with a default of 10 */
const SPEC_LIST_PARAMS = { limit: 1000 } as const;

type SpecificationsFormProps = {
	control: Control<AddCarFormValues>;
};

type BaseFieldConfig = {
	name: keyof AddCarFormValues;
	label: string;
	placeholder: string;
	data: any[] | undefined;
	isLoading: boolean;
	error?: unknown;
};

type SelectFieldConfig = BaseFieldConfig & {
	renderOption: (item: any) => { key: string; value: string; label: string };
};

type ComboBoxFieldConfig = BaseFieldConfig & {
	renderOption: (item: any) => {
		key: string;
		value: string;
		label: string;
		brandName?: string;
	};
};

type StandardSelectFieldProps = {
	config: SelectFieldConfig;
	control: Control<AddCarFormValues>;
	className?: string;
};

type ComboBoxFieldProps = {
	config: ComboBoxFieldConfig;
	control: Control<AddCarFormValues>;
	className?: string;
};

const StandardSelectField = memo(
	({ config, control, className }: StandardSelectFieldProps) => {
		const rows = config.data ?? [];
		return (
			<FormField
				control={control}
				name={config.name}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{config.label}</FormLabel>
						<Select
							onValueChange={field.onChange}
							value={field.value as string}
							disabled={config.isLoading}
						>
							<FormControl>
								<SelectTrigger className={cn("w-full", className)}>
									<SelectValue
										placeholder={
											config.isLoading ? "Loading..." : config.placeholder
										}
									/>
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{config.isLoading ? (
									<SelectItem value="__loading__" disabled>
										Loading...
									</SelectItem>
								) : config.error ? (
									<SelectItem value="__error__" disabled>
										Error loading options
									</SelectItem>
								) : rows.length === 0 ? (
									<SelectItem value="__empty__" disabled>
										No options available — run DB seed or add records in admin
									</SelectItem>
								) : (
									rows.map((item) => {
										const option = config.renderOption(item);
										return (
											<SelectItem key={option.key} value={option.value}>
												{option.label}
											</SelectItem>
										);
									})
								)}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>
		);
	},
);

type ComboBoxFieldInnerProps = {
	field: ControllerRenderProps<AddCarFormValues, keyof AddCarFormValues>;
	config: ComboBoxFieldConfig;
	open: boolean;
	setOpen: (open: boolean) => void;
	groupedData: Record<string, any[]>;
	className?: string;
};

function ComboBoxFieldInner({
	field,
	config,
	open,
	setOpen,
	groupedData,
	className,
}: ComboBoxFieldInnerProps) {
	const selectedLabel = useMemo(() => {
		if (!config.data?.length || !field.value) return null;
		const foundItem = config.data.find(
			(item) => config.renderOption(item).value === field.value,
		);
		return foundItem ? config.renderOption(foundItem).label : null;
	}, [field.value, config.data, config]);

	return (
		<FormItem>
			<FormLabel>{config.label}</FormLabel>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<FormControl>
						<Button
							type="button"
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className={cn(
								"w-full justify-between",
								!field.value && "text-muted-foreground",
								className,
							)}
							disabled={config.isLoading}
						>
							{selectedLabel ??
								(config.isLoading ? "Loading..." : config.placeholder)}
							<ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</FormControl>
				</PopoverTrigger>
				<PopoverContent className="w-[--radix-popover-trigger-width] p-0">
					<Command shouldFilter>
						<CommandInput
							placeholder={`Search ${config.label.toLowerCase()}...`}
						/>
						<CommandList>
							<CommandEmpty>
								{config.error
									? "Error loading options."
									: !config.data?.length
										? "No models — run DB seed or add models in admin."
										: "No results found."}
							</CommandEmpty>
							{Object.keys(groupedData).map((brandName) => (
								<CommandGroup key={brandName} heading={brandName}>
									{groupedData[brandName].map((item: any) => {
										const option = config.renderOption(item);
										const keywords = [
											option.label,
											option.brandName,
											option.value,
										].filter(Boolean) as string[];
										return (
											<CommandItem
												key={option.key}
												value={option.value}
												keywords={keywords}
												onSelect={() => {
													field.onChange(
														field.value === option.value ? "" : option.value,
													);
													setOpen(false);
												}}
											>
												<CheckIcon
													className={cn(
														"mr-2 h-4 w-4",
														field.value === option.value
															? "opacity-100"
															: "opacity-0",
													)}
												/>
												{option.label}
											</CommandItem>
										);
									})}
								</CommandGroup>
							))}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			<FormMessage />
		</FormItem>
	);
}

const ComboBoxField = memo(
	({ config, control, className }: ComboBoxFieldProps) => {
		const [open, setOpen] = useState(false);

		const groupedData = useMemo(() => {
			if (!config.data?.length) return {};
			return config.data.reduce(
				(acc, item) => {
					const brandName = config.renderOption(item).brandName || "Other";
					if (!acc[brandName]) {
						acc[brandName] = [];
					}
					acc[brandName].push(item);
					return acc;
				},
				{} as Record<string, any[]>,
			);
		}, [config.data, config]);

		return (
			<FormField
				control={control}
				name={config.name}
				render={({ field }) => (
					<ComboBoxFieldInner
						field={field}
						config={config}
						open={open}
						setOpen={setOpen}
						groupedData={groupedData}
						className={className}
					/>
				)}
			/>
		);
	},
);

export function SpecificationsForm({ control }: SpecificationsFormProps) {
	const queries = {
		models: useGetCarModelsWithBrandQuery(SPEC_LIST_PARAMS),
		bodyTypes: useGetCarBodyTypesQuery(SPEC_LIST_PARAMS),
		categories: useGetCarCategoriesQuery(SPEC_LIST_PARAMS),
		fuelTypes: useGetCarFuelTypesQuery(SPEC_LIST_PARAMS),
		transmissionTypes: useGetCarTransmissionTypesQuery(SPEC_LIST_PARAMS),
		driveTypes: useGetCarDriveTypesQuery(SPEC_LIST_PARAMS),
		conditionTypes: useGetCarConditionTypesQuery(SPEC_LIST_PARAMS),
	};

	const modelFieldConfig: ComboBoxFieldConfig = useMemo(
		() => ({
			name: "modelId",
			label: "Model - Brand",
			placeholder: "Select a model",
			data: queries.models.data?.data,
			isLoading: queries.models.isLoading,
			error: queries.models.error,
			renderOption: (model: {
				id: string;
				name: string;
				brand: { name: string };
			}) => ({
				key: model.id,
				value: model.id,
				label: `${model.name} - ${model.brand?.name ?? "Unknown brand"}`,
				brandName: model.brand?.name,
			}),
		}),
		[queries.models.data, queries.models.isLoading, queries.models.error],
	);

	const selectFieldConfigs: SelectFieldConfig[] = useMemo(
		() => [
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
			queries.categories.data,
			queries.categories.isLoading,
			queries.categories.error,
			queries.bodyTypes.data,
			queries.bodyTypes.isLoading,
			queries.bodyTypes.error,
			queries.fuelTypes.data,
			queries.fuelTypes.isLoading,
			queries.fuelTypes.error,
			queries.transmissionTypes.data,
			queries.transmissionTypes.isLoading,
			queries.transmissionTypes.error,
			queries.driveTypes.data,
			queries.driveTypes.isLoading,
			queries.driveTypes.error,
			queries.conditionTypes.data,
			queries.conditionTypes.isLoading,
			queries.conditionTypes.error,
		],
	);

	return (
		<div className="space-y-4">
			<h3 className="font-medium text-lg">Car Specifications</h3>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
				<ComboBoxField config={modelFieldConfig} control={control} />

				{selectFieldConfigs.map((config) => (
					<StandardSelectField
						key={config.name}
						config={config}
						control={control}
					/>
				))}
			</div>
		</div>
	);
}

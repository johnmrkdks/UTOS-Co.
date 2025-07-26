import type { Control } from "react-hook-form"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AddCarFormValues } from "../add-car-form"
import { useGetCarModelsQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-model/use-get-car-models-query"
import { useGetCarBodyTypesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-body-type/use-get-car-body-types-query"
import { useGetCarFuelTypesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-fuel-type/use-get-car-fuel-types-query"
import { useGetCarTransmissionTypesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-transmission-type/use-get-car-transmission-types-query"
import { useGetCarDriveTypesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-drive-type/use-get-car-drive-types-query"
import { useGetCarConditionTypesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-condition-type/use-get-car-condition-types-query"

type SpecificationsFormProps = {
	control: Control<AddCarFormValues>
}

export function SpecificationsForm({ control }: SpecificationsFormProps) {
	const { data: models, isLoading: isModelsLoading } = useGetCarModelsQuery({})
	const { data: bodyTypes, isLoading: isBodyTypesLoading } = useGetCarBodyTypesQuery({})
	const { data: fuelTypes, isLoading: isFuelTypesLoading } = useGetCarFuelTypesQuery({})
	const { data: transmissionTypes, isLoading: isTransmissionTypesLoading } = useGetCarTransmissionTypesQuery({})
	const { data: driveTypes, isLoading: isDriveTypesLoading } = useGetCarDriveTypesQuery({})
	const { data: conditionTypes, isLoading: isConditionTypesLoading } = useGetCarConditionTypesQuery({})

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-medium">Car Specifications</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<FormField
					control={control}
					name="modelId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Model</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select a model" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{models?.data.map((model) => (
										<SelectItem key={model.id} value={model.id}>
											{model.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="bodyTypeId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Body Type</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select body type" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{bodyTypes?.data.map((type) => (
										<SelectItem key={type.id} value={type.id}>
											{type.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="fuelTypeId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Fuel Type</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select fuel type" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{fuelTypes?.data.map((type) => (
										<SelectItem key={type.id} value={type.id}>
											{type.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="transmissionTypeId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Transmission</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select transmission" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{transmissionTypes?.data.map((type) => (
										<SelectItem key={type.id} value={type.id}>
											{type.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="driveTypeId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Drive Type</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select drive type" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{driveTypes?.data.map((type) => (
										<SelectItem key={type.id} value={type.id}>
											{type.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="conditionTypeId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Condition</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select condition" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{conditionTypes?.data.map((type) => (
										<SelectItem key={type.id} value={type.id}>
											{type.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	)
}


import type { Control } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import type { AddCarFormValues } from "../add-car-form"
import { DateInput } from "@workspace/ui/components/date-input"

type MaintenanceFormProps = {
	control: Control<AddCarFormValues>
}

export function MaintenanceForm({ control }: MaintenanceFormProps) {
	return (
		<div className="space-y-4">
			<h3 className="text-lg font-medium">Maintenance & Compliance</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormField
					control={control}
					name="insuranceExpiry"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Insurance Expiry (Optional)</FormLabel>
							<FormControl>
								<DateInput {...field} />
							</FormControl>
							<FormDescription className="text-xs">When the insurance expires</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="registrationExpiry"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Registration Expiry (Optional)</FormLabel>
							<FormControl>
								<DateInput {...field} />
							</FormControl>
							<FormDescription className="text-xs">When the registration expires</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="lastServiceDate"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Last Service Date (Optional)</FormLabel>
							<FormControl>
								<DateInput {...field} />
							</FormControl>
							<FormDescription className="text-xs">When the car was last serviced</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="nextServiceDue"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Next Service Due (Optional)</FormLabel>
							<FormControl>
								<DateInput {...field} />
							</FormControl>
							<FormDescription className="text-xs">When the next service is due</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	)
}


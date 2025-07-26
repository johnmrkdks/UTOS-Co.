import type { Control } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AddCarFormValues } from "../add-car-form"
import { CarStatusEnum } from "server/types"

type OperationalStatusFormProps = {
	control: Control<AddCarFormValues>
}

export function OperationalStatusForm({ control }: OperationalStatusFormProps) {
	return (
		<div className="space-y-4">
			<h3 className="text-lg font-medium">Operational Status</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-4">
					<h4 className="font-medium">Service Availability</h4>
					<FormField
						control={control}
						name="availableForPackages"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
								<FormControl>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Available for Packages</FormLabel>
									<FormDescription>Car can be used for package delivery services</FormDescription>
								</div>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="availableForCustom"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
								<FormControl>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Available for Custom Services</FormLabel>
									<FormDescription>Car can be used for custom booking services</FormDescription>
								</div>
							</FormItem>
						)}
					/>
				</div>

				<div className="space-y-4">
					<h4 className="font-medium">System Status</h4>
					<FormField
						control={control}
						name="isActive"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
								<FormControl>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Active</FormLabel>
									<FormDescription>Car is active in the system</FormDescription>
								</div>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="isAvailable"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
								<FormControl>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Available</FormLabel>
									<FormDescription>Car is currently available for booking</FormDescription>
								</div>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Current Status</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value={CarStatusEnum.Available}>Available</SelectItem>
										<SelectItem value={CarStatusEnum.Booked}>Booked</SelectItem>
										<SelectItem value={CarStatusEnum.InService}>In Service</SelectItem>
										<SelectItem value={CarStatusEnum.Maintenance}>Maintenance</SelectItem>
										<SelectItem value={CarStatusEnum.OutOfService}>Out of Service</SelectItem>
									</SelectContent>
								</Select>
								<FormDescription>Current operational status of the car</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</div>
		</div>
	)
}


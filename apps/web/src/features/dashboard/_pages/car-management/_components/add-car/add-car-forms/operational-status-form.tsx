import type { Control } from "react-hook-form"

import { Checkbox } from "@workspace/ui/components/checkbox"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Input } from "@workspace/ui/components/input"
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
									<FormDescription className="text-xs">Car is active in the system</FormDescription>
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
									<FormDescription className="text-xs">Car is currently available for booking</FormDescription>
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
								<FormDescription className="text-xs">Current operational status of the car</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="space-y-4">
					<h4 className="font-medium">Service Availability</h4>
					
					<FormField
						control={control}
						name="baseFare"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Base Fare *</FormLabel>
								<FormControl>
									<div className="relative">
										<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
										<Input
											{...field}
											type="number"
											min="1"
											max="1000"
											step="0.01"
											placeholder="30.00"
											className="pl-7"
											onChange={(e) => {
												// Convert dollars to cents
												const dollars = parseFloat(e.target.value) || 0;
												const cents = Math.round(dollars * 100);
												field.onChange(cents);
											}}
											value={field.value ? (field.value / 100).toFixed(2) : ""}
										/>
									</div>
								</FormControl>
								<FormDescription className="text-xs">
									Starting fare for this specific car (used for custom bookings)
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
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
									<FormDescription className="text-xs">Car can be used for package delivery services</FormDescription>
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
									<FormDescription className="text-xs">Car can be used for custom booking services</FormDescription>
								</div>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="isPublished"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
								<FormControl>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Publish to Customers</FormLabel>
									<FormDescription className="text-xs">Make this car visible to public customers</FormDescription>
								</div>
							</FormItem>
						)}
					/>
				</div>
			</div>
		</div>
	)
}


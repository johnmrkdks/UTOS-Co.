import type { Control } from "react-hook-form"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { AddCarFormValues } from "../add-car-form"

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
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
										>
											{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={field.value}
										onSelect={field.onChange}
										disabled={(date) => date < new Date()}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<FormDescription>When the insurance expires</FormDescription>
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
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
										>
											{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={field.value}
										onSelect={field.onChange}
										disabled={(date) => date < new Date()}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<FormDescription>When the registration expires</FormDescription>
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
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
										>
											{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={field.value}
										onSelect={field.onChange}
										disabled={(date) => date > new Date()}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<FormDescription>When the car was last serviced</FormDescription>
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
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
										>
											{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={field.value}
										onSelect={field.onChange}
										disabled={(date) => date < new Date()}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<FormDescription>When the next service is due</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	)
}


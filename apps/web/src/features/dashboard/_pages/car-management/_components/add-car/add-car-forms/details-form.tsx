import type { Control } from "react-hook-form"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { AddCarFormValues } from "../add-car-form"

type DetailsFormProps = {
	control: Control<AddCarFormValues>
}

export function DetailsForm({ control }: DetailsFormProps) {
	return (
		<div className="space-y-4">
			<h3 className="text-lg font-medium">Car Details</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<FormField
					control={control}
					name="licensePlate"
					render={({ field }) => (
						<FormItem>
							<FormLabel>License Plate</FormLabel>
							<FormControl>
								<Input placeholder="ABC-1234" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="mileage"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Mileage (km)</FormLabel>
							<FormControl>
								<Input
									type="number"
									placeholder="50000"
									{...field}
									onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="color"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Color</FormLabel>
							<FormControl>
								<Input placeholder="e.g., White, Black, Silver" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="engineSize"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Engine Size (CC)</FormLabel>
							<FormControl>
								<Input
									type="number"
									placeholder="2000"
									{...field}
									onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="doors"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Number of Doors</FormLabel>
							<FormControl>
								<Input
									type="number"
									min="2"
									max="8"
									{...field}
									onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 4)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="cylinders"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Cylinders</FormLabel>
							<FormControl>
								<Input
									type="number"
									min="1"
									{...field}
									onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 4)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	)
}


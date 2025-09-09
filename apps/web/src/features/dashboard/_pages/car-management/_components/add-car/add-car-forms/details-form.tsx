import type { Control } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
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
					name="seatingCapacity"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Seating Capacity</FormLabel>
							<FormControl>
								<Input
									type="number"
									min="1"
									max="15"
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
					name="luggageCapacity"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Luggage Capacity</FormLabel>
							<FormControl>
								<Input
									type="number"
									placeholder="Number of bags or volume"
									{...field}
									onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)}
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


import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function BrandForm() {
	return (
		<FormField
			name="name"
			render={({ field }) => (
				<FormItem className="flex flex-col items-start">
					<FormLabel>Brand Name</FormLabel>
					<FormControl>
						<div className="relative">
							<Input
								placeholder="Enter brand name"
								className="pr-8"
								{...field}
							/>
							<div className="absolute right-2 top-1/2 -translate-y-1/2">{getValidationIcon()}</div>
						</div>
					</FormControl>
					<FormMessage />
					{getValidationMessage()}
				</FormItem>
			)}
		/>
	)
}

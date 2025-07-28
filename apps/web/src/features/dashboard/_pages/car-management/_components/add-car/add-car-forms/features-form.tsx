import type { Control } from "react-hook-form"
import { useController } from "react-hook-form"
import { Plus, SearchIcon } from "lucide-react"
import { memo, useState, useMemo, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { AddCarFormValues } from "../add-car-form"
import { useGetCarFeaturesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-feature/use-get-car-features-query"

// Types
type FeaturesFormProps = {
	control: Control<AddCarFormValues>
	className?: string
}

type Feature = { id: string; name: string }

// Sub-component for individual feature checkboxes
// Moved outside the main component to prevent re-definition on each render.
// uses useController for better performance and encapsulation.
const FeatureItem = memo(({ control, feature }: { control: Control<AddCarFormValues>; feature: Feature }) => {
	const { field } = useController({
		control,
		name: "featureIds", // Note: using the new schema field name
	})

	const isChecked = field.value?.includes(feature.id) ?? false

	const onCheckedChange = useCallback(() => {
		const currentValues = field.value ?? []
		const newValues = isChecked
			? currentValues.filter((id) => id !== feature.id)
			: [...currentValues, feature.id]
		field.onChange(newValues)
	}, [field, isChecked, feature.id])

	return (
		<FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md p-1.5 hover:bg-muted/50">
			<FormControl>
				<Checkbox checked={isChecked} onCheckedChange={onCheckedChange} />
			</FormControl>
			<FormLabel className="flex-1 cursor-pointer text-xs font-normal leading-tight">
				{feature.name}
			</FormLabel>
		</FormItem>
	)
})
FeatureItem.displayName = "FeatureItem"

// Main component
export const FeaturesForm = memo<FeaturesFormProps>(({ control, className, ...props }) => {
	const [searchTerm, setSearchTerm] = useState("")
	const { data: featuresResponse, isLoading } = useGetCarFeaturesQuery({})
	const allFeatures = useMemo(() => featuresResponse?.data ?? [], [featuresResponse])

	const filteredFeatures = useMemo(
		() =>
			searchTerm
				? allFeatures.filter((feature) =>
					feature.name.toLowerCase().includes(searchTerm.toLowerCase())
				)
				: allFeatures,
		[allFeatures, searchTerm]
	)

	return (
		<Card className={cn("shadow-none", className)} {...props}>
			<CardHeader>
				<div className="flex w-full flex-row items-center justify-between">
					<CardTitle className="text-lg">Car Features</CardTitle>
					<Button type="button" variant="outline" size="sm">
						<Plus className="h-4 w-4" />
						Add New Feature
					</Button>
				</div>
				<CardDescription>Select the features available in this car.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="relative">
					<SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search features..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="bg-background pl-9 h-9"
						disabled={isLoading}
					/>
				</div>

				<FormField
					control={control}
					name="featureIds" // Note: using the new schema field name
					render={({ field }) => (
						<>
							<div className="flex items-center justify-between pt-1.5 text-sm">
								<span className="text-xs text-muted-foreground">
									{/* Selected count is now derived directly from the form state */}
									{field.value?.length ?? 0} of {allFeatures.length} selected
								</span>
								{(field.value?.length ?? 0) > 0 && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => field.onChange([])} // Simplified clear all
										className="h-6 px-2 py-1 text-xs hover:text-destructive"
									>
										Clear all
									</Button>
								)}
							</div>

							<FormItem>
								<ScrollArea className="h-[400px] w-full rounded-md border bg-background p-2">
									<div className="grid grid-cols-2 gap-x-4 gap-y-2">
										{/* Simplified rendering logic */}
										{filteredFeatures.map((feature) => (
											<FeatureItem
												key={feature.id}
												control={control}
												feature={feature}
											/>
										))}
									</div>
									{isLoading && (
										<p className="py-8 text-center text-sm text-muted-foreground">
											Loading features...
										</p>
									)}
									{!isLoading && filteredFeatures.length === 0 && (
										<div className="py-8 text-center text-muted-foreground">
											<p className="text-sm">
												No features found
												{searchTerm && ` matching "${searchTerm}"`}
											</p>
										</div>
									)}
								</ScrollArea>
								<FormMessage />
							</FormItem>
						</>
					)}
				/>
			</CardContent>
		</Card>
	)
})
FeaturesForm.displayName = "FeaturesForm"

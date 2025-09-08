import { Button } from "@workspace/ui/components/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Trash2Icon, AlertTriangle, Car } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { CarFeature } from "server/types"
import { useCheckCarFeatureUsageQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-feature/use-check-car-feature-usage-query"
import { useDeleteCarFeatureMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car-feature/use-delete-car-feature-mutation"

type DeleteFeatureDialogProps = {
	feature: CarFeature
	className?: string
}

const FormSchema = z.object({
	confirmation: z.boolean().refine((val) => val === true, {
		message: "You must confirm to delete the feature",
	}),
})

type FormValues = z.infer<typeof FormSchema>

export function DeleteFeatureDialog({ feature, className }: DeleteFeatureDialogProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const { data: checkUsage, isLoading: isCheckingUsage } = useCheckCarFeatureUsageQuery({ id: feature.id })
	const mutation = useDeleteCarFeatureMutation()

	const form = useForm<FormValues>({
		resolver: zodResolver(FormSchema),
		disabled: mutation.isPending,
		defaultValues: {
			confirmation: false,
		},
	})

	const handleReset = () => {
		form.reset()
	}

	const handleSubmit = () => {
		mutation.mutate(
			{ id: feature.id },
			{
				onSuccess: () => {
					handleReset()
					setIsDialogOpen(false)
				},
			},
		)
	}

	const canDelete = checkUsage?.canDelete ?? true
	const isInUse = checkUsage?.usage?.isInUse ?? false

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="destructive" size="icon" className={className}>
					<Trash2Icon className="w-4 h-4" />
				</Button>
			</DialogTrigger>
			<DialogContent showCloseButton={false} className="flex flex-col gap-6">
				<DialogHeader>
					<DialogTitle>Delete Feature</DialogTitle>
					<DialogDescription>
						{isInUse
							? "This feature cannot be deleted because it is currently in use."
							: "Before deleting this feature, please make sure that all models associated with this feature are not in use."}
					</DialogDescription>
				</DialogHeader>

				{/* Usage Information */}
				<div className="space-y-4">
					{isCheckingUsage ? (
						<div className="space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-16 w-full" />
						</div>
					) : checkUsage ? (
						<>
							{/* Usage Stats */}
							<div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
								<div className="flex items-center gap-2">
									<Car className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm font-medium">Cars:</span>
									<Badge variant="secondary">{checkUsage.usage.carCount}</Badge>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium">Total:</span>
									<Badge variant={isInUse ? "destructive" : "secondary"}>{checkUsage.usage.totalUsages}</Badge>
								</div>
							</div>

							{/* Error Message */}
							{isInUse && checkUsage.errorMessage && (
								<Alert variant="destructive">
									<AlertTriangle className="h-4 w-4" />
									<AlertDescription>{checkUsage.errorMessage}</AlertDescription>
								</Alert>
							)}

							{/* Success Message */}
							{!isInUse && (
								<Alert>
									<AlertDescription>This feature is not currently in use and can be safely deleted.</AlertDescription>
								</Alert>
							)}
						</>
					) : null}
				</div>

				{/* Form - Only show if feature can be deleted */}
				{canDelete && (
					<Form {...form as any}>
						<form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
							<FormField
								control={form.control as any}
								name="confirmation"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2">
										<FormControl>
											<Checkbox checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
										<FormLabel>
											Are you sure you want to delete the feature <span className="font-bold">{feature.name}</span>?
										</FormLabel>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				)}

				<DialogFooter>
					<DialogClose>
						<Button
							type="button"
							variant="ghost"
							onClick={() => {
								handleReset()
							}}
						>
							{canDelete ? "Cancel" : "Close"}
						</Button>
					</DialogClose>
					{canDelete && (
						<Button
							type="submit"
							variant="destructive"
							disabled={mutation.isPending || !form.watch("confirmation") || isCheckingUsage}
							onClick={form.handleSubmit(handleSubmit)}
						>
							{mutation.isPending ? "Deleting..." : "Delete Feature"}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}



import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trash2Icon, AlertTriangle, Car } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { CarFuelType } from "server/types"
import { useDeleteCarFuelTypeMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car-fuel-type/use-delete-car-fuel-type-mutation"
import { useCheckCarFuelTypeUsageQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-fuel-type/use-check-car-fuel-type-usage-query"

type DeleteFuelTypeDialogProps = {
	fuelType: CarFuelType
	className?: string
}

const FormSchema = z.object({
	confirmation: z.boolean().refine((val) => val === true, {
		message: "You must confirm to delete the fuel type",
	}),
})

type FormValues = z.infer<typeof FormSchema>

export function DeleteFuelTypeDialog({ fuelType, className }: DeleteFuelTypeDialogProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const { data: checkUsage, isLoading: isCheckingUsage } = useCheckCarFuelTypeUsageQuery({ id: fuelType.id })
	const mutation = useDeleteCarFuelTypeMutation()

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
			{ id: fuelType.id },
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
					<DialogTitle>Delete Fuel Type</DialogTitle>
					<DialogDescription>
						{isInUse
							? "This fuel type cannot be deleted because it is currently in use."
							: "Before deleting this fuel type, please make sure that all models associated with this fuel type are not in use."}
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
									<AlertDescription>This fuel type is not currently in use and can be safely deleted.</AlertDescription>
								</Alert>
							)}
						</>
					) : null}
				</div>

				{/* Form - Only show if fuelType can be deleted */}
				{canDelete && (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
							<FormField
								control={form.control}
								name="confirmation"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2">
										<FormControl>
											<Checkbox checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
										<FormLabel>
											Are you sure you want to delete the fuel type <span className="font-bold">{fuelType.name}</span>?
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
							{mutation.isPending ? "Deleting..." : "Delete Fuel Type"}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}



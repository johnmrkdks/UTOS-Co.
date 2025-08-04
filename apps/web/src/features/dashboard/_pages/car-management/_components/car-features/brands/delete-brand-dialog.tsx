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
import { Trash2Icon, AlertTriangle, Car, Settings } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { CarBrand } from "server/types"
import { useDeleteCarBrandMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car-brand/use-delete-car-brand-mutation"
import { useCheckCarBrandUsageQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-brand/use-check-car-brand-usage-query"

type DeleteBrandDialogProps = {
	brand: CarBrand
	className?: string
}

const FormSchema = z.object({
	confirmation: z.boolean().refine((val) => val === true, {
		message: "You must confirm to delete the brand",
	}),
})

type FormValues = z.infer<typeof FormSchema>

export function DeleteBrandDialog({ brand, className }: DeleteBrandDialogProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const { data: checkUsage, isLoading: isCheckingUsage } = useCheckCarBrandUsageQuery({ id: brand.id })
	const mutation = useDeleteCarBrandMutation()

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
			{ id: brand.id },
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
					<DialogTitle>Delete Brand</DialogTitle>
					<DialogDescription>
						{isInUse
							? "This brand cannot be deleted because it is currently in use."
							: "Before deleting this brand, please make sure that all models associated with this brand are not in use."}
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
									<Settings className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm font-medium">Models:</span>
									<Badge variant="secondary">{checkUsage.usage.carModelsCount}</Badge>
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
									<AlertDescription>This brand is not currently in use and can be safely deleted.</AlertDescription>
								</Alert>
							)}
						</>
					) : null}
				</div>

				{/* Form - Only show if brand can be deleted */}
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
											Are you sure you want to delete the brand <span className="font-bold">{brand.name}</span>?
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
							{mutation.isPending ? "Deleting..." : "Delete Brand"}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}


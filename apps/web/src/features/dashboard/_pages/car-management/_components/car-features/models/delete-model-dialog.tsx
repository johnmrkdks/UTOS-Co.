import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { CarBrand } from "server/types"
import { useDeleteCarModelMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car-model/use-delete-car-model-mutation"

type DeleteBrandDialogProps = {
	model: CarBrand
	className?: string
}

const FormSchema = z.object({
	confirmation: z
		.boolean()
		.refine((val) => val === true, {
			message: "You must confirm to delete the model",
		}),
})

type FormValues = z.infer<typeof FormSchema>

export function DeleteModelDialog({ model, className }: DeleteBrandDialogProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const mutation = useDeleteCarModelMutation()

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
			{ id: model.id },
			{
				onSuccess: () => {
					handleReset()
					setIsDialogOpen(false)
				},
			}
		)
	}

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="destructive" size="icon" className={className}>
					<Trash2Icon className="w-4 h-4" />
				</Button>
			</DialogTrigger>
			<DialogContent showCloseButton={false} className="flex flex-col gap-8">
				<DialogHeader>
					<DialogTitle>Delete Brand</DialogTitle>
					<DialogDescription>
						Deleting a model will remove all associated cars and models.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-8">
						<FormField
							control={form.control}
							name="confirmation"
							render={({ field }) => (
								<FormItem className="flex items-center gap-2">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<FormLabel>
										Are you sure you want to delete the model
										<span className="font-bold">{model.name}</span>?
									</FormLabel>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<DialogClose>
								<Button
									type="button"
									variant="ghost"
									onClick={() => {
										handleReset();
									}}
								>
									Cancel
								</Button>
							</DialogClose>
							<Button
								type="submit"
								variant="destructive"
								disabled={mutation.isPending || !form.watch("confirmation")}
								loading={mutation.isPending}
							>
								{mutation.isPending ? "Deleting..." : "Delete Brand"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

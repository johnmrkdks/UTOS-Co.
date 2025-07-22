import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SquarePenIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { CarBrand } from "server/types"
import { useUpdateCarBrandMutation } from "@/features/dashboard/car-management/hooks/queries/use-update-car-brand-mutation";

type EditBrandDialogProps = {
	brand: CarBrand;
	className?: string;
}

const FormSchema = z.object({
	name: z.string().min(1).max(50),
});

type FormValues = z.infer<typeof FormSchema>;

export function EditBrandDialog({ brand, className }: EditBrandDialogProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const mutation = useUpdateCarBrandMutation();

	const form = useForm<FormValues>({
		defaultValues: {
			name: brand.name,
		},
	});

	const handleReset = () => {
		form.reset();
	};

	const handleSubmit = (data: FormValues) => {
		mutation.mutate({
			id: brand.id,
			data
		}, {
			onSuccess: () => {
				setIsDialogOpen(false);
				handleReset();
			},
		})
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<SquarePenIcon className="w-4 h-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="flex flex-col gap-8">
				<DialogHeader>
					<DialogTitle>Edit New Brand</DialogTitle>
					<DialogDescription>Enter the name of the car brand.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
						<div>
							<FormField name="name" render={({ field }) => (
								<div className="grid gap-2">
									<FormLabel>Brand Name</FormLabel>
									<FormControl>
										<Input
											{...field}
											disabled={mutation.isPending}
											placeholder="Enter brand name"
										/>
									</FormControl>
								</div>
							)}
							/>
						</div>

						<DialogFooter>
							<Button type="submit"
								loading={mutation.isPending}
								disabled={mutation.isPending}>
								{mutation.isPending ? "Updating..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

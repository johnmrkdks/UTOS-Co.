import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormField, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useCreateCarBrandMutation } from "@/features/dashboard/car-management/hooks/queries/use-create-car-brand-mutation";

const FormSchema = z.object({
	name: z.string().min(1).max(50),
});

type FormValues = z.infer<typeof FormSchema>;

export function AddBrandDialog() {
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const mutation = useCreateCarBrandMutation();

	const form = useForm<FormValues>({
		defaultValues: {
			name: "",
		},
	});

	const handleReset = () => {
		form.reset();
	};

	const handleAddBrand = (data: FormValues) => {
		mutation.mutate(data, {
			onSuccess: () => {
				setIsAddDialogOpen(false);
				handleReset();
			},
		})
	};

	return (
		<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
			<DialogTrigger asChild>
				<Button>
					<PlusIcon className="w-4 h-4" />
					Add Brand
				</Button>
			</DialogTrigger>
			<DialogContent className="flex flex-col gap-8">
				<DialogHeader>
					<DialogTitle>Add New Brand</DialogTitle>
					<DialogDescription>Enter the name of the new car brand.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleAddBrand)} className="flex flex-col gap-4">
						<div>
							<FormField name="name" render={({ field }) => (
								<div className="grid gap-2">
									<FormLabel>Brand Name</FormLabel>
									<Input
										{...field}
										disabled={mutation.isPending}
										placeholder="Enter brand name"
									/>
								</div>
							)}
							/>
						</div>

						<DialogFooter>
							<Button type="submit"
								loading={mutation.isPending}
								disabled={!form.formState.isDirty || mutation.isPending}>
								{mutation.isPending ? "Adding..." : "Add Brand"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

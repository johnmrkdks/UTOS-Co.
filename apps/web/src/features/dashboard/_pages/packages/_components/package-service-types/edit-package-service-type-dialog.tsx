import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useModal } from "@/hooks/use-modal";
import { useUpdatePackageServiceTypeMutation } from "../../_hooks/query/use-update-package-service-type-mutation";
import { useEffect } from "react";

const formSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
	description: z.string().optional(),
	isActive: z.boolean(),
	displayOrder: z.number().int().min(0),
});

type FormValues = z.infer<typeof formSchema>;

export function EditPackageServiceTypeDialog() {
	const { isModalOpen, closeModal, modalState } = useModal();
	const updateMutation = useUpdatePackageServiceTypeMutation();
	
	const isOpen = isModalOpen("edit-package-service-type");
	const data = modalState.data;

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			isActive: true,
			displayOrder: 0,
		},
	});

	useEffect(() => {
		if (data && isOpen) {
			form.reset({
				name: data.name || "",
				description: data.description || "",
				isActive: data.isActive ?? true,
				displayOrder: data.displayOrder || 0,
			});
		}
	}, [data, isOpen, form]);

	const onSubmit = (values: FormValues) => {
		if (!data?.id) return;

		updateMutation.mutate(
			{ id: data.id, ...values },
			{
				onSuccess: () => {
					closeModal();
					form.reset();
				},
			}
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={closeModal}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Edit Service Type</DialogTitle>
					<DialogDescription>
						Update the service type information.
					</DialogDescription>
				</DialogHeader>

				<Form {...form as any}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control as any}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="e.g. Transfer, Tour, Event, Hourly" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control as any}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Describe this service type..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>


						<FormField
							control={form.control as any}
							name="displayOrder"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Display Order</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="0"
											{...field}
											onChange={(e) => field.onChange(Number(e.target.value))}
										/>
									</FormControl>
									<FormDescription>
										Lower numbers appear first in lists
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control as any}
							name="isActive"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>Active</FormLabel>
										<FormDescription>
											Only active service types can be used for new packages
										</FormDescription>
									</div>
								</FormItem>
							)}
						/>

						<div className="flex justify-end space-x-2">
							<Button
								type="button"
								variant="outline"
								onClick={closeModal}
								disabled={updateMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={updateMutation.isPending}>
								{updateMutation.isPending ? "Updating..." : "Update Service Type"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
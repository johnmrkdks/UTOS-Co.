import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useModal } from "@/hooks/use-modal";
import { useCreatePackageServiceTypeMutation } from "../../_hooks/query/use-create-package-service-type-mutation";

const formSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(100, "Name must be 100 characters or less"),
	description: z.string().optional(),
	rateType: z.enum(["fixed", "hourly"]).default("fixed"),
	isActive: z.boolean().default(true),
	displayOrder: z.number().int().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

export function AddPackageServiceTypeDialog() {
	const { isModalOpen, closeModal } = useModal();
	const createMutation = useCreatePackageServiceTypeMutation();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			rateType: "fixed" as const,
			isActive: true,
			displayOrder: 0,
		},
	});

	const onSubmit = (values: FormValues) => {
		createMutation.mutate(values, {
			onSuccess: () => {
				closeModal();
				form.reset();
			},
		});
	};

	return (
		<Dialog
			open={isModalOpen("add-package-service-type")}
			onOpenChange={closeModal}
		>
			<DialogContent className="sm:max-w-[600px]" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Add Service Type</DialogTitle>
					<DialogDescription>
						Create a new service type to categorize your packages by operational
						model.
					</DialogDescription>
				</DialogHeader>

				<Form {...(form as any)}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control as any}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g. Transfer, Tour, Event, Hourly"
											{...field}
										/>
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
							name="rateType"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Rate Type</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select rate type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="fixed">
												Fixed Rate (Weddings, Concerts, Events)
											</SelectItem>
											<SelectItem value="hourly">
												Hourly Rate (Tours, City Transfers)
											</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										Fixed rate packages have one price, hourly packages charge
										per hour
									</FormDescription>
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
								disabled={createMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={createMutation.isPending}>
								{createMutation.isPending
									? "Creating..."
									: "Create Service Type"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

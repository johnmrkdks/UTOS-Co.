import { Button } from "@workspace/ui/components/button";
import { DialogClose, DialogFooter } from "@workspace/ui/components/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useCreatePackageMutation } from "../../_hooks/query/use-create-package-mutation";
import { Loader2 } from "lucide-react";

const addPackageSchema = z.object({
	name: z.string().min(1, "Package name is required").max(100, "Name too long"),
	description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
	pricePerDay: z.number().min(0, "Price must be positive"),
	isAvailable: z.boolean().default(true),
});

type AddPackageForm = z.infer<typeof addPackageSchema>;

type AddNewPackageFormProps = {
	className?: string;
	onSuccess?: () => void;
};

export function AddNewPackageForm({ className, onSuccess }: AddNewPackageFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const createPackageMutation = useCreatePackageMutation();

	const form = useForm<AddPackageForm>({
		resolver: zodResolver(addPackageSchema),
		defaultValues: {
			name: "",
			description: "",
			pricePerDay: 0,
			isAvailable: true,
		},
	});

	const onSubmit = async (data: AddPackageForm) => {
		setIsSubmitting(true);
		try {
			await createPackageMutation.mutateAsync(data);
			form.reset();
			onSuccess?.();
		} catch (error) {
			console.error("Failed to create package:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Package Name</FormLabel>
							<FormControl>
								<Input placeholder="Enter package name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea 
									placeholder="Describe the package services and features" 
									rows={3}
									{...field} 
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="pricePerDay"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Price Per Day (AUD)</FormLabel>
							<FormControl>
								<Input 
									type="number" 
									step="0.01" 
									min="0"
									placeholder="0.00" 
									{...field} 
									onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="isAvailable"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
							<div className="space-y-0.5">
								<FormLabel>Available for Booking</FormLabel>
								<div className="text-sm text-muted-foreground">
									Customers can book this package
								</div>
							</div>
							<FormControl>
								<Switch 
									checked={field.value} 
									onCheckedChange={field.onChange} 
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary" size="sm" disabled={isSubmitting}>
							Cancel
						</Button>
					</DialogClose>
					<Button type="submit" size="sm" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Create Package
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);
}

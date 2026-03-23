import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { AlertTriangle, Car, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { CarTransmissionType } from "server/types";
import { z } from "zod";
import { useCheckCarTransmissionTypeUsageQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-transmission-type/use-check-car-transmission-type-usage-query";
import { useDeleteCarTransmissionTypeMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car-transmission-type/use-delete-car-transmission-type-mutation";

type DeleteTransmissionTypeDialogProps = {
	transmissionType: CarTransmissionType;
	className?: string;
};

const FormSchema = z.object({
	confirmation: z.boolean().refine((val) => val === true, {
		message: "You must confirm to delete the transmission type",
	}),
});

type FormValues = z.infer<typeof FormSchema>;

export function DeleteTransmissionTypeDialog({
	transmissionType,
	className,
}: DeleteTransmissionTypeDialogProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const { data: checkUsage, isLoading: isCheckingUsage } =
		useCheckCarTransmissionTypeUsageQuery({ id: transmissionType.id });
	const mutation = useDeleteCarTransmissionTypeMutation();

	const form = useForm<FormValues>({
		resolver: zodResolver(FormSchema),
		disabled: mutation.isPending,
		defaultValues: {
			confirmation: false,
		},
	});

	const handleReset = () => {
		form.reset();
	};

	const handleSubmit = () => {
		mutation.mutate(
			{ id: transmissionType.id },
			{
				onSuccess: () => {
					handleReset();
					setIsDialogOpen(false);
				},
			},
		);
	};

	const canDelete = checkUsage?.canDelete ?? true;
	const isInUse = checkUsage?.usage?.isInUse ?? false;

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="destructive" size="icon" className={className}>
					<Trash2Icon className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent showCloseButton={false} className="flex flex-col gap-6">
				<DialogHeader>
					<DialogTitle>Delete Transmission Type</DialogTitle>
					<DialogDescription>
						{isInUse
							? "This transmission type cannot be deleted because it is currently in use."
							: "Before deleting this transmission type, please make sure that all models associated with this transmission type are not in use."}
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
							<div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
								<div className="flex items-center gap-2">
									<Car className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium text-sm">Cars:</span>
									<Badge variant="secondary">{checkUsage.usage.carCount}</Badge>
								</div>
								<div className="flex items-center gap-2">
									<span className="font-medium text-sm">Total:</span>
									<Badge variant={isInUse ? "destructive" : "secondary"}>
										{checkUsage.usage.totalUsages}
									</Badge>
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
									<AlertDescription>
										This transmission type is not currently in use and can be
										safely deleted.
									</AlertDescription>
								</Alert>
							)}
						</>
					) : null}
				</div>

				{/* Form - Only show if transmissionType can be deleted */}
				{canDelete && (
					<Form {...(form as any)}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="flex flex-col gap-6"
						>
							<FormField
								control={form.control as any}
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
											Are you sure you want to delete the transmission type{" "}
											<span className="font-bold">{transmissionType.name}</span>
											?
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
								handleReset();
							}}
						>
							{canDelete ? "Cancel" : "Close"}
						</Button>
					</DialogClose>
					{canDelete && (
						<Button
							type="submit"
							variant="destructive"
							disabled={
								mutation.isPending ||
								!form.watch("confirmation") ||
								isCheckingUsage
							}
							onClick={form.handleSubmit(handleSubmit)}
						>
							{mutation.isPending ? "Deleting..." : "Delete Transmission Type"}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

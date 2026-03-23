import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Loader2, Settings, CheckCircle2, Info } from "lucide-react";
import { trpc } from "@/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Common timezone options
const TIMEZONE_OPTIONS = [
	{ value: "Australia/Sydney", label: "Australia/Sydney (AEDT/AEST)" },
	{ value: "Australia/Melbourne", label: "Australia/Melbourne (AEDT/AEST)" },
	{ value: "Australia/Brisbane", label: "Australia/Brisbane (AEST)" },
	{ value: "Australia/Adelaide", label: "Australia/Adelaide (ACDT/ACST)" },
	{ value: "Australia/Perth", label: "Australia/Perth (AWST)" },
	{ value: "Pacific/Auckland", label: "Pacific/Auckland (NZDT/NZST)" },
	{ value: "Asia/Manila", label: "Asia/Manila (PHT)" },
	{ value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
	{ value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
	{ value: "UTC", label: "UTC (Universal Time)" },
];

const systemSettingsSchema = z.object({
	timezone: z.string().min(1, "Timezone is required"),
	bookingReferencePrefix: z
		.string()
		.min(1, "Prefix must be at least 1 character")
		.max(10, "Prefix must be at most 10 characters")
		.regex(/^[A-Z0-9]+$/, "Prefix must contain only uppercase letters and numbers"),
});

type SystemSettingsFormData = z.infer<typeof systemSettingsSchema>;

export function SystemSettingsForm() {
	const [exampleReference, setExampleReference] = useState("DUC-123456");
	const queryClient = useQueryClient();

	// Fetch current settings
	const { data: settings, isLoading: isLoadingSettings } = useQuery(
		trpc.systemSettings.getSettings.queryOptions()
	);

	// Update mutation
	const updateSettingsMutation = useMutation(
		trpc.systemSettings.updateAllSettings.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.systemSettings.getSettings.queryKey(),
				});
				toast.success("Settings updated", {
					description: "System settings have been updated successfully.",
				});
			},
			onError: (error: any) => {
				toast.error("Update failed", {
					description: error.message || "Failed to update system settings.",
				});
			},
		})
	);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isDirty },
	} = useForm<SystemSettingsFormData>({
		resolver: zodResolver(systemSettingsSchema),
		defaultValues: {
			timezone: "Australia/Sydney",
			bookingReferencePrefix: "DUC",
		},
	});

	// Update form when settings are loaded
	useEffect(() => {
		if (settings) {
			setValue("timezone", settings.timezone);
			setValue("bookingReferencePrefix", settings.bookingReferencePrefix);
		}
	}, [settings, setValue]);

	// Watch prefix changes to update example
	const watchPrefix = watch("bookingReferencePrefix");
	useEffect(() => {
		if (watchPrefix) {
			const randomNumber = Math.floor(100000 + Math.random() * 900000);
			setExampleReference(`${watchPrefix.toUpperCase()}-${randomNumber}`);
		}
	}, [watchPrefix]);

	const onSubmit = async (data: SystemSettingsFormData) => {
		await updateSettingsMutation.mutateAsync({
			timezone: data.timezone,
			bookingReferencePrefix: data.bookingReferencePrefix.toUpperCase(),
		});
	};

	if (isLoadingSettings) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-8">
					<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Settings className="h-5 w-5" />
					System Settings
				</CardTitle>
				<CardDescription>
					Configure global system settings including timezone and booking reference format
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* Timezone Setting */}
					<div className="space-y-2">
						<Label htmlFor="timezone">
							Default Timezone
							<span className="text-red-500 ml-1">*</span>
						</Label>
						<Select
							value={watch("timezone")}
							onValueChange={(value) => setValue("timezone", value, { shouldDirty: true })}
						>
							<SelectTrigger id="timezone" className="w-full">
								<SelectValue placeholder="Select timezone" />
							</SelectTrigger>
							<SelectContent>
								{TIMEZONE_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.timezone && (
							<p className="text-sm text-red-600">{errors.timezone.message}</p>
						)}
						<p className="text-xs text-gray-500 flex items-start gap-1.5">
							<Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
							<span>
								Used as the default timezone for the system. Users can override this with their
								own timezone preference.
							</span>
						</p>
					</div>

					{/* Booking Reference Prefix */}
					<div className="space-y-2">
						<Label htmlFor="bookingReferencePrefix">
							Booking Reference Prefix
							<span className="text-red-500 ml-1">*</span>
						</Label>
						<Input
							id="bookingReferencePrefix"
							type="text"
							placeholder="DUC"
							maxLength={10}
							{...register("bookingReferencePrefix")}
							className="uppercase"
							onChange={(e) => {
								const value = e.target.value.toUpperCase();
								setValue("bookingReferencePrefix", value, { shouldDirty: true });
							}}
						/>
						{errors.bookingReferencePrefix && (
							<p className="text-sm text-red-600">
								{errors.bookingReferencePrefix.message}
							</p>
						)}
						<div className="space-y-1.5">
							<p className="text-xs text-gray-500 flex items-start gap-1.5">
								<Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
								<span>
									This prefix will be used for all new booking reference numbers. Only
									uppercase letters (A-Z) and numbers (0-9) are allowed.
								</span>
							</p>
							<div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
								<span className="text-xs font-medium text-gray-600">Example:</span>
								<code className="text-sm font-mono font-semibold text-primary">
									{exampleReference}
								</code>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-end gap-3 pt-4 border-t">
						<Button
							type="submit"
							disabled={!isDirty || updateSettingsMutation.isPending}
							className="min-w-[120px]"
						>
							{updateSettingsMutation.isPending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<CheckCircle2 className="h-4 w-4 mr-2" />
									Save Settings
								</>
							)}
						</Button>
					</div>

					{/* Success/Warning Notice */}
					{isDirty && (
						<div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
							<p className="text-xs text-amber-800">
								<strong>Note:</strong> Changing the booking reference prefix will only affect{" "}
								<strong>new bookings</strong>. Existing bookings will keep their current
								reference numbers.
							</p>
						</div>
					)}
				</form>
			</CardContent>
		</Card>
	);
}

import { Button } from "@workspace/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Switch } from "@workspace/ui/components/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useCreatePricingConfigMutation } from "../_hooks/query/use-create-pricing-config-mutation";
import { useUpdatePricingConfigMutation } from "../_hooks/query/use-update-pricing-config-mutation";
import { Loader2, DollarSign, Clock, Calendar } from "lucide-react";

const pricingConfigSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	baseFare: z.number().min(0, "Base fare must be positive"),
	pricePerKm: z.number().min(0, "Price per km must be positive"),
	pricePerMinute: z.number().min(0, "Price per minute must be positive").optional(),
	firstKmRate: z.number().min(0, "First km rate must be positive").optional(),
	firstKmLimit: z.number().min(1, "First km limit must be at least 1").optional(),
	peakHourMultiplier: z.number().min(0.1, "Peak multiplier must be positive").optional(),
	nightMultiplier: z.number().min(0.1, "Night multiplier must be positive").optional(),
	weekendMultiplier: z.number().min(0.1, "Weekend multiplier must be positive").optional(),
	waitingChargePerMinute: z.number().min(0, "Waiting charge must be positive").optional(),
	stopCharge: z.number().min(0, "Stop charge must be positive").optional(),
	cancellationFee: z.number().min(0, "Cancellation fee must be positive").optional(),
	peakHourStart: z.string().optional(),
	peakHourEnd: z.string().optional(),
	nightHourStart: z.string().optional(),
	nightHourEnd: z.string().optional(),
	isActive: z.boolean().default(true),
});

type PricingConfigForm = z.infer<typeof pricingConfigSchema>;

type PricingConfigFormProps = {
	initialData?: any;
	onSuccess?: () => void;
	mode?: "create" | "edit";
};

export function PricingConfigForm({ initialData, onSuccess, mode = "create" }: PricingConfigFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const createMutation = useCreatePricingConfigMutation();
	const updateMutation = useUpdatePricingConfigMutation();

	const form = useForm({
		resolver: zodResolver(pricingConfigSchema),
		defaultValues: {
			name: initialData?.name || "",
			baseFare: initialData?.baseFare || 0,
			pricePerKm: initialData?.pricePerKm || 0,
			pricePerMinute: initialData?.pricePerMinute || 0,
			firstKmRate: initialData?.firstKmRate || undefined,
			firstKmLimit: initialData?.firstKmLimit || 5,
			peakHourMultiplier: initialData?.peakHourMultiplier || 1.0,
			nightMultiplier: initialData?.nightMultiplier || 1.2,
			weekendMultiplier: initialData?.weekendMultiplier || 1.0,
			waitingChargePerMinute: initialData?.waitingChargePerMinute || 0,
			stopCharge: initialData?.stopCharge || 0,
			cancellationFee: initialData?.cancellationFee || 0,
			peakHourStart: initialData?.peakHourStart || "07:00",
			peakHourEnd: initialData?.peakHourEnd || "09:00",
			nightHourStart: initialData?.nightHourStart || "22:00",
			nightHourEnd: initialData?.nightHourEnd || "06:00",
			isActive: initialData?.isActive ?? true,
		},
	});

	const onSubmit = async (data: PricingConfigForm) => {
		setIsSubmitting(true);
		try {
			if (mode === "edit" && initialData?.id) {
				await updateMutation.mutateAsync({ id: initialData.id, ...data });
			} else {
				await createMutation.mutateAsync(data);
			}
			form.reset();
			onSuccess?.();
		} catch (error) {
			console.error("Failed to save pricing configuration:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Left Column */}
					<div className="space-y-6">
						{/* Basic Configuration */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<DollarSign className="h-5 w-5" />
									Basic Configuration
								</CardTitle>
								<CardDescription>Set up the core pricing structure</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Configuration Name</FormLabel>
											<FormControl>
												<Input placeholder="e.g., Standard Pricing, Premium Rates" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 gap-4">
									<FormField
										control={form.control}
										name="baseFare"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Base Fare (AUD)</FormLabel>
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
												<FormDescription>Minimum charge for any booking</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="pricePerKm"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Price per KM (AUD)</FormLabel>
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
												<FormDescription>Rate charged per kilometer</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="pricePerMinute"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Price per Minute (AUD)</FormLabel>
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
												<FormDescription>Time-based rate (optional)</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Distance Tiers */}
						<Card>
							<CardHeader>
								<CardTitle>Distance Tiers (Optional)</CardTitle>
								<CardDescription>Set different rates for initial distance</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 gap-4">
									<FormField
										control={form.control}
										name="firstKmRate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>First KM Rate (AUD)</FormLabel>
												<FormControl>
													<Input 
														type="number" 
														step="0.01" 
														min="0"
														placeholder="0.00" 
														{...field} 
														onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
													/>
												</FormControl>
												<FormDescription>Special rate for first kilometers</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="firstKmLimit"
										render={({ field }) => (
											<FormItem>
												<FormLabel>First KM Limit</FormLabel>
												<FormControl>
													<Input 
														type="number" 
														min="1"
														placeholder="5" 
														{...field} 
														onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
													/>
												</FormControl>
												<FormDescription>How many km at first km rate</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right Column */}
					<div className="space-y-6">
						{/* Time-based Multipliers */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Clock className="h-5 w-5" />
									Time-based Multipliers
								</CardTitle>
								<CardDescription>Adjust pricing for different times</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 gap-4">
									<FormField
										control={form.control}
										name="peakHourMultiplier"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Peak Hour Multiplier</FormLabel>
												<FormControl>
													<Input 
														type="number" 
														step="0.1" 
														min="0.1"
														placeholder="1.0" 
														{...field} 
														onChange={(e) => field.onChange(parseFloat(e.target.value) || 1.0)}
													/>
												</FormControl>
												<FormDescription>Rush hour rate multiplier</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="nightMultiplier"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Night Multiplier</FormLabel>
												<FormControl>
													<Input 
														type="number" 
														step="0.1" 
														min="0.1"
														placeholder="1.2" 
														{...field} 
														onChange={(e) => field.onChange(parseFloat(e.target.value) || 1.2)}
													/>
												</FormControl>
												<FormDescription>Night time rate multiplier</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="weekendMultiplier"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Weekend Multiplier</FormLabel>
												<FormControl>
													<Input 
														type="number" 
														step="0.1" 
														min="0.1"
														placeholder="1.0" 
														{...field} 
														onChange={(e) => field.onChange(parseFloat(e.target.value) || 1.0)}
													/>
												</FormControl>
												<FormDescription>Weekend rate multiplier</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<Separator />

								<div className="grid grid-cols-1 gap-4">
									<div className="space-y-2">
										<FormLabel>Peak Hours</FormLabel>
										<div className="grid grid-cols-2 gap-2">
											<FormField
												control={form.control}
												name="peakHourStart"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<Input type="time" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="peakHourEnd"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<Input type="time" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</div>

									<div className="space-y-2">
										<FormLabel>Night Hours</FormLabel>
										<div className="grid grid-cols-2 gap-2">
											<FormField
												control={form.control}
												name="nightHourStart"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<Input type="time" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="nightHourEnd"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<Input type="time" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Additional Charges */}
						<Card>
							<CardHeader>
								<CardTitle>Additional Charges</CardTitle>
								<CardDescription>Extra fees and charges</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 gap-4">
									<FormField
										control={form.control}
										name="waitingChargePerMinute"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Waiting Charge/Min (AUD)</FormLabel>
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
												<FormDescription>Charge for waiting time</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="stopCharge"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Stop Charge (AUD)</FormLabel>
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
												<FormDescription>Fee per additional stop</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="cancellationFee"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Cancellation Fee (AUD)</FormLabel>
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
												<FormDescription>Fee for cancelled bookings</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Status */}
				<Card>
					<CardHeader>
						<CardTitle>Configuration Status</CardTitle>
					</CardHeader>
					<CardContent>
						<FormField
							control={form.control}
							name="isActive"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
									<div className="space-y-0.5">
										<FormLabel>Active Configuration</FormLabel>
										<FormDescription>
											Enable this pricing configuration for new bookings
										</FormDescription>
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
					</CardContent>
				</Card>

				<div className="flex justify-end space-x-2">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{mode === "edit" ? "Update Configuration" : "Create Configuration"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
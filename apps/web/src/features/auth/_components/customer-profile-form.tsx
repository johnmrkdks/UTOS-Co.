import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { customerProfileSchema } from "@/features/auth/_schemas/customer-profile-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { useUpdateCustomerProfileMutation } from "@/features/auth/_hooks/query/use-update-customer-profile-mutation";
import { cn } from "@workspace/ui/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";

type CustomerProfileFormProps = {
	initialData?: Partial<CustomerProfileFormData>;
	className?: string;
};

type CustomerProfileFormData = z.infer<typeof customerProfileSchema>;

export function CustomerProfileForm({ initialData, className }: CustomerProfileFormProps) {
	const mutation = useUpdateCustomerProfileMutation();

	const form = useForm<CustomerProfileFormData>({
		resolver: zodResolver(customerProfileSchema),
		defaultValues: {
			name: initialData?.name || "",
			email: initialData?.email || "",
			phone: initialData?.phone || "",
			address: initialData?.address || "",
			city: initialData?.city || "",
			state: initialData?.state || "",
			postalCode: initialData?.postalCode || "",
			country: initialData?.country || "Australia",
			emergencyContactName: initialData?.emergencyContactName || "",
			emergencyContactPhone: initialData?.emergencyContactPhone || "",
			emergencyContactRelationship: initialData?.emergencyContactRelationship || "",
			preferredCarType: initialData?.preferredCarType || "",
			communicationPreferences: initialData?.communicationPreferences || "email",
		},
		disabled: mutation.isPending,
	});

	const onSubmit = async (data: CustomerProfileFormData) => {
		// Remove name and email as they're managed by the user table
		const { name, email, ...profileData } = data;
		mutation.mutate(profileData);
	};

	return (
		<div className={cn("w-full max-w-4xl mx-auto", className)}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Personal Information */}
					<Card>
						<CardHeader>
							<CardTitle>Personal Information</CardTitle>
							<CardDescription>
								Your basic personal details for bookings and identification.
							</CardDescription>
						</CardHeader>
						<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Full Name</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="Enter your full name"
												disabled // Name is managed by user table
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email Address</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="email"
												placeholder="Enter your email"
												disabled // Email is managed by user table
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone Number</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="tel"
												placeholder="+61 4XX XXX XXX"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								name="preferredCarType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Preferred Car Type</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select car type preference" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="luxury">Luxury</SelectItem>
												<SelectItem value="sedan">Sedan</SelectItem>
												<SelectItem value="suv">SUV</SelectItem>
												<SelectItem value="executive">Executive</SelectItem>
												<SelectItem value="economy">Economy</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Address Information */}
					<Card>
						<CardHeader>
							<CardTitle>Address Information</CardTitle>
							<CardDescription>
								Your address details for pickup and delivery services.
							</CardDescription>
						</CardHeader>
						<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="md:col-span-2">
								<FormField
									name="address"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Street Address</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder="Enter your street address"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								name="city"
								render={({ field }) => (
									<FormItem>
										<FormLabel>City</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="Enter city"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								name="state"
								render={({ field }) => (
									<FormItem>
										<FormLabel>State</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select state" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="NSW">New South Wales</SelectItem>
												<SelectItem value="VIC">Victoria</SelectItem>
												<SelectItem value="QLD">Queensland</SelectItem>
												<SelectItem value="SA">South Australia</SelectItem>
												<SelectItem value="WA">Western Australia</SelectItem>
												<SelectItem value="TAS">Tasmania</SelectItem>
												<SelectItem value="NT">Northern Territory</SelectItem>
												<SelectItem value="ACT">Australian Capital Territory</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								name="postalCode"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Postal Code</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="Enter postal code"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								name="country"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Country</FormLabel>
										<FormControl>
											<Input
												{...field}
												disabled // Default to Australia
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Emergency Contact */}
					<Card>
						<CardHeader>
							<CardTitle>Emergency Contact</CardTitle>
							<CardDescription>
								Emergency contact details for safety and security purposes.
							</CardDescription>
						</CardHeader>
						<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								name="emergencyContactName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contact Name</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="Enter emergency contact name"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								name="emergencyContactPhone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contact Phone</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="tel"
												placeholder="+61 4XX XXX XXX"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								name="emergencyContactRelationship"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Relationship</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select relationship" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="spouse">Spouse</SelectItem>
												<SelectItem value="parent">Parent</SelectItem>
												<SelectItem value="child">Child</SelectItem>
												<SelectItem value="sibling">Sibling</SelectItem>
												<SelectItem value="friend">Friend</SelectItem>
												<SelectItem value="colleague">Colleague</SelectItem>
												<SelectItem value="other">Other</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								name="communicationPreferences"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Communication Preference</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select preference" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="email">Email</SelectItem>
												<SelectItem value="sms">SMS</SelectItem>
												<SelectItem value="both">Both Email & SMS</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Submit Button */}
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={!form.formState.isValid || mutation.isPending}
							loading={mutation.isPending}
							className="min-w-32"
						>
							{mutation.isPending ? "Saving..." : "Save Profile"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
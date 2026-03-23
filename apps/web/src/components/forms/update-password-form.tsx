import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Eye, EyeOff, Loader2, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdatePasswordMutation } from "@/hooks/auth/use-update-password-mutation";

const updatePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Password must contain at least one uppercase letter, one lowercase letter, and one number",
			),
		confirmPassword: z.string().min(1, "Please confirm your new password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

interface UpdatePasswordFormProps {
	title?: string;
	description?: string;
	className?: string;
	onSuccess?: () => void;
}

export const UpdatePasswordForm = ({
	title = "Update Password",
	description = "Change your account password. Make sure it's strong and unique.",
	className = "",
	onSuccess,
}: UpdatePasswordFormProps) => {
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const updatePasswordMutation = useUpdatePasswordMutation();

	const form = useForm<UpdatePasswordFormData>({
		resolver: zodResolver(updatePasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (data: UpdatePasswordFormData) => {
		try {
			await updatePasswordMutation.mutateAsync({
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
				revokeOtherSessions: true,
			});

			// Reset form on success
			form.reset();
			onSuccess?.();
		} catch (error) {
			// Error is handled by the mutation hook
		}
	};

	return (
		<Card className={className}>
			<CardHeader className="space-y-1">
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
						<Lock className="h-4 w-4 text-orange-600" />
					</div>
					<div>
						<CardTitle className="text-lg">{title}</CardTitle>
						<CardDescription className="text-sm">{description}</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{/* Current Password */}
						<FormField
							control={form.control}
							name="currentPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Current Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												{...field}
												type={showCurrentPassword ? "text" : "password"}
												placeholder="Enter your current password"
												disabled={updatePasswordMutation.isPending}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() =>
													setShowCurrentPassword(!showCurrentPassword)
												}
												disabled={updatePasswordMutation.isPending}
											>
												{showCurrentPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* New Password */}
						<FormField
							control={form.control}
							name="newPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>New Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												{...field}
												type={showNewPassword ? "text" : "password"}
												placeholder="Enter your new password"
												disabled={updatePasswordMutation.isPending}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowNewPassword(!showNewPassword)}
												disabled={updatePasswordMutation.isPending}
											>
												{showNewPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Confirm Password */}
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm New Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												{...field}
												type={showConfirmPassword ? "text" : "password"}
												placeholder="Confirm your new password"
												disabled={updatePasswordMutation.isPending}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() =>
													setShowConfirmPassword(!showConfirmPassword)
												}
												disabled={updatePasswordMutation.isPending}
											>
												{showConfirmPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Security Notice */}
						<div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
							<div className="flex items-start gap-2">
								<Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
								<div className="text-blue-800 text-sm">
									<p className="mb-1 font-medium">Security Notice</p>
									<p>
										Changing your password will sign you out of all other
										devices and sessions for security.
									</p>
								</div>
							</div>
						</div>

						{/* Submit Button */}
						<Button
							type="submit"
							className="w-full"
							disabled={updatePasswordMutation.isPending}
						>
							{updatePasswordMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Updating Password...
								</>
							) : (
								<>
									<Lock className="mr-2 h-4 w-4" />
									Update Password
								</>
							)}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};

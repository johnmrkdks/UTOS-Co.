import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
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
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { UserPlusIcon, EyeIcon, EyeOffIcon, InfoIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useCreateDriverUserMutation } from "../_hooks/query/use-create-driver-user-mutation";

const createDriverUserSchema = z.object({
	email: z.string().email("Invalid email format"),
	name: z.string().min(2, "Name must be at least 2 characters"),
	useDefaultPassword: z.boolean().default(true),
	password: z.string().optional(),
	confirmPassword: z.string().optional(),
}).superRefine((data, ctx) => {
	// Only validate password fields when not using default password
	if (!data.useDefaultPassword) {
		if (!data.password || data.password.length < 8) {
			ctx.addIssue({
				code: z.ZodIssueCode.too_small,
				minimum: 8,
				type: "string",
				inclusive: true,
				message: "Password must be at least 8 characters",
				path: ["password"],
			});
		}
		if (data.password !== data.confirmPassword) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Passwords don't match",
				path: ["confirmPassword"],
			});
		}
	}
});

type CreateDriverUserForm = z.infer<typeof createDriverUserSchema>;

interface CreateDriverUserDialogProps {
	children?: React.ReactNode;
}

export function CreateDriverUserDialog({ children }: CreateDriverUserDialogProps) {
	const [open, setOpen] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const createDriverUserMutation = useCreateDriverUserMutation();

	const form = useForm<CreateDriverUserForm>({
		resolver: zodResolver(createDriverUserSchema),
		defaultValues: {
			email: "",
			name: "",
			useDefaultPassword: true,
			password: "",
			confirmPassword: "",
		},
	});

	const useDefaultPassword = form.watch("useDefaultPassword");

	const onSubmit = async (data: CreateDriverUserForm) => {
		try {
			const submitData = {
				email: data.email,
				name: data.name,
				password: data.useDefaultPassword ? "changeme" : data.password!,
			};
			await createDriverUserMutation.mutateAsync(submitData);
			form.reset();
			setOpen(false);
		} catch (error) {
			// Error is handled by the mutation hook
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button>
						<UserPlusIcon className="h-4 w-4" />
						Create Driver Account
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Create Driver Account</DialogTitle>
					<DialogDescription>
						Create a new user account with driver role. The driver will need to verify their email and complete onboarding before becoming active.
					</DialogDescription>
				</DialogHeader>
				<Form {...form as any}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control as any}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter driver's full name"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control as any}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email Address</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="Enter driver's email"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										This email will be used for login and verification.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						
						<FormField
							control={form.control as any}
							name="useDefaultPassword"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>
											Use default password
										</FormLabel>
										<FormDescription>
											Driver will use "changeme" as the initial password and should change it after first login.
										</FormDescription>
									</div>
								</FormItem>
							)}
						/>

						{!useDefaultPassword && (
							<>
								<FormField
									control={form.control as any}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Custom Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														type={showPassword ? "text" : "password"}
														placeholder="Create a secure password"
														{...field}
													/>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
														onClick={() => setShowPassword(!showPassword)}
													>
														{showPassword ? (
															<EyeOffIcon className="h-4 w-4" />
														) : (
															<EyeIcon className="h-4 w-4" />
														)}
													</Button>
												</div>
											</FormControl>
											<FormDescription>
												Minimum 8 characters. Share this password securely with the driver.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control as any}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirm Password</FormLabel>
											<FormControl>
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="Confirm the password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</>
						)}

						<div className="flex items-start gap-2 rounded-md bg-blue-50 p-3">
							<InfoIcon className="h-4 w-4 text-blue-600 mt-0.5" />
							<div className="text-sm text-blue-800">
								<p className="font-medium">What happens next:</p>
								<ul className="mt-1 list-disc list-inside text-xs space-y-1">
									<li>Driver account will be created as unverified</li>
									<li>Driver can login and verify their email</li>
									<li>Driver completes onboarding process</li>
									<li>Admin approves driver for activation</li>
								</ul>
							</div>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={createDriverUserMutation.isPending}
							>
								{createDriverUserMutation.isPending ? "Creating..." : "Create Driver Account"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
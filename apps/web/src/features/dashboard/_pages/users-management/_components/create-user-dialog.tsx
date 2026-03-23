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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { UserPlusIcon, EyeIcon, EyeOffIcon, InfoIcon, ShieldIcon, UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useCreateUserMutation } from "../_hooks/query/use-create-user-mutation";

const createUserSchema = z.object({
	email: z.string().email("Invalid email format"),
	name: z.string().min(2, "Name must be at least 2 characters"),
	role: z.enum(["user", "admin"]),
	useDefaultPassword: z.boolean().default(true),
	password: z.string().optional(),
	confirmPassword: z.string().optional(),
}).superRefine((data, ctx) => {
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

type CreateUserForm = z.infer<typeof createUserSchema>;

interface CreateUserDialogProps {
	children?: React.ReactNode;
}

export function CreateUserDialog({ children }: CreateUserDialogProps) {
	const [open, setOpen] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const createUserMutation = useCreateUserMutation();

	const form = useForm<CreateUserForm>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			email: "",
			name: "",
			role: "user",
			useDefaultPassword: true,
			password: "",
			confirmPassword: "",
		},
	});

	const useDefaultPassword = form.watch("useDefaultPassword");
	const selectedRole = form.watch("role");

	const onSubmit = async (data: CreateUserForm) => {
		try {
			await createUserMutation.mutateAsync({
				email: data.email,
				name: data.name,
				role: data.role,
				password: data.useDefaultPassword ? "changeme" : data.password!,
			});
			form.reset();
			setOpen(false);
		} catch {
			// Error handled by mutation
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button>
						<UserPlusIcon className="h-4 w-4" />
						Add User
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Add User</DialogTitle>
					<DialogDescription>
						Create a new Client or Admin account. Admins can manage bookings, assign drivers, send invoices, manage inbox, and add packages.
					</DialogDescription>
				</DialogHeader>
				<Form {...form as any}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control as any}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>User Type</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select user type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="user">
												<div className="flex items-center gap-2">
													<UserIcon className="h-4 w-4 shrink-0" />
													<span>Client</span>
												</div>
											</SelectItem>
											<SelectItem value="admin">
												<div className="flex items-center gap-2">
													<ShieldIcon className="h-4 w-4 shrink-0" />
													<span>Admin</span>
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control as any}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter full name" {...field} />
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
										<Input type="email" placeholder="Enter email" {...field} />
									</FormControl>
									<FormDescription>
										Used for login and notifications.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control as any}
							name="useDefaultPassword"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 w-full">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none flex-1 min-w-0">
										<FormLabel>Use default password</FormLabel>
										<FormDescription>
											User will use &quot;changeme&quot; and should change it after first login.
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
											<FormDescription>Minimum 8 characters.</FormDescription>
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

						{selectedRole === "admin" && (
							<div className="flex items-start gap-3 rounded-md bg-blue-50 p-4 border border-blue-100">
								<InfoIcon className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
								<div className="text-sm text-blue-800 min-w-0">
									<p className="font-medium">Admin permissions include:</p>
									<ul className="mt-1.5 list-disc pl-4 space-y-0.5 text-xs">
										<li>Booking management</li>
										<li>Assigning jobs to drivers</li>
										<li>Sending invoices</li>
										<li>Inbox management</li>
										<li>Adding packages</li>
									</ul>
								</div>
							</div>
						)}

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={createUserMutation.isPending}>
								{createUserMutation.isPending ? "Creating..." : "Add User"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

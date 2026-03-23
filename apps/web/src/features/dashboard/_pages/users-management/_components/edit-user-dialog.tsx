import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
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
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateUserCredentialsMutation } from "../_hooks/query/use-update-user-credentials-mutation";

const editUserSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email format"),
	phone: z.string().optional(),
	role: z.enum(["user", "admin", "driver", "super_admin"]),
	password: z
		.union([
			z.string().min(8, "Password must be at least 8 characters"),
			z.literal(""),
		])
		.optional(),
});

type EditUserForm = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
	user: {
		id: string;
		name: string;
		email: string;
		phone?: string | null;
		role: string;
	};
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({
	user,
	open,
	onOpenChange,
}: EditUserDialogProps) {
	const [showPassword, setShowPassword] = useState(false);
	const updateMutation = useUpdateUserCredentialsMutation();

	const form = useForm<EditUserForm>({
		resolver: zodResolver(editUserSchema),
		defaultValues: {
			name: user.name,
			email: user.email,
			phone: user.phone ?? "",
			role: user.role as EditUserForm["role"],
			password: "",
		},
	});

	useEffect(() => {
		if (open && user) {
			form.reset({
				name: user.name,
				email: user.email,
				phone: user.phone ?? "",
				role: user.role as EditUserForm["role"],
				password: "",
			});
		}
	}, [open, user, form]);

	const onSubmit = async (data: EditUserForm) => {
		try {
			await updateMutation.mutateAsync({
				userId: user.id,
				name: data.name,
				email: data.email,
				phone: data.phone || undefined,
				role: data.role,
				...(data.password ? { password: data.password } : {}),
			});
			form.reset();
			onOpenChange(false);
		} catch {
			// Error handled by mutation
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Edit User Credentials</DialogTitle>
					<DialogDescription>
						Update name, email, phone, password, or role for this user.
					</DialogDescription>
				</DialogHeader>
				<Form {...(form as any)}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control as any}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input placeholder="Full name" {...field} />
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
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="Email" {...field} />
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
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone (optional)</FormLabel>
									<FormControl>
										<Input placeholder="Phone number" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control as any}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select role" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="user">Client</SelectItem>
											<SelectItem value="admin">Admin</SelectItem>
											<SelectItem value="driver">Driver</SelectItem>
											<SelectItem value="super_admin">Super Admin</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control as any}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>New Password (optional)</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type={showPassword ? "text" : "password"}
												placeholder="Leave blank to keep current password"
												{...field}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
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
										Minimum 8 characters. Leave blank to keep current password.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={updateMutation.isPending}>
								{updateMutation.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

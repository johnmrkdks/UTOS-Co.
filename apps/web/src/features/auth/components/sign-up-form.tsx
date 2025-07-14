import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { signUpSchema } from "../schema/sign-up-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { SignInWithOAuth } from "./sign-in-with-oauth";
import { SignUpWithOAuth } from "./sign-up-with-oauth";
import { InputPassword } from "@/components/input-password";

type FormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();

	const form = useForm({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
	});

	if (isPending) {
		return <Loader />;
	}

	const onSubmit = async (data: FormValues) => {
		await authClient.signUp.email(
			{
				email: data.email,
				password: data.password,
				name: data.name,
			},
			{
				onSuccess: () => {
					navigate({
						to: "/",
					});
					toast.success("Sign up successful");
				},
				onError: (error) => {
					toast.error(error.error.message);
				},
			},
		);
	};

	return (
		<div className="flex flex-col gap-4 mx-auto w-full max-w-md">
			<h1 className="text-center text-3xl font-bold">Sign Up</h1>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<FormField
							name="name"
							render={({ field }) => (
								<FormItem className="space-y-2">
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											{...field}
											className="bg-background"
											placeholder="Enter your name..."
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div>
						<FormField
							name="email"
							render={({ field }) => (
								<FormItem className="space-y-2">
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											{...field}
											className="bg-background"
											placeholder="Enter your email..."
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div>
						<FormField
							name="password"
							render={({ field }) => (
								<FormItem className="space-y-2">
									<FormLabel>Password</FormLabel>
									<FormControl>
										<InputPassword
											{...field}
											className="bg-background"
											placeholder="Enter your password..."
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={!form.formState.isValid}
					>
						{false ? "Submitting..." : "Sign Up"}
					</Button>
				</form>
			</Form>
			<div className="flex flex-col gap-2 text-center">
				<h2 className="text-center text-xs text-muted-foreground font-medium">
					Or sign up with
				</h2>
				<SignUpWithOAuth />
			</div>
		</div>
	);
}

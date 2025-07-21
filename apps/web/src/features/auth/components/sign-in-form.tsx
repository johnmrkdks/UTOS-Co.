import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { signInSchema } from "../schema/sign-in-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { InputPassword } from "@/components/input-password";
import { SignInWithOAuth } from "./sign-in-with-oauth";

type FormValues = z.infer<typeof signInSchema>;

export default function SignInForm() {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();

	const form = useForm({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	if (isPending) {
		return <Loader />;
	}

	const onSubmit = async (data: FormValues) => {
		await authClient.signIn.email(
			{
				email: data.email,
				password: data.password,
			},
			{
				onSuccess: (data) => {
					console.log(data);
					navigate({
						to: "/",
					});
					toast.success("Sign in successful");
				},
				onError: (error) => {
					toast.error(error.error.message);
				},
			},
		);
	};

	return (
		<div className="flex flex-col gap-4 mx-auto w-full max-w-md">
			<h1 className="text-center text-3xl font-bold">Sign In</h1>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
											placeholder="your@email.com"
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
										<InputPassword {...field} className="bg-background" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={!form.formState.isValid || isPending}
					>
						{isPending ? "Signing in..." : "Sign in"}
					</Button>
				</form>
			</Form>

			<div className="flex flex-col gap-2 text-center">
				<h2 className="text-center text-xs text-muted-foreground font-medium">
					Or sign in with
				</h2>
				<SignInWithOAuth />
			</div>
		</div>
	);
}

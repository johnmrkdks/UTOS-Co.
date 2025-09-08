import { Loader } from "@/components/loader";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { authClient } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { InputPassword } from "@workspace/ui/components/input-password";
import { SignInWithOAuth } from "./sign-in-with-oauth";
import { signInSchema } from "@/features/auth/_schemas/sign-in-schema";
import { useSignInMutation } from "@/features/auth/_hooks/query/use-sign-in-mutation";
import { cn } from "@workspace/ui/lib/utils";

type SignInFromProps = {
	className?: string;
};

type FormValues = z.infer<typeof signInSchema>;

export function SignInForm({ className, ...props }: SignInFromProps) {
	const navigate = useNavigate({
		from: "/",
	});
	const search = useSearch({ strict: false }) as any;
	const { isPending } = authClient.useSession();
	const mutation = useSignInMutation();

	const form = useForm({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
		disabled: mutation.isPending,
	});

	if (isPending) {
		return <Loader />;
	}

	const onSubmit = (data: FormValues) => {
		mutation.mutate(data, {
			onSuccess: () => {
				const redirectPath = search.redirect || "/";
				navigate({
					to: redirectPath,
				});
			},
		});
	};

	return (
		<div className={cn("flex flex-col gap-4 mx-auto w-full max-w-md", className)} {...props}>
			<h1 className="text-center text-2xl md:text-3xl font-bold">Sign In</h1>

			<Form {...form as any}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<FormField
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											{...field}
											className="bg-background text-xs md:text-sm"
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
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<InputPassword {...field} className="bg-background text-xs md:text-sm" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={!form.formState.isValid || mutation.isPending}
						loading={mutation.isPending}
					>
						{mutation.isPending ? "Signing in..." : "Sign in"}
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

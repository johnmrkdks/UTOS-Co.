import { Loader } from "@/components/loader";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { authClient } from "@/lib/auth-client";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { signUpSchema } from "@/features/auth/_schemas/sign-up-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { SignUpWithOAuth } from "./sign-up-with-oauth";
import { InputPassword } from "@workspace/ui/components/input-password";
import { useSignUpMutation } from "@/features/auth/_hooks/query/use-sign-up-mutation";
import { cn } from "@workspace/ui/lib/utils";

type SignUpFromProps = {
	className?: string;
};

type FormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm({ className, ...props }: SignUpFromProps) {
	const navigate = useNavigate({
		from: "/",
	});
	const search = useSearch({ strict: false }) as any;
	const { isPending } = authClient.useSession();
	const mutation = useSignUpMutation();

	const form = useForm({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		disabled: mutation.isPending,
	});

	if (isPending) {
		return <Loader />;
	}

	const onSubmit = async (data: FormValues) => {
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
			<h1 className="text-center text-2xl md:text-3xl font-bold">Sign Up</h1>

			<Form {...form as any}>
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
											className="bg-background text-xs md:text-sm"
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
											className="bg-background text-xs md:text-sm"
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
											className="bg-background text-xs md:text-sm"
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
						disabled={!form.formState.isValid || mutation.isPending}
						loading={mutation.isPending}
					>
						{mutation.isPending ? "Submitting..." : "Sign Up"}
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

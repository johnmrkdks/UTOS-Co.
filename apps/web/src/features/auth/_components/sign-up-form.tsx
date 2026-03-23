import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { InputPassword } from "@workspace/ui/components/input-password";
import { cn } from "@workspace/ui/lib/utils";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Loader } from "@/components/loader";
import { useSignUpMutation } from "@/features/auth/_hooks/query/use-sign-up-mutation";
import { signUpSchema } from "@/features/auth/_schemas/sign-up-schema";
import { authClient } from "@/lib/auth-client";
import { SignUpWithOAuth } from "./sign-up-with-oauth";

type SignUpFromProps = {
	className?: string;
};

type FormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm({ className, ...props }: SignUpFromProps) {
	const navigate = useNavigate({
		from: "/",
	});
	const search = useSearch({ strict: false }) as any;
	const queryClient = useQueryClient();
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
			onSuccess: async () => {
				// Invalidate session so destination page gets fresh data
				await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
				const redirectPath = search.redirect || "/";
				navigate({
					to: redirectPath,
				});
			},
		});
	};

	return (
		<div
			className={cn("mx-auto flex w-full max-w-md flex-col gap-4", className)}
			{...props}
		>
			<h1 className="text-center font-bold text-2xl md:text-3xl">Sign Up</h1>

			<Form {...(form as any)}>
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
				<h2 className="text-center font-medium text-muted-foreground text-xs">
					Or sign up with
				</h2>
				<SignUpWithOAuth />
			</div>
		</div>
	);
}

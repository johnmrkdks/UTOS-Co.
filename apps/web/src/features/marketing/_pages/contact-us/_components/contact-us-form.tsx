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
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateContactMessageMutation } from "../../../_hooks/query/use-create-contact-message-mutation";
import { Loader2 } from "lucide-react";

type ContactUsFormProps = {
	className?: string;
};

const formSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name is too long"),
	email: z.string().email("Invalid email address").max(255, "Email is too long"),
	message: z.string().min(1, "Message is required").max(2000, "Message is too long"),
});

type FormData = z.infer<typeof formSchema>;

export function ContactUsForm({ className, ...props }: ContactUsFormProps) {
	const form = useForm<FormData>({
		defaultValues: {
			name: "",
			email: "",
			message: "",
		},
		resolver: zodResolver(formSchema),
	});

	const createContactMessageMutation = useCreateContactMessageMutation();

	const handleSubmit = (data: FormData) => {
		createContactMessageMutation.mutate(data, {
			onSuccess: () => {
				form.reset();
			},
		});
	};

	return (
		<div {...props} className={cn("flex flex-col gap-4", className)}>
			<h1 className="text-2xl font-bold">Contact Us</h1>
			<Form {...form as any}>
				<form
					className="flex flex-col gap-6"
					onSubmit={form.handleSubmit(handleSubmit)}>
					<div className="flex flex-col gap-4">
						<FormField
							control={form.control as any}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Enter your name" />
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
										<Input {...field} placeholder="your@email.com" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control as any}
							name="message"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Question</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Enter question or feedback"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="w-1/2">
						<Button
							type="submit"
							variant="dark"
							className="w-full rounded-xl"
							disabled={createContactMessageMutation.isPending}
						>
							{createContactMessageMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Sending...
								</>
							) : (
								"Submit"
							)}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

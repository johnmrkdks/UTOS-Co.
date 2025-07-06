"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

type ContactUsFormProps = {
	className?: string;
};

const formSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	message: z.string().min(10),
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

	const handleSubmit = (data: FormData) => {
		console.log(data);
	};

	return (
		<div {...props} className={cn("flex flex-col gap-4", className)}>
      <h1 className="text-2xl font-bold">Contact Us</h1>
			<Form {...form}>
				<form 
          className="flex flex-col gap-6"
          onSubmit={form.handleSubmit(handleSubmit)}>
					<div className="flex flex-col gap-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Enter your name" />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input {...field} placeholder="your@email.com" />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
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
								</FormItem>
							)}
						/>
					</div>
          <div className="w-1/2">
            <Button type="submit" variant="dark" className="w-full rounded-xl">Submit</Button>
          </div>
				</form>
			</Form>
		</div>
	);
}

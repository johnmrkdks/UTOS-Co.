import { cn } from "@/lib/utils";
import { ContactUsForm } from "./contact-us-form";
import { ContactUsMap } from "./map";

type ContactUsProps = {
	className?: string;
};

export function ContactUs({ className, ...props }: ContactUsProps) {
	return (
		<div
			{...props}
			className={cn("w-fit bg-background flex gap-12 border rounded-2xl")}
		>
			<ContactUsForm className="w-80 p-6" />
			<ContactUsMap className="h-96 w-96 rounded-xl" />
		</div>
	);
}

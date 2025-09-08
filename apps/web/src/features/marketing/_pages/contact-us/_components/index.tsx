import { cn } from "@workspace/ui/lib/utils";
import { ContactHeroSection } from "./contact-hero-section";
import { ContactMethodsSection } from "./contact-methods-section";
import { OfficeDetailsSection } from "./office-details-section";

type ContactUsProps = {
	className?: string;
};

export function ContactUs({ className, ...props }: ContactUsProps) {
	return (
		<div className={cn("", className)} {...props}>
			<ContactHeroSection />
			<ContactMethodsSection />
			<OfficeDetailsSection />
		</div>
	);
}

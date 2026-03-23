import { cn } from "@workspace/ui/lib/utils";
import logo from "@/assets/logo.webp";

type LogoProps = {
	className?: string;
};

export function Logo({ className }: LogoProps) {
	return (
		<img
			src={logo}
			alt="Down Under Chauffeur Logo"
			className={cn("h-10 w-16 rounded-xl md:h-12 md:w-20", className)}
		/>
	);
}

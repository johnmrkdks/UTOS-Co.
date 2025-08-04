import logo from "@/assets/logo.webp";
import { cn } from "@workspace/ui/lib/utils";

type LogoProps = {
	className?: string;
};

export function Logo({ className }: LogoProps) {
	return (
		<img
			src={logo}
			alt="Down Under Chauffeur Logo"
			className={cn("rounded-xl h-12 w-20", className)}
		/>
	);
}
